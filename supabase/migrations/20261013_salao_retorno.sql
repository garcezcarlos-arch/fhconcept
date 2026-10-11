-- Portal FH Operacoes: retorno de clientes sumidas.
-- Rodar no SQL Editor do Supabase DEPOIS de 20261012_salao_cadastros.sql.
-- Idempotente: pode rodar de novo sem quebrar e sem apagar contatos ja registrados.

-- 1. Quem pediu para nao receber mensagem ----------------------------------------

alter table public.salao_clientes add column if not exists nao_contatar boolean not null default false;

-- 2. Registro de cada chamada ---------------------------------------------------

create table if not exists public.salao_contatos (
  id bigint generated always as identity primary key,
  cliente_codigo int not null references public.salao_clientes(gendo_codigo) on delete cascade,
  motivo text not null default 'retorno' check (motivo in ('retorno','aniversario','outro')),
  resultado text not null default 'chamada' check (resultado in ('chamada','respondeu','agendou','sem_interesse')),
  feito_em timestamptz not null default now(),
  feito_por text
);
create index if not exists salao_contatos_cliente_idx on public.salao_contatos (cliente_codigo, feito_em desc);

-- 3. Textos editaveis pelo painel (a mensagem de retorno) -------------------------

create table if not exists public.salao_config (
  chave text primary key,
  valor text not null,
  atualizado_em timestamptz not null default now()
);

-- 4. Acesso: so administradoras ------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['salao_contatos','salao_config'] loop
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

-- 5. Lista de retorno: sumidas com o ultimo contato de cada uma -------------------
-- Sumida = 5 ou mais visitas e mais de 60 dias sem vir. Quem volta sai da lista
-- sozinha na importacao seguinte, porque a ultima visita muda.
-- security_invoker: a view respeita o RLS das tabelas (so administradoras).

create or replace view public.salao_retorno with (security_invoker = true) as
select c.gendo_codigo, c.nome, c.telefone, c.visitas, c.ultima_visita, c.nao_contatar,
       u.id as contato_id, u.feito_em as ultimo_contato, u.resultado as ultimo_resultado, u.feito_por as contato_por
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

revoke all on public.salao_retorno from anon;

-- Conferencia: quantas clientes estao na lista de retorno e quantos contatos ja foram registrados.
select (select count(*) from public.salao_retorno) as na_lista,
       (select count(*) from public.salao_retorno where telefone is not null and not nao_contatar) as com_telefone,
       (select count(*) from public.salao_contatos) as contatos;
