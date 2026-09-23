-- Migration 0003 — exceções por data (feriados, férias, folgas, horário especial)
-- Rode em: Supabase Dashboard > SQL Editor > New query > colar > Run
-- Depende de: 0001_init.sql

create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  data date not null,
  fechado boolean not null default true,
  inicio time,
  fim time,
  motivo text not null default '',
  created_at timestamptz not null default now(),
  unique (professional_id, data),
  check (fechado = true or (inicio is not null and fim is not null and inicio < fim))
);

create index if not exists idx_exc_prof_data on public.availability_exceptions(professional_id, data);

alter table public.availability_exceptions enable row level security;

-- Leitura pública (booking precisa saber se o dia está fechado)
drop policy if exists "exc public read" on public.availability_exceptions;
create policy "exc public read" on public.availability_exceptions for select using (true);

-- Escrita só do dono do negócio
drop policy if exists "exc owner write" on public.availability_exceptions;
create policy "exc owner write" on public.availability_exceptions for all using (
  exists (
    select 1 from public.professionals p
    join public.businesses b on b.id = p.business_id
    where p.id = availability_exceptions.professional_id and b.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.professionals p
    join public.businesses b on b.id = p.business_id
    where p.id = availability_exceptions.professional_id and b.owner_id = auth.uid()
  )
);
