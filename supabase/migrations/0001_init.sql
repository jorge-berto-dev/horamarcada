-- Agenda SaaS MVP — 1ª migration (R$0, Supabase Free)
-- Rode em: Supabase Dashboard > SQL Editor > New query > colar tudo > Run
-- Ordem: extensões > tabelas > índices > RLS > policies > seed piloto

-- 0. Extensões
create extension if not exists "pgcrypto";

-- 1. Tabelas
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  whatsapp text not null default '',
  tipo text not null default 'cliente' check (tipo in ('dono','cliente','profissional')),
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  slug text unique not null,
  nome text not null,
  whatsapp text not null default '',
  plano text not null default 'free' check (plano in ('free','pro')),
  cor text not null default '#16a34a',
  logo_url text not null default '',
  banner_url text not null default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  nome text not null,
  duracao_min integer not null default 50 check (duracao_min > 0 and duracao_min <= 480),
  preco numeric(10,2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.availabilities (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  dia_semana integer not null check (dia_semana >= 0 and dia_semana <= 6),
  inicio time not null,
  fim time not null,
  created_at timestamptz not null default now(),
  check (inicio < fim)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  client_profile_id uuid references public.profiles(id) on delete set null,
  guest_nome text not null default '',
  guest_whatsapp text not null default '',
  inicio timestamptz not null,
  fim timestamptz not null,
  status text not null default 'pendente' check (status in ('pendente','confirmado','cancelado','faltou','concluido')),
  token_publico text unique not null default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now(),
  check (inicio < fim)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  mp_preapproval_id text,
  status text not null default 'inactive' check (status in ('active','inactive','cancelled')),
  created_at timestamptz not null default now()
);

-- 2. Índices
create index if not exists idx_businesses_slug on public.businesses(slug);
create index if not exists idx_businesses_owner on public.businesses(owner_id);
create index if not exists idx_services_business on public.services(business_id);
create index if not exists idx_professionals_business on public.professionals(business_id);
create index if not exists idx_avail_prof on public.availabilities(professional_id);
create index if not exists idx_appt_business_inicio on public.appointments(business_id, inicio);
create index if not exists idx_appt_prof_inicio on public.appointments(professional_id, inicio);
create index if not exists idx_appt_token on public.appointments(token_publico);
create index if not exists idx_appt_client on public.appointments(client_profile_id);

-- 3. RLS
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.availabilities enable row level security;
alter table public.appointments enable row level security;
alter table public.subscriptions enable row level security;

-- 4. Policies (MVP funcional, endurecer depois do piloto)
-- profiles: próprio usuário
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- businesses: catálogo público legível, escrita só dono
drop policy if exists "businesses public read" on public.businesses;
create policy "businesses public read" on public.businesses for select using (ativo = true);
drop policy if exists "businesses owner insert" on public.businesses;
create policy "businesses owner insert" on public.businesses for insert with check (auth.uid() = owner_id);
drop policy if exists "businesses owner update" on public.businesses;
create policy "businesses owner update" on public.businesses for update using (auth.uid() = owner_id);
drop policy if exists "businesses owner delete" on public.businesses;
create policy "businesses owner delete" on public.businesses for delete using (auth.uid() = owner_id);

-- services / professionals / availabilities: leitura pública, escrita dono
drop policy if exists "services public read" on public.services;
create policy "services public read" on public.services for select using (true);
drop policy if exists "services owner write" on public.services;
create policy "services owner write" on public.services for all using (
  exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid())
);

drop policy if exists "professionals public read" on public.professionals;
create policy "professionals public read" on public.professionals for select using (true);
drop policy if exists "professionals owner write" on public.professionals;
create policy "professionals owner write" on public.professionals for all using (
  exists (select 1 from public.businesses b where b.id = professionals.business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = professionals.business_id and b.owner_id = auth.uid())
);

drop policy if exists "avail public read" on public.availabilities;
create policy "avail public read" on public.availabilities for select using (true);
drop policy if exists "avail owner write" on public.availabilities;
create policy "avail owner write" on public.availabilities for all using (
  exists (
    select 1 from public.professionals p
    join public.businesses b on b.id = p.business_id
    where p.id = availabilities.professional_id and b.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.professionals p
    join public.businesses b on b.id = p.business_id
    where p.id = availabilities.professional_id and b.owner_id = auth.uid()
  )
);

-- appointments: leitura dono + cliente, escrita dono + cliente logado.
-- Agendamento visitante entra via API com service_role (bypassa RLS), por isso sem policy anon.
drop policy if exists "appt owner read" on public.appointments;
create policy "appt owner read" on public.appointments for select using (
  exists (select 1 from public.businesses b where b.id = appointments.business_id and b.owner_id = auth.uid())
  or client_profile_id = auth.uid()
);
drop policy if exists "appt auth insert" on public.appointments;
create policy "appt auth insert" on public.appointments for insert with check (
  auth.uid() is not null
);
drop policy if exists "appt owner update" on public.appointments;
create policy "appt owner update" on public.appointments for update using (
  exists (select 1 from public.businesses b where b.id = appointments.business_id and b.owner_id = auth.uid())
  or client_profile_id = auth.uid()
);

-- subscriptions: só dono lê
drop policy if exists "subs owner read" on public.subscriptions;
create policy "subs owner read" on public.subscriptions for select using (
  exists (select 1 from public.businesses b where b.id = subscriptions.business_id and b.owner_id = auth.uid())
);

-- 5. Seed piloto quiropraxia (rode após criar seu usuário dono e trocar OWNER_ID)
-- Substitua 'SEU_OWNER_UUID' pelo id do seu profile (Supabase > Authentication > Users > id)
-- Descomente para usar:
/*
insert into public.businesses (owner_id, slug, nome, whatsapp, plano, cor)
values ('SEU_OWNER_UUID', 'quiropraxia-centro', 'Quiropraxia Centro (Piloto)', '5511999999999', 'free', '#16a34a')
on conflict (slug) do nothing;

-- depois busque os ids gerados e cadastre 2 serviços, 1-2 profissionais e availabilities seg-sex 08:00-18:00
*/
