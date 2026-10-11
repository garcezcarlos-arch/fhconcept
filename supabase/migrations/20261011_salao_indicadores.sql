-- Portal FH Operacoes: indicadores do salao (numeros do Gendo).
-- Rodar no SQL Editor do Supabase. Idempotente: pode rodar de novo sem quebrar
-- e sem apagar o que ja foi lancado pelo painel.
--
-- Aqui so entram contagens e totais. Nenhum dado de cliente.

-- 1. Numeros por mes -----------------------------------------------------------

create table if not exists public.salao_mensal (
  mes date primary key check (extract(day from mes) = 1),   -- sempre o dia 1 do mes
  agendamentos int not null default 0 check (agendamentos >= 0),   -- total, incluindo cancelados
  cancelados int not null default 0 check (cancelados >= 0),
  faltas int check (faltas >= 0),                            -- null = nao informado
  por_profissional jsonb not null default '{}'::jsonb,       -- {"Fernanda": 94, "Juliana": 6, "Outras": 45}
  comandas_fechadas int not null default 0 check (comandas_fechadas >= 0),
  valor_bruto numeric(12,2) not null default 0 check (valor_bruto >= 0),
  descontos numeric(12,2) not null default 0 check (descontos >= 0),
  origem text not null default 'manual' check (origem in ('levantamento','manual','csv')),
  atualizado_em timestamptz not null default now()
);

-- 2. Retrato da base em uma data ----------------------------------------------

create table if not exists public.salao_retrato (
  data date primary key,
  clientes_total int not null default 0,
  clientes_90d int not null default 0,          -- com visita nos ultimos 90 dias
  clientes_mais_90d int not null default 0,     -- ultima visita ha mais de 90 dias
  clientes_sem_visita int not null default 0,   -- sem visita registrada
  clientes_sumidas int not null default 0,      -- 2+ meses sem vir e 5+ visitas (tela Sumidos)
  comandas_abertas int not null default 0,
  origem text not null default 'manual' check (origem in ('levantamento','manual','csv')),
  atualizado_em timestamptz not null default now()
);

-- 3. Acesso: so administradoras ------------------------------------------------
-- O painel le pelo servidor (service role); as policies valem para qualquer
-- outro acesso com a chave publica.

alter table public.salao_mensal enable row level security;
alter table public.salao_retrato enable row level security;

drop policy if exists "salao_mensal admin" on public.salao_mensal;
create policy "salao_mensal admin" on public.salao_mensal for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel = 'admin'));

drop policy if exists "salao_retrato admin" on public.salao_retrato;
create policy "salao_retrato admin" on public.salao_retrato for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.papel = 'admin'));

revoke all on public.salao_mensal, public.salao_retrato from anon;

-- 4. Carga inicial: levantamento do Gendo de 11/10/2026 (out/2025 a set/2026) ----
-- "Outras" soma as profissionais hoje inativas.
-- on conflict do nothing: nao sobrescreve um mes ja corrigido pelo painel.

insert into public.salao_mensal
  (mes, agendamentos, cancelados, por_profissional, comandas_fechadas, valor_bruto, descontos, origem)
values
  ('2025-10-01', 145, 10, '{"Fernanda": 94,  "Juliana": 6,  "Outras": 45}',               23,  4882.00,  339.00, 'levantamento'),
  ('2025-11-01', 168, 14, '{"Fernanda": 96,  "Juliana": 15, "Outras": 57}',               33, 12292.55,  109.45, 'levantamento'),
  ('2025-12-01', 249, 20, '{"Fernanda": 103, "Juliana": 26, "Outras": 120}',              70, 16827.00, 1725.00, 'levantamento'),
  ('2026-01-01',  92, 11, '{"Fernanda": 56,  "Juliana": 7,  "Outras": 29}',               29,  4761.50,  925.00, 'levantamento'),
  ('2026-02-01',  87,  7, '{"Fernanda": 71,  "Juliana": 15, "Outras": 1}',                25,  6552.00,  259.00, 'levantamento'),
  ('2026-03-01',  84, 15, '{"Fernanda": 72,  "Juliana": 10, "Outras": 2}',                31,  6586.90, 2392.00, 'levantamento'),
  ('2026-04-01',  67,  8, '{"Fernanda": 55,  "Juliana": 11, "Outras": 1}',                16,  3753.00,  800.00, 'levantamento'),
  ('2026-05-01', 112,  7, '{"Fernanda": 92,  "Juliana": 15, "Laura": 5}',                 69, 15913.90,  915.00, 'levantamento'),
  ('2026-06-01',  77,  2, '{"Fernanda": 59,  "Juliana": 9,  "Laura": 9}',                 15,  4427.00,  160.00, 'levantamento'),
  ('2026-07-01', 101,  6, '{"Fernanda": 62,  "Juliana": 26, "Laura": 13}',                 1,   330.00,    0.00, 'levantamento'),
  ('2026-08-01',  77,  5, '{"Fernanda": 50,  "Juliana": 18, "Laura": 9}',                  0,     0.00,    0.00, 'levantamento'),
  ('2026-09-01',  99,  5, '{"Fernanda": 76,  "Juliana": 6,  "Laura": 17}',                 0,     0.00,    0.00, 'levantamento')
on conflict (mes) do nothing;

insert into public.salao_retrato
  (data, clientes_total, clientes_90d, clientes_mais_90d, clientes_sem_visita, clientes_sumidas, comandas_abertas, origem)
values
  ('2026-10-11', 1071, 116, 494, 461, 121, 76, 'levantamento')
on conflict (data) do nothing;

-- Conferencia: deve devolver 12 meses e 1.358 agendamentos.
select count(*) as meses, sum(agendamentos) as agendamentos, sum(comandas_fechadas) as comandas
  from public.salao_mensal where origem = 'levantamento';
