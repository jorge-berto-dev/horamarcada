import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';

export default async function MeusAgendamentos() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: mine } = await supabase
    .from('appointments')
    .select('id, inicio, fim, status, guest_nome, token_publico, businesses(nome), services(nome)')
    .eq('client_profile_id', user.id)
    .order('inicio', { ascending: true })
    .limit(50);

  return (
    <main className="min-h-screen">
      <div className="border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <a href="/" aria-label="HoraMarcada"><Logo size={26} /></a>
          <a href="/explorar" className="text-sm font-bold text-slate-500 hover:text-slate-900">Agendar novo →</a>
        </div>
      </div>
      <div className="mx-auto max-w-2xl p-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Meus agendamentos</h1>
        <p className="mt-1 text-sm text-slate-500">Agendamentos como visitante aparecem pelo link de confirmação recebido na hora.</p>
        <div className="mt-4 space-y-2">
          {(mine || []).map((a: Record<string, unknown>) => (
            <div key={a.id as string} className="card">
              <p className="font-extrabold">{(a.businesses as { nome: string })?.nome} — {(a.services as { nome: string })?.nome}</p>
              <p className="text-sm text-slate-500">{new Date(a.inicio as string).toLocaleString('pt-BR')} • {a.status as string}</p>
              <a className="text-sm font-bold text-emerald-700 hover:underline" href={`/c/${a.token_publico}`}>Abrir / cancelar →</a>
            </div>
          ))}
          {(!mine || mine.length === 0) && (
            <div className="card text-center">
              <p className="font-bold">Nada por aqui ainda</p>
              <p className="mt-1 text-sm text-slate-500">Explore negócios e reserve seu primeiro horário.</p>
              <a href="/explorar" className="mt-4 inline-flex rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Explorar negócios</a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
