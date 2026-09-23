export const dynamic = 'force-dynamic';
import { createServerSupabase } from '@/lib/supabase/server';
import { CATEGORIAS } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function catLabel(id: string) {
  return CATEGORIAS.find((c) => c.id === id)?.label.split(' (')[0] || id;
}

export default async function ExplorarPage({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  const supabase = createServerSupabase();
  let query = supabase.from('businesses').select('slug, nome, categoria, descricao, cor').eq('ativo', true).order('nome').limit(100);
  if (searchParams.cat) query = query.eq('categoria', searchParams.cat);
  const { data } = await query;

  const q = (searchParams.q || '').toLowerCase();
  const list = (data || []).filter((b) => !q || b.nome.toLowerCase().includes(q));

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Diretório</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Encontre e agende</h1>
        <p className="mt-2 max-w-xl text-slate-600">
          Negócios com agendamento online pela HoraMarcada. Escolha, reserve o horário e receba a confirmação.
        </p>

        <form className="card mt-6 flex flex-wrap items-center gap-2" action="/explorar" method="get">
          <select name="cat" defaultValue={searchParams.cat || ''} className="input !w-auto">
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input name="q" defaultValue={searchParams.q || ''} placeholder="Buscar nome..." className="input !w-auto flex-1 min-w-[180px]" />
          <button className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700">Filtrar</button>
          <a href="/dashboard" className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">+ Cadastrar grátis</a>
        </form>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <a key={b.slug} href={`/b/${b.slug}`} className="card group transition hover:shadow-lift">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
                  style={{ background: b.cor || '#059669' }}
                >
                  {b.nome.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-extrabold">{b.nome}</p>
                  <span className="chip mt-1">{catLabel(b.categoria)}</span>
                </div>
              </div>
              {b.descricao && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{b.descricao}</p>}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-700 group-hover:gap-2 group-hover:text-emerald-800">
                Agendar horário →
              </span>
            </a>
          ))}
        </div>
        {list.length === 0 && (
          <div className="card mt-6 text-center">
            <p className="font-bold">Nenhum negócio por aqui ainda</p>
            <p className="mt-1 text-sm text-slate-600">Seja o primeiro da sua região em 5 minutos.</p>
            <a href="/dashboard" className="btn-primary mt-4">Cadastrar meu negócio</a>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
