-- Cupons no checkout. Rodar no SQL Editor do Supabase DEPOIS de 20261006_pagamentos.sql.
-- Idempotente: pode rodar de novo sem quebrar.
--
-- Tipos de cupom (coluna coupons.tipo):
--   percentual   -> valor = % de desconto sobre os produtos (ex: 10 = 10%)
--   valor        -> valor = reais de desconto sobre os produtos (ex: 20 = R$ 20)
--   frete_gratis -> zera o frete (valor ignorado)
-- Nomes antigos equivalentes tambem funcionam (percent, %, fixo, valor_fixo, frete).

-- 1. Calculo do desconto --------------------------------------------------------

create or replace function public.fn_cupom_calcular(
  p_codigo text,
  p_subtotal numeric,
  p_frete numeric default 0
) returns table (valido boolean, codigo text, tipo text, desconto numeric, motivo text)
language plpgsql stable as $$
declare
  c public.coupons%rowtype;
  t text;
  d numeric := 0;
begin
  select * into c from public.coupons
   where upper(trim(public.coupons.codigo)) = upper(trim(p_codigo))
   order by ativo desc
   limit 1;

  if not found then
    return query select false, null::text, null::text, 0::numeric, 'Cupom não encontrado.'; return;
  end if;
  if not c.ativo then
    return query select false, c.codigo, c.tipo, 0::numeric, 'Este cupom não está ativo.'; return;
  end if;
  if c.inicio is not null and now() < c.inicio then
    return query select false, c.codigo, c.tipo, 0::numeric, 'Este cupom ainda não começou a valer.'; return;
  end if;
  if c.fim is not null and now() > c.fim then
    return query select false, c.codigo, c.tipo, 0::numeric, 'Este cupom já expirou.'; return;
  end if;
  if c.usos_max is not null and c.usos >= c.usos_max then
    return query select false, c.codigo, c.tipo, 0::numeric, 'Este cupom já atingiu o limite de usos.'; return;
  end if;
  if p_subtotal < coalesce(c.minimo_pedido, 0) then
    return query select false, c.codigo, c.tipo, 0::numeric,
      format('Este cupom vale para compras a partir de R$ %s.', replace(to_char(c.minimo_pedido, 'FM999990.00'), '.', ',')); return;
  end if;

  t := lower(trim(c.tipo));
  if t in ('percentual', 'percent', 'porcentagem', '%', 'pct') then
    d := round(p_subtotal * least(greatest(c.valor, 0), 100) / 100, 2);
    t := 'percentual';
  elsif t in ('frete_gratis', 'frete', 'frete gratis', 'frete_gratuito') then
    d := round(greatest(coalesce(p_frete, 0), 0), 2);
    t := 'frete_gratis';
  else
    d := round(least(greatest(c.valor, 0), p_subtotal), 2);
    t := 'valor';
  end if;

  return query select true, c.codigo, t, d,
    case when t = 'frete_gratis' and d = 0 then 'Frete grátis vale para envio pelos Correios.' end;
end $$;

revoke all on function public.fn_cupom_calcular(text, numeric, numeric) from public, anon, authenticated;
grant execute on function public.fn_cupom_calcular(text, numeric, numeric) to service_role;

-- 2. Confirmar pagamento passa a contar o uso do cupom --------------------------
-- (mesma funcao de 20261006, com o passo do cupom no final; conta so 1x por pedido)

create or replace function public.fn_confirmar_pagamento(
  p_order_id uuid,
  p_gateway_payment_id text default null,
  p_parcelas int default null,
  p_raw jsonb default null
) returns text language plpgsql as $$
declare
  v_local uuid;
  v_cupom text;
  it record;
begin
  perform set_config('fh.via_pagamento', '1', true);

  update public.orders set status = 'pago'
   where id = p_order_id and status = 'aguardando_pagamento'
   returning cupom_codigo into v_cupom;
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

  if v_cupom is not null then
    update public.coupons set usos = usos + 1 where upper(trim(codigo)) = upper(trim(v_cupom));
  end if;

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

revoke all on function public.fn_confirmar_pagamento(uuid, text, int, jsonb) from public, anon, authenticated;
grant execute on function public.fn_confirmar_pagamento(uuid, text, int, jsonb) to service_role;
