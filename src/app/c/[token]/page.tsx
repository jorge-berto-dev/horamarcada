import { createAdminSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ConfirmButtons from './ConfirmButtons';
import Logo from '@/components/Logo';

export default async function ConfirmPage({ params }: { params: { token: string } }) {
  const admin = createAdminSupabase();
  const { data: appt } = await admin
    .from('appointments')
    .select('inicio, fim, status, guest_nome, businesses(nome), services(nome)')
    .eq('token_publico', params.token)
    .single();

  if (!appt) notFound();

  const biz = appt.businesses as unknown as { nome: string } | null;
  const svc = appt.services as unknown as { nome: string } | null;
  const confirmado = appt.status === 'confirmado';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex h-14 max-w-md items-center justify-center px-4">
        <a href="/" aria-label="HoraMarcada"><Logo size={26} /></a>
      </div>
      <div className="mx-auto max-w-md px-4 pb-10">
        <div className="card text-center">
          <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${confirmado ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            {confirmado ? '✓' : '📅'}
          </span>
          <h1 className="mt-3 text-xl font-extrabold tracking-tight">{biz?.nome}</h1>
          <p className="mt-1 text-slate-600">Olá <b>{appt.guest_nome}</b>!</p>
          <p className="mt-1 text-slate-600">{svc?.nome} em <b>{new Date(appt.inicio).toLocaleString('pt-BR')}</b></p>
          <span className={`chip mt-3 ${confirmado ? '' : '!bg-slate-100 !text-slate-700 !ring-slate-200'}`}>
            {appt.status}
          </span>
          <ConfirmButtons token={params.token} />
          <a href={`/api/ics/${params.token}`} className="mt-3 block rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-slate-700">
            📅 Adicionar na agenda do celular
          </a>
        </div>
      </div>
    </main>
  );
}
