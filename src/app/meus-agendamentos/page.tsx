export const dynamic = 'force-dynamic';
import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MeusAgendamentos() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Agendamentos vinculados à conta (quando cliente logado agenda, o client_id será preenchido numa próxima versão;
  // por enquanto mostra os que têm guest com mesmo e-mail/nome — e orienta a usar token).
  const { data: mine } = await supabase
    .from('appointments')
    .select('id, inicio, fim, status, guest_nome, token_publico, businesses(nome), services(nome)')
    .eq('client_profile_id', user.id)
    .order('inicio', { ascending: true })
    .limit(50);

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold">Meus agendamentos</h1>
      <p className="text-sm text-gray-600">Dica MVP: agendamentos como visitante aparecem pelo link de confirmação enviado na hora. Vincule sua conta na próxima versão.</p>
      <div className="mt-3 space-y-2">
        {(mine || []).map((a: Record<string, unknown>) => (
          <div key={a.id as string} className="rounded-xl bg-white p-3 shadow">
            <p className="font-bold">{(a.businesses as { nome: string })?.nome} — {(a.services as { nome: string })?.nome}</p>
            <p className="text-sm">{new Date(a.inicio as string).toLocaleString('pt-BR')} • {a.status as string}</p>
            <a className="text-sm text-blue-700 underline" href={`/c/${a.token_publico}`}>Abrir / cancelar</a>
          </div>
        ))}
        {(!mine || mine.length === 0) && <p className="text-sm text-gray-500">Nenhum agendamento vinculado a esta conta ainda.</p>}
      </div>
    </main>
  );
}
