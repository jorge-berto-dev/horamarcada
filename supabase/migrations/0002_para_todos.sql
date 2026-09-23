-- Migration 0002 — piloto para TODOS os negócios (não só quiropraxia)
-- Rode em: Supabase Dashboard > SQL Editor > New query > colar > Run

alter table public.businesses
  add column if not exists categoria text not null default 'servicos',
  add column if not exists descricao text not null default '';

-- índice para filtro por categoria no /explorar
create index if not exists idx_businesses_categoria on public.businesses(categoria);
