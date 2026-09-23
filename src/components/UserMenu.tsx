'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Menu da navbar que reage à sessão: deslogado mostra Entrar/Cadastrar,
// logado mostra Painel/Conta/Sair.
export default function UserMenu() {
  const [state, setState] = useState<'loading' | 'off' | 'on'>('loading');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setState(data.session ? 'on' : 'off'));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setState(session ? 'on' : 'off'));
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    setState('off');
    router.push('/');
    router.refresh();
  }

  if (state === 'loading') return <span className="w-24" />;
  if (state === 'off') {
    return (
      <div className="flex items-center gap-2">
        <a href="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 sm:block">
          Entrar
        </a>
        <a href="/dashboard" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-emerald-700">
          Cadastrar grátis
        </a>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <a href="/dashboard" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 sm:block">
        Painel
      </a>
      <a href="/conta" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-200">
        Conta
      </a>
      <button onClick={sair} className="rounded-full px-3 py-2 text-sm font-bold text-slate-500 hover:text-slate-900">
        Sair
      </button>
    </div>
  );
}
