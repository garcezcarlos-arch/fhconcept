-- Fase 3: formacoes vendaveis. Rodar no SQL Editor do Supabase.

create table if not exists public.turmas (
  id uuid primary key default gen_random_uuid(),
  formato text not null,                 -- turma | individual | shadow-day | assistido | mentoria | pacote
  nome text not null,                    -- ex: "Colorimetria e loiros — outubro"
  descricao text,
  data_inicio date not null,
  data_fim date,
  horario text,                          -- ex: "9h as 18h"
  vagas int not null default 8,
  preco numeric(10,2) not null,
  sinal numeric(10,2),                   -- valor para reservar; null = preco cheio
  status text not null default 'rascunho' check (status in ('rascunho','aberta','esgotada','encerrada','cancelada')),
  created_at timestamptz not null default now()
);

create table if not exists public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid references public.turmas(id) on delete set null,
  formato text not null,
  nome text not null,
  telefone text not null,
  email text,
  cidade text,
  experiencia text,                      -- tempo de profissao / nivel
  observacoes text,
  status text not null default 'aguardando_pagamento' check (status in ('lista_espera','aguardando_pagamento','confirmada','cancelada')),
  valor numeric(10,2) not null default 0,
  metodo text,                           -- pix | cartao_credito
  gateway text not null default 'manual',-- manual | mercadopago
  gateway_payment_id text,
  preference_id text,
  pago_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists inscricoes_turma_idx on public.inscricoes(turma_id);
create index if not exists inscricoes_status_idx on public.inscricoes(status);
create index if not exists turmas_status_data_idx on public.turmas(status, data_inicio);

alter table public.turmas enable row level security;
alter table public.inscricoes enable row level security;

-- publico ve so turmas abertas; staff ve tudo; escrita de inscricoes so pelo servidor (service role)
drop policy if exists "turmas publicas" on public.turmas;
create policy "turmas publicas" on public.turmas for select using (status in ('aberta','esgotada'));

drop policy if exists "turmas staff" on public.turmas;
create policy "turmas staff" on public.turmas for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel in ('admin','vendedor','operacao')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel in ('admin','vendedor','operacao')));

drop policy if exists "inscricoes staff" on public.inscricoes;
create policy "inscricoes staff" on public.inscricoes for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel in ('admin','vendedor','operacao')));

-- vagas restantes (ignora canceladas)
create or replace view public.turmas_vagas as
select t.*, t.vagas - count(i.id) filter (where i.status in ('confirmada','aguardando_pagamento')) as restantes
from public.turmas t
left join public.inscricoes i on i.turma_id = t.id
group by t.id;

grant select on public.turmas_vagas to anon, authenticated;
