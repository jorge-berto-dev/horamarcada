import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ContaClient from './ContaClient';
import Logo from '@/components/Logo';

export default async function ContaPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/conta');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <main className="min-h-screen">
      <div className="border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <a href="/" aria-label="HoraMarcada"><Logo size={26} /></a>
          <a href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-900">← Painel</a>
        </div>
      </div>
      <div className="mx-auto max-w-2xl p-4">
        <ContaClient
          email={user.email || ''}
          profile={(profile as { nome: string; whatsapp: string; tipo: string } | null) || null}
        />
      </div>
    </main>
  );
}
