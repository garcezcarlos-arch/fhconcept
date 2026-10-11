-- Portal FH Operacoes: cadastros do salao importados do Gendo (arquivos CSV).
-- Rodar no SQL Editor do Supabase DEPOIS de 20261011_salao_indicadores.sql.
-- Idempotente: pode rodar de novo sem quebrar e sem apagar o que ja foi importado.
--
-- De cliente entram so nome, telefone, aniversario, visitas e ultima visita.
-- CPF, endereco, e-mail, comentarios e observacoes nao sao guardados.

-- 1. Tabelas -------------------------------------------------------------------

create table if not exists public.salao_clientes (
  gendo_codigo int primary key,
  nome text not null,
  telefone text,                                  -- so digitos, com DDI (ex.: 5547999990000)
  nasc_dia smallint check (nasc_dia between 1 and 31),
  nasc_mes smallint check (nasc_mes between 1 and 12),
  nasc_ano smallint check (nasc_ano between 1900 and 2100),
  visitas int not null default 0 check (visitas >= 0),
  ultima_visita date,
  origem text not null default 'clientes' check (origem in ('clientes','agenda')),  -- de qual arquivo veio o cadastro
  atualizado_em timestamptz not null default now()
);

create table if not exists public.salao_agendamentos (
  id bigint generated always as identity primary key,
  cliente_codigo int,                             -- sem FK: a agenda pode citar cliente ainda nao importada
  data date not null,
  hora_inicio time,
  hora_fim time,
  status text not null,                           -- como vem do Gendo: Novo Agendamento, Confirmado, Cancelado...
  categoria text,
  servico text,
  profissional text
);
create index if not exists salao_agendamentos_data_idx on public.salao_agendamentos (data);
create index if not exists salao_agendamentos_cliente_idx on public.salao_agendamentos (cliente_codigo);

create table if not exists public.salao_comandas (
  numero int primary key,
  data date not null,
  valor numeric(12,2) not null default 0,         -- bruto; pode ser negativo (estorno)
  desconto numeric(12,2) not null default 0,
  saldo numeric(12,2) not null default 0,
  status text not null,                           -- Fechada | Aberta
  pagamento text,
  servicos text,
  atualizado_em timestamptz not null default now()
);
create index if not exists salao_comandas_data_idx on public.salao_comandas (data);

create table if not exists public.salao_servicos (
  gendo_codigo int primary key,
  nome text not null,
  categoria text,
  preco numeric(10,2) not null default 0,
  comissao numeric(10,2),
  duracao_min int check (duracao_min >= 0),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.salao_produtos (
  gendo_codigo int primary key,
  nome text not null,
  categoria text,
  preco numeric(10,2) not null default 0,
  custo numeric(10,2),
  quantidade int,                                 -- saldo no Gendo; pode estar negativo
  comissao numeric(10,2),
  atualizado_em timestamptz not null default now()
);

-- 2. Acesso: so administradoras ------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['salao_clientes','salao_agendamentos','salao_comandas','salao_servicos','salao_produtos'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || ' admin', t);
    execute format(
      'create policy %I on public.%I for all
         using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel = ''admin''))
         with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel = ''admin''))',
      t || ' admin', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- 3. Agenda: troca o periodo inteiro de uma vez --------------------------------
-- O arquivo da agenda nao traz um codigo por agendamento, entao reimportar um
-- periodo apaga o que havia nele e grava o arquivo novo, tudo ou nada.

create or replace function public.fn_salao_importar_agenda(p_de date, p_ate date, p_linhas jsonb)
returns int language plpgsql as $$
declare n int;
begin
  if p_de is null or p_ate is null or p_ate < p_de then
    raise exception 'periodo invalido';
  end if;

  delete from public.salao_agendamentos where data between p_de and p_ate;

  insert into public.salao_agendamentos (cliente_codigo, data, hora_inicio, hora_fim, status, categoria, servico, profissional)
  select x.cliente, x.data, x.inicio, x.fim, x.status, nullif(x.categoria, ''), nullif(x.servico, ''), nullif(x.profissional, '')
    from jsonb_to_recordset(p_linhas)
      as x(cliente int, data date, inicio time, fim time, status text, categoria text, servico text, profissional text)
   where x.data between p_de and p_ate and coalesce(x.status, '') <> '';

  get diagnostics n = row_count;
  return n;
end $$;

-- 4. Recalculo dos numeros a partir do que foi importado -----------------------
-- p_ativas: primeiros nomes das profissionais ativas; as demais somam em "Outras".

create or replace function public.fn_salao_recalcular(p_ativas text[] default array['Fernanda','Juliana','Laura'])
returns jsonb language plpgsql as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_mes_atual date := date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date;
  v_tem_comandas boolean := exists (select 1 from public.salao_comandas);
  v_meses int := 0;
  v_clientes int;
  v_base int;
  v_abertas int;
  v_retrato boolean := false;
begin
  -- 4.1 visitas e ultima visita: agendamento passado que nao foi cancelado nem falta
  with v as (
    select cliente_codigo, count(*)::int as n, max(data) as ultima
      from public.salao_agendamentos
     where cliente_codigo is not null and data <= v_hoje and status not in ('Cancelado', 'Cliente Ausente')
     group by 1
  )
  update public.salao_clientes c
     set visitas = case when c.origem = 'agenda' then v.n else c.visitas end,
         ultima_visita = case when c.origem = 'agenda' then v.ultima else greatest(c.ultima_visita, v.ultima) end,
         atualizado_em = now()
    from v
   where v.cliente_codigo = c.gendo_codigo
     and (c.origem = 'agenda' or c.ultima_visita is null or c.ultima_visita < v.ultima);

  -- 4.2 numeros por mes, so de meses ja fechados
  with a as (
    select date_trunc('month', data)::date as mes,
           count(*)::int as agend,
           (count(*) filter (where status = 'Cancelado'))::int as canc,
           (count(*) filter (where status = 'Cliente Ausente'))::int as faltas
      from public.salao_agendamentos where data < v_mes_atual group by 1
  ), p as (
    select mes, jsonb_object_agg(nome, n) as por
      from (
        select date_trunc('month', data)::date as mes,
               case when split_part(coalesce(profissional, ''), ' ', 1) = any (p_ativas)
                    then split_part(profissional, ' ', 1) else 'Outras' end as nome,
               count(*)::int as n
          from public.salao_agendamentos where data < v_mes_atual group by 1, 2
      ) s group by mes
  ), c as (
    select date_trunc('month', data)::date as mes,
           (count(*) filter (where status = 'Fechada'))::int as fechadas,
           coalesce(sum(valor) filter (where status = 'Fechada'), 0) as bruto,
           coalesce(sum(desconto) filter (where status = 'Fechada'), 0) as descontos
      from public.salao_comandas where data < v_mes_atual group by 1
  )
  insert into public.salao_mensal as m
    (mes, agendamentos, cancelados, faltas, por_profissional, comandas_fechadas, valor_bruto, descontos, origem, atualizado_em)
  select a.mes, a.agend, a.canc, a.faltas, coalesce(p.por, '{}'::jsonb),
         coalesce(c.fechadas, 0), greatest(coalesce(c.bruto, 0), 0), greatest(coalesce(c.descontos, 0), 0), 'csv', now()
    from a left join p using (mes) left join c using (mes)
  on conflict (mes) do update set
    agendamentos = excluded.agendamentos,
    cancelados = excluded.cancelados,
    faltas = excluded.faltas,
    por_profissional = excluded.por_profissional,
    -- sem arquivo de comandas importado, os numeros de comanda que ja existiam ficam
    comandas_fechadas = case when v_tem_comandas then excluded.comandas_fechadas else m.comandas_fechadas end,
    valor_bruto = case when v_tem_comandas then excluded.valor_bruto else m.valor_bruto end,
    descontos = case when v_tem_comandas then excluded.descontos else m.descontos end,
    origem = 'csv',
    atualizado_em = now();
  get diagnostics v_meses = row_count;

  -- 4.3 retrato de hoje, so quando a base de clientes esta (quase) completa:
  -- com um arquivo parcial o total ficaria menor que o real
  select count(*) into v_clientes from public.salao_clientes;
  select clientes_total into v_base from public.salao_retrato order by data desc limit 1;
  select comandas_abertas into v_abertas from public.salao_retrato order by data desc limit 1;
  if v_tem_comandas then
    select count(*) into v_abertas from public.salao_comandas where status = 'Aberta';
  end if;

  if v_clientes > 0 and (v_base is null or v_clientes >= v_base * 0.9) then
    insert into public.salao_retrato as r
      (data, clientes_total, clientes_90d, clientes_mais_90d, clientes_sem_visita, clientes_sumidas, comandas_abertas, origem, atualizado_em)
    select v_hoje, count(*),
           count(*) filter (where ultima_visita >= v_hoje - 90),
           count(*) filter (where ultima_visita < v_hoje - 90),
           count(*) filter (where ultima_visita is null),
           count(*) filter (where visitas >= 5 and ultima_visita < v_hoje - 60),
           coalesce(v_abertas, 0), 'csv', now()
      from public.salao_clientes
    on conflict (data) do update set
      clientes_total = excluded.clientes_total,
      clientes_90d = excluded.clientes_90d,
      clientes_mais_90d = excluded.clientes_mais_90d,
      clientes_sem_visita = excluded.clientes_sem_visita,
      clientes_sumidas = excluded.clientes_sumidas,
      comandas_abertas = excluded.comandas_abertas,
      origem = 'csv',
      atualizado_em = now();
    v_retrato := true;
  elsif v_tem_comandas then
    -- base parcial: atualiza so as comandas em aberto do retrato mais recente
    update public.salao_retrato set comandas_abertas = v_abertas, atualizado_em = now()
     where data = (select max(data) from public.salao_retrato);
  end if;

  return jsonb_build_object('meses', v_meses, 'clientes', v_clientes, 'retrato', v_retrato);
end $$;

revoke all on function public.fn_salao_importar_agenda(date, date, jsonb) from public, anon, authenticated;
revoke all on function public.fn_salao_recalcular(text[]) from public, anon, authenticated;
grant execute on function public.fn_salao_importar_agenda(date, date, jsonb) to service_role;
grant execute on function public.fn_salao_recalcular(text[]) to service_role;

-- Conferencia: as cinco tabelas existem (zeradas ate a primeira importacao).
select
  (select count(*) from public.salao_clientes) as clientes,
  (select count(*) from public.salao_agendamentos) as agendamentos,
  (select count(*) from public.salao_comandas) as comandas,
  (select count(*) from public.salao_servicos) as servicos,
  (select count(*) from public.salao_produtos) as produtos;
