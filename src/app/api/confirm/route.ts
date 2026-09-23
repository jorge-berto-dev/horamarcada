import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

// POST /api/confirm { token, action: 'confirmado' | 'cancelado' }
export async function POST(req: Request) {
  try {
    const { token, action } = await req.json();
    if (!token || !['confirmado', 'cancelado'].includes(action)) {
      return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
    }
    const admin = createAdminSupabase();
    const { data, error } = await admin
      .from('appointments')
      .update({ status: action })
      .eq('token_publico', token)
      .select('id, status, inicio')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, appointment: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
