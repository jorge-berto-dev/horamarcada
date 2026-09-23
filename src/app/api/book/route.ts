import { NextResponse } from 'next/server';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';
import { overlaps } from '@/lib/slots';

// POST /api/book — agendamento visitante (sem login) ou logado (vincula client_profile_id).
// Validação e choque checados no servidor com service_role.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { business_id, service_id, professional_id, inicio, guest_nome, guest_whatsapp } = body;

    if (!business_id || !service_id || !professional_id || !inicio || !guest_nome || !guest_whatsapp) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const admin = createAdminSupabase();

    const { data: svc, error: svcErr } = await admin
      .from('services')
      .select('duracao_min, business_id, ativo')
      .eq('id', service_id)
      .single();
    if (svcErr || !svc || !svc.ativo || svc.business_id !== business_id) {
      return NextResponse.json({ error: 'Serviço inválido.' }, { status: 400 });
    }

    const ini = new Date(inicio);
    if (isNaN(ini.getTime()) || ini <= new Date()) {
      return NextResponse.json({ error: 'Horário inválido ou no passado.' }, { status: 400 });
    }
    const fim = new Date(ini.getTime() + svc.duracao_min * 60000);

    // Checa choque com agendamentos existentes (não-cancelados)
    const { data: existentes } = await admin
      .from('appointments')
      .select('inicio, fim, status')
      .eq('professional_id', professional_id)
      .neq('status', 'cancelado')
      .gte('inicio', new Date(ini.getTime() - 24 * 3600 * 1000).toISOString())
      .lte('inicio', new Date(fim.getTime() + 24 * 3600 * 1000).toISOString());

    const choque = (existentes || []).some((a) =>
      overlaps(ini, fim, new Date(a.inicio), new Date(a.fim))
    );
    if (choque) {
      return NextResponse.json({ error: 'Horário acabou de ser ocupado. Escolha outro.' }, { status: 409 });
    }

    const { data, error } = await admin
      .from('appointments')
      .insert({
        business_id,
        service_id,
        professional_id,
        inicio: ini.toISOString(),
        fim: fim.toISOString(),
        guest_nome: String(guest_nome).slice(0, 80),
        guest_whatsapp: String(guest_whatsapp).slice(0, 20),
        status: 'pendente',
        client_profile_id: await currentUserId(),
      })
      .select('id, token_publico, inicio, fim')
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, appointment: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Se o navegador tem sessão, vincula o agendamento à conta (sem exigir login).
async function currentUserId(): Promise<string | null> {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}
