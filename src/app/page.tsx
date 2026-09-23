export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="text-sm font-bold text-green-700">PILOTO ABERTO • GRÁTIS • QUALQUER NEGÓCIO</p>
      <h1 className="mt-2 text-4xl font-extrabold">Agenda online para salão, clínica, barbearia e serviços</h1>
      <p className="mt-3 text-lg text-gray-600">
        Crie sua página em 5 minutos, divulgue seu link e receba agendamentos.
        Cliente agenda como visitante, confirma pelo WhatsApp e adiciona na agenda do celular.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href="/dashboard" className="rounded-lg bg-black px-5 py-3 font-bold text-white">Cadastrar meu negócio grátis</a>
        <a href="/explorar" className="rounded-lg bg-white px-5 py-3 font-bold shadow">Explorar negócios</a>
        <a href="/login" className="rounded-lg px-5 py-3 underline">Entrar</a>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow"><b>1. Free padrão</b><p className="text-sm text-gray-600">Link /b/seu-negocio com serviços, profissionais e horários livres. Funciona para beleza, saúde, bem-estar e serviços.</p></div>
        <div className="rounded-xl bg-white p-4 shadow"><b>2. Confirmação</b><p className="text-sm text-gray-600">Link /c/token com SIM/NÃO + botão WhatsApp + .ics grátis. Reduz falta.</p></div>
        <div className="rounded-xl bg-white p-4 shadow"><b>3. Paid vitrine</b><p className="text-sm text-gray-600">Em breve: página /v/ personalizada + Mercado Pago.</p></div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-4 shadow">
        <h2 className="font-bold">Como testar (5 min, qualquer área)</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>Copie <code>.env.example</code> para <code>.env.local</code> e preencha Supabase (veja README).</li>
          <li>Rode o SQL <code>supabase/migrations/0001_init.sql</code> e depois <code>0002_para_todos.sql</code>.</li>
          <li><code>npm run dev</code> → crie conta em /login → crie negócio em /dashboard (escolha categoria).</li>
          <li>Cadastre 1 serviço + 1 profissional + horários via SQL (exemplo no README).</li>
          <li>Abra <code>/b/seu-slug</code> no celular e faça um agendamento visitante. Divulgue em /explorar.</li>
        </ol>
      </div>

      <p className="mt-6 text-xs text-gray-500">Contas Supabase/Vercel/MP no nome do responsável (16 anos). Não salve diagnóstico/laudo — só agenda (nome, WhatsApp, data).</p>
    </main>
  );
}
