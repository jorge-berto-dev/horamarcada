import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';
import { buildIcs } from '@/lib/ics';

// GET /api/ics/[token] — baixa .ics para adicionar na agenda do celular
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const admin = createAdminSupabase();
  const { data: appt } = await admin
    .from('appointments')
    .select('inicio, fim, guest_nome, businesses(nome), services(nome)')
    .eq('token_publico', params.token)
    .single();

  if (!appt) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const biz = appt.businesses as unknown as { nome: string } | null;
  const svc = appt.services as unknown as { nome: string } | null;
  const ics = buildIcs({
    title: `${svc?.nome ?? 'Agendamento'} — ${biz?.nome ?? ''}`,
    description: `Cliente: ${appt.guest_nome}`,
    location: biz?.nome ?? '',
    start: new Date(appt.inicio),
    end: new Date(appt.fim),
  });

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="agendamento-${params.token}.ics"`,
    },
  });
}
