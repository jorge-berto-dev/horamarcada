export const dynamic = 'force-dynamic';
import { createAdminSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ConfirmButtons from './ConfirmButtons';

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

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold">{biz?.nome}</h1>
        <p className="mt-2">Olá <b>{appt.guest_nome}</b>!</p>
        <p>{svc?.nome} em <b>{new Date(appt.inicio).toLocaleString('pt-BR')}</b></p>
        <p className="mt-1">Status atual: <b>{appt.status}</b></p>
        <ConfirmButtons token={params.token} />
        <a href={`/api/ics/${params.token}`} className="mt-3 block rounded-lg bg-black px-4 py-2 text-center text-white">
          Adicionar na agenda do celular
        </a>
      </div>
    </main>
  );
}
