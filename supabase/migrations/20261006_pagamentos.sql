-- Pagamento ponta a ponta: log de webhook, confirmacao/estorno atomicos e
-- maquina de estados do pedido. Rodar no SQL Editor do Supabase.
-- Idempotente: pode rodar de novo sem quebrar.

-- 1. Log bruto de toda notificacao recebida (depuracao e auditoria) ----------

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  gateway text not null,                 -- mercadopago
  tipo text,                             -- payment, merchant_order...
  recurso_id text,                       -- id do pagamento no gateway
  assinatura_ok boolean,                 -- null = segredo nao configurado
  payload jsonb,
  resultado text,                        -- processado | ignorado | erro | assinatura_invalida
  erro text,
  created_at timestamptz not null default now()
);
create index if not exists payment_events_recurso_idx on public.payment_events(gateway, recurso_id);
create index if not exists payment_events_data_idx on public.payment_events(created_at desc);

alter table public.payment_events enable row level security;
-- sem policy: so service role le e grava

-- 2. Um pagamento do gateway nunca vale para dois registros -----------------

create unique index if not exists payments_gateway_payment_uidx
  on public.payments(gateway, gateway_payment_id) where gateway_payment_id is not null;

create unique index if not exists inventory_local_variante_uidx
  on public.inventory(location_id, variant_id);

-- 3. Maquina de estados do pedido -------------------------------------------
-- 'pago' e 'estornado' so entram pelas funcoes abaixo (que mexem no estoque).

create or replace function public.fn_orders_transicao()
returns trigger language plpgsql as $$
declare
  via_pagamento boolean := coalesce(current_setting('fh.via_pagamento', true), '') = '1';
  permitido boolean;
begin
  if new.status = old.status then return new; end if;

  if new.status in ('pago', 'estornado') and not via_pagamento then
    raise exception 'O status % so muda pelo fluxo de pagamento (use Confirmar pagamento ou Estornar).', new.status
      using errcode = 'check_violation';
  end if;

  permitido := case old.status
    when 'aguardando_pagamento' then new.status in ('pago', 'cancelado')
    when 'pago'            then new.status in ('em_separacao', 'pronto_retirada', 'enviado', 'estornado')
    when 'em_separacao'    then new.status in ('pronto_retirada', 'enviado', 'estornado')
    when 'pronto_retirada' then new.status in ('concluido', 'estornado')
    when 'enviado'         then new.status in ('concluido', 'estornado')
    when 'concluido'       then new.status in ('estornado')
    else false              -- cancelado e estornado sao finais
  end;

  if not permitido then
    raise exception 'Transicao de pedido invalida: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_orders_transicao on public.orders;
create trigger trg_orders_transicao
  before update of status on public.orders
  for each row execute function public.fn_orders_transicao();

-- 4. Confirmar pagamento: atomico e idempotente -----------------------------
-- O UPDATE com "where status = 'aguardando_pagamento'" trava a linha: se dois
-- webhooks chegarem juntos, so um passa e o estoque baixa uma vez.

create or replace function public.fn_confirmar_pagamento(
  p_order_id uuid,
  p_gateway_payment_id text default null,
  p_parcelas int default null,
  p_raw jsonb default null
) returns text language plpgsql as $$
declare
  v_local uuid;
  it record;
begin
  perform set_config('fh.via_pagamento', '1', true);

  update public.orders set status = 'pago'
   where id = p_order_id and status = 'aguardando_pagamento';
  if not found then
    return case when exists (select 1 from public.orders where id = p_order_id)
                then 'ja_processado' else 'nao_encontrado' end;
  end if;

  update public.payments set
    status = 'aprovado',
    pago_em = now(),
    gateway_payment_id = coalesce(p_gateway_payment_id, gateway_payment_id),
    parcelas = coalesce(p_parcelas, parcelas),
    raw = case when p_raw is null then raw
               else coalesce(raw, '{}'::jsonb) || jsonb_build_object('pagamento', p_raw) end
  where order_id = p_order_id;

  select id into v_local from public.stock_locations where vendavel order by id limit 1;
  if v_local is null then return 'pago_sem_estoque'; end if;

  for it in select variant_id, quantidade from public.order_items where order_id = p_order_id loop
    insert into public.inventory_movements (location_id, variant_id, tipo, quantidade, order_id, observacao)
    values (v_local, it.variant_id, 'venda', -it.quantidade, p_order_id, 'venda pelo site');

    insert into public.inventory (location_id, variant_id, quantidade)
    values (v_local, it.variant_id, -it.quantidade)
    on conflict (location_id, variant_id)
      do update set quantidade = public.inventory.quantidade + excluded.quantidade;
  end loop;

  return 'pago';
end $$;

-- 5. Estorno / chargeback: devolve ao estoque o que nao saiu do salao --------

create or replace function public.fn_estornar_pedido(
  p_order_id uuid,
  p_status_pagamento public.pagamento_status default 'estornado',
  p_raw jsonb default null
) returns text language plpgsql as $$
declare
  v_anterior public.order_status;
  v_local uuid;
  it record;
begin
  perform set_config('fh.via_pagamento', '1', true);

  select status into v_anterior from public.orders where id = p_order_id for update;
  if v_anterior is null then return 'nao_encontrado'; end if;
  if v_anterior in ('estornado', 'cancelado') then return 'ja_processado'; end if;

  if v_anterior = 'aguardando_pagamento' then
    -- nunca foi pago: so cancela
    update public.orders set status = 'cancelado' where id = p_order_id;
    update public.payments set status = 'recusado' where order_id = p_order_id;
    return 'cancelado';
  end if;

  update public.orders set status = 'estornado' where id = p_order_id;
  update public.payments set
    status = p_status_pagamento,
    raw = case when p_raw is null then raw
               else coalesce(raw, '{}'::jsonb) || jsonb_build_object('estorno', p_raw) end
  where order_id = p_order_id;

  -- mercadoria ainda no salao volta ao estoque; enviada/entregue nao
  if v_anterior in ('pago', 'em_separacao', 'pronto_retirada') then
    select id into v_local from public.stock_locations where vendavel order by id limit 1;
    if v_local is not null then
      for it in select variant_id, quantidade from public.order_items where order_id = p_order_id loop
        insert into public.inventory_movements (location_id, variant_id, tipo, quantidade, order_id, observacao)
        values (v_local, it.variant_id, 'devolucao', it.quantidade, p_order_id, 'estorno do pedido');

        insert into public.inventory (location_id, variant_id, quantidade)
        values (v_local, it.variant_id, it.quantidade)
        on conflict (location_id, variant_id)
          do update set quantidade = public.inventory.quantidade + excluded.quantidade;
      end loop;
      return 'estornado_com_devolucao';
    end if;
  end if;

  return 'estornado';
end $$;

-- 6. Funcoes so para o servidor (service role) ------------------------------

revoke all on function public.fn_confirmar_pagamento(uuid, text, int, jsonb) from public, anon, authenticated;
revoke all on function public.fn_estornar_pedido(uuid, public.pagamento_status, jsonb) from public, anon, authenticated;
grant execute on function public.fn_confirmar_pagamento(uuid, text, int, jsonb) to service_role;
grant execute on function public.fn_estornar_pedido(uuid, public.pagamento_status, jsonb) to service_role;
