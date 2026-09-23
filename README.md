# HoraMarcada (site, R$0) — piloto para TODOS

Site de agendamento multi-negócio estilo Booksy para qualquer área: salão, barbearia, clínica, fisio, estética, tatuagem, consultoria. Cliente agenda como **visitante (nome + WhatsApp)**, conta opcional. Dono gerencia no `/dashboard`. Vitrine pública em `/explorar`.

## 1. Subir em 10 min (grátis)

1. Crie projeto em supabase.com (conta do responsável, você opera).
2. Supabase > SQL Editor > rode `supabase/migrations/0001_init.sql` e depois `0002_para_todos.sql`.
3. Copie: `cp .env.example .env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. `npm install && npm run dev` → http://localhost:3000
5. Crie conta em `/login` (vira dono), crie negócio em `/dashboard` (slug ex: `salao-bela-vista`, categoria: beleza/saude/servicos).
6. Cadastre serviço + profissional no painel, e horários via SQL:
```sql
-- pegue o id: select id, nome from professionals;
insert into availabilities (professional_id, dia_semana, inicio, fim) values
('PROF_ID', 1, '08:00','18:00'),
('PROF_ID', 2, '08:00','18:00'),
('PROF_ID', 3, '08:00','18:00'),
('PROF_ID', 4, '08:00','18:00'),
('PROF_ID', 5, '08:00','12:00');
```
7. Abra `/b/seu-slug` no celular e agende. Veja todos em `/explorar`.

## 2. Fluxos prontos

- Catálogo: `/explorar` (filtro categoria + busca, qualquer negócio)
- Público: `/b/[slug]` booking visitante → POST `/api/book` (service_role, anti-choque) → tela sucesso com `/api/ics/[token]` + `/c/[token]`
- Confirmação: `/c/[token]` SIM/NÃO → POST `/api/confirm`
- Dono: `/dashboard` agenda, status (confirmado/faltou/concluído/cancelado), botão WhatsApp (wa.me grátis)
- Cliente logado: `/meus-agendamentos`

## 3. Deploy Vercel (grátis)

1. Suba para GitHub, importe na Vercel.
2. Em Environment Variables cadastre as 3 vars do `.env`.
3. Deploy. Supabase free pausa após 7 dias sem uso — abra o dashboard 2x/semana no piloto.

## 4. Próximos passos (pós-piloto)

- [ ] Tela de availabilities no dashboard (hoje é via SQL)
- [ ] Vincular `client_profile_id` quando logado agenda (hoje só guest)
- [ ] Vitrine Paid `/v/[slug]` (logo/cor/banner) + Mercado Pago webhook
- [ ] Google Calendar OAuth 2-vias
- [ ] PWA instalável + TWA PlayStore (US$25, conta 18+)

## 5. Avisos

- Contas sempre no nome do responsável (16 anos).
- Não salve diagnóstico/laudo. Só agenda.
- Policies RLS do MVP são permissivas para leitura pública do catálogo; booking sensível passa por API com service_role. Endurecer antes de escalar.
