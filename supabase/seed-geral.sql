-- Seed geral — exemplos para QUALQUER negócio (piloto aberto)
-- Ajuste owner_id para o seu profile e rode por partes.
-- Pegue seu id: select id, email from auth.users;

-- Exemplos (descomente e troque OWNER_ID):
/*
insert into public.businesses (owner_id, slug, nome, whatsapp, plano, cor, categoria, descricao) values
('OWNER_ID', 'salao-bela-vista', 'Salão Bela Vista', '5511999999999', 'free', '#db2777', 'beleza', 'Cortes, barba, escova e estética'),
('OWNER_ID', 'studio-fisio-vida', 'Fisio Vida', '5511988888888', 'free', '#2563eb', 'saude', 'Fisioterapia e quiropraxia com hora marcada'),
('OWNER_ID', 'tattoo-ink-house', 'Ink House Tattoo', '5511977777777', 'free', '#111827', 'servicos', 'Tatuagem com agendamento por sessão')
on conflict (slug) do nothing;
*/
