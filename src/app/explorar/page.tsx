export const dynamic = 'force-dynamic';
import { createServerSupabase } from '@/lib/supabase/server';
import { CATEGORIAS } from '@/lib/types';

export default async function ExplorarPage({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  const supabase = createServerSupabase();
  let query = supabase.from('businesses').select('slug, nome, categoria, descricao, cor').eq('ativo', true).order('nome').limit(100);
  if (searchParams.cat) query = query.eq('categoria', searchParams.cat);
  const { data } = await query;

  const q = (searchParams.q || '').toLowerCase();
  const list = (data || []).filter((b) => !q || b.nome.toLowerCase().includes(q));

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold">Explorar negócios</h1>
      <p className="text-sm text-gray-600">Piloto aberto: qualquer salão, clínica, barbearia, estúdio ou serviço pode criar sua página e receber agendamentos.</p>
      <form className="mt-3 flex flex-wrap gap-2" action="/explorar" method="get">
        <select name="cat" defaultValue={searchParams.cat || ''} className="rounded-lg border p-2">
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input name="q" defaultValue={searchParams.q || ''} placeholder="Buscar nome..." className="rounded-lg border p-2" />
        <button className="rounded-lg bg-black px-4 py-2 text-white">Filtrar</button>
        <a href="/dashboard" className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white">+ Cadastrar meu negócio grátis</a>
      </form>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {list.map((b) => (
          <a key={b.slug} href={`/b/${b.slug}`} className="rounded-xl bg-white p-4 shadow hover:shadow-md">
            <p className="text-xs uppercase text-gray-500">{b.categoria}</p>
            <p className="font-bold">{b.nome}</p>
            {b.descricao && <p className="text-sm text-gray-600">{b.descricao}</p>}
            <p className="mt-1 text-sm text-blue-700">Agendar →</p>
          </a>
        ))}
      </div>
      {list.length === 0 && <p className="mt-4 text-sm text-gray-500">Nenhum negócio ainda. Seja o primeiro em /dashboard.</p>}
    </main>
  );
}
