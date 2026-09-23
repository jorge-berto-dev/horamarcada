export const dynamic = 'force-dynamic';
import { createServerSupabase } from '@/lib/supabase/server';
import BookingClient from './BookingClient';
import { notFound } from 'next/navigation';

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: biz } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .eq('ativo', true)
    .single();

  if (!biz) notFound();

  const [{ data: services }, { data: professionals }, { data: availabilities }] = await Promise.all([
    supabase.from('services').select('*').eq('business_id', biz.id).eq('ativo', true).order('nome'),
    supabase.from('professionals').select('*').eq('business_id', biz.id).eq('ativo', true).order('nome'),
    supabase
      .from('availabilities')
      .select('*, professionals!inner(business_id)')
      .eq('professionals.business_id', biz.id),
  ]);

  // Próximos 14 dias de agendamentos (para calcular ocupação no client)
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 24 * 3600 * 1000);
  const { data: appointments } = await supabase
    .from('appointments')
    .select('professional_id, inicio, fim, status')
    .eq('business_id', biz.id)
    .neq('status', 'cancelado')
    .gte('inicio', now.toISOString())
    .lte('inicio', in14.toISOString());

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="p-6 text-white" style={{ background: biz.cor || '#16a34a' }}>
        <div className="mx-auto max-w-2xl">
          <p className="text-xs uppercase opacity-80">{biz.categoria || 'serviços'} • <a href="/explorar" className="underline">ver todos</a></p>
          <h1 className="text-2xl font-bold">{biz.nome}</h1>
          {biz.descricao && <p className="opacity-90">{biz.descricao}</p>}
          <p className="text-sm opacity-80">Agende online em menos de 1 minuto • sem baixar app</p>
        </div>
      </header>
      <div className="mx-auto max-w-2xl p-4">
        <BookingClient
          business={biz}
          services={services || []}
          professionals={professionals || []}
          availabilities={(availabilities || []).map((a: Record<string, unknown>) => ({
            id: a.id as string,
            professional_id: a.professional_id as string,
            dia_semana: a.dia_semana as number,
            inicio: a.inicio as string,
            fim: a.fim as string,
          }))}
          appointments={appointments || []}
        />
      </div>
    </main>
  );
}
