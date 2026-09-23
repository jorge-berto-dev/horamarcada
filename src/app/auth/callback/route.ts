import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Troca o ?code= do OAuth / link de e-mail por sessão.
// Supabase deve ter Site URL = domínio Deploy + Redirect permitido: /auth/callback
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?erro=callback`);
}
