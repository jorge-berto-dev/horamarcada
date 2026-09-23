export const dynamic = 'force-dynamic';
import { createServerSupabase } from '@/lib/supabase/server';
import BookingClient from './BookingClient';
import { notFound } from 'next/navigation';
import Logo from '@/components/Logo';

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
  const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [{ data: appointments }, { data: exceptions }] = await Promise.all([
    supabase
      .from('appointments')
      .select('professional_id, inicio, fim, status')
      .eq('business_id', biz.id)
      .neq('status', 'cancelado')
      .gte('inicio', now.toISOString())
      .lte('inicio', in14.toISOString()),
    supabase
      .from('availability_exceptions')
      .select('professional_id, data, fechado, inicio, fim, professionals!inner(business_id)')
      .eq('professionals.business_id', biz.id)
      .gte('data', dayKey(now))
      .lte('data', dayKey(in14)),
  ]);

  return (
    <main className="min-h-screen">
      <div className="border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <a href="/" aria-label="HoraMarcada"><Logo size={26} /></a>
          <a href="/explorar" className="text-sm font-bold text-slate-500 hover:text-slate-900">← Explorar</a>
        </div>
      </div>
      <header className="px-4 pb-8 pt-8 text-white" style={{ background: `linear-gradient(135deg, ${biz.cor || '#059669'}, #0f172a)` }}>
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {biz.categoria || 'serviços'}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{biz.nome}</h1>
          {biz.descricao && <p className="mt-1 text-white/85">{biz.descricao}</p>}
          <p className="mt-2 text-sm text-white/70">Agende online em menos de 1 minuto • sem baixar app</p>
        </div>
      </header>
      <div className="mx-auto -mt-4 max-w-2xl px-4 pb-10">
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
          exceptions={(exceptions || []).map((e: Record<string, unknown>) => ({
            professional_id: e.professional_id as string,
            data: e.data as string,
            fechado: e.fechado as boolean,
            inicio: (e.inicio as string | null) ?? null,
            fim: (e.fim as string | null) ?? null,
          }))}
        />
      </div>
    </main>
  );
}
