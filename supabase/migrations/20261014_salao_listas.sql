-- Portal FH Operacoes: mais duas listas de contato (uma visita e aniversariantes).
-- Rodar no SQL Editor do Supabase DEPOIS de 20261013_salao_retorno.sql.
-- Idempotente: pode rodar de novo sem quebrar e sem apagar contatos ja registrados.

-- 1. Motivo novo no registro de chamadas ------------------------------------------

alter table public.salao_contatos drop constraint if exists salao_contatos_motivo_check;
alter table public.salao_contatos add constraint salao_contatos_motivo_check
  check (motivo in ('retorno','aniversario','uma_visita','outro'));

-- 2. Sumidas: a mesma lista de antes, agora com o dia e o mes do aniversario ---------
-- (as tres views ficam com as mesmas colunas)

create or replace view public.salao_retorno with (security_invoker = true) as
select c.gendo_codigo, c.nome, c.telefone, c.visitas, c.ultima_visita, c.nao_contatar,
       u.id as contato_id, u.feito_em as ultimo_contato, u.resultado as ultimo_resultado, u.feito_por as contato_por,
       c.nasc_dia, c.nasc_mes
  from public.salao_clientes c
  left join lateral (
    select k.id, k.feito_em, k.resultado, k.feito_por
      from public.salao_contatos k
     where k.cliente_codigo = c.gendo_codigo and k.motivo = 'retorno'
     order by k.feito_em desc
     limit 1
  ) u on true
 where c.visitas >= 5
   and c.ultima_visita < (now() at time zone 'America/Sao_Paulo')::date - 60;

-- 3. Uma visita: veio uma vez, ha mais de 45 dias e menos de um ano, e nao voltou ----

create or replace view public.salao_uma_visita with (security_invoker = true) as
select c.gendo_codigo, c.nome, c.telefone, c.visitas, c.ultima_visita, c.nao_contatar,
       u.id as contato_id, u.feito_em as ultimo_contato, u.resultado as ultimo_resultado, u.feito_por as contato_por,
       c.nasc_dia, c.nasc_mes
  from public.salao_clientes c
  left join lateral (
    select k.id, k.feito_em, k.resultado, k.feito_por
      from public.salao_contatos k
     where k.cliente_codigo = c.gendo_codigo and k.motivo = 'uma_visita'
     order by k.feito_em desc
     limit 1
  ) u on true
 where c.visitas = 1
   and c.ultima_visita < (now() at time zone 'America/Sao_Paulo')::date - 45
   and c.ultima_visita >= (now() at time zone 'America/Sao_Paulo')::date - 365;

-- 4. Aniversariantes do mes corrente; o contato so vale se foi feito neste ano -------

create or replace view public.salao_aniversariantes with (security_invoker = true) as
select c.gendo_codigo, c.nome, c.telefone, c.visitas, c.ultima_visita, c.nao_contatar,
       u.id as contato_id, u.feito_em as ultimo_contato, u.resultado as ultimo_resultado, u.feito_por as contato_por,
       c.nasc_dia, c.nasc_mes
  from public.salao_clientes c
  left join lateral (
    select k.id, k.feito_em, k.resultado, k.feito_por
      from public.salao_contatos k
     where k.cliente_codigo = c.gendo_codigo and k.motivo = 'aniversario'
       and k.feito_em >= date_trunc('year', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'
     order by k.feito_em desc
     limit 1
  ) u on true
 where c.nasc_mes = extract(month from (now() at time zone 'America/Sao_Paulo'))::int;

revoke all on public.salao_retorno, public.salao_uma_visita, public.salao_aniversariantes from anon;

-- Conferencia: quantas clientes ha em cada lista.
select (select count(*) from public.salao_retorno) as sumidas,
       (select count(*) from public.salao_uma_visita) as uma_visita,
       (select count(*) from public.salao_aniversariantes) as aniversariantes;
