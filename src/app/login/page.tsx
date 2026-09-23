'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar');
  const [msg, setMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handle() {
    setMsg('');
    try {
      if (modo === 'criar') {
        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, nome: nome || email, tipo: 'dono' });
        }
        setMsg('Conta criada! Verifique seu e-mail e entre.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lift">
        <a href="/" aria-label="HoraMarcada"><Logo /></a>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{modo === 'entrar' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {modo === 'entrar'
            ? 'Gerencie sua página e sua agenda.'
            : 'Grátis no piloto. Sua página no ar em 5 minutos.'}
        </p>
        {modo === 'criar' && (
          <input className="input mt-4" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        )}
        <input className="input mt-2" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input mt-2" placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <button onClick={handle} className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-3 font-extrabold text-white transition hover:bg-emerald-700">
          {modo === 'entrar' ? 'Entrar' : 'Criar conta grátis'}
        </button>
        <button onClick={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')} className="mt-3 w-full text-sm font-semibold text-emerald-700 hover:underline">
          {modo === 'entrar' ? 'Não tem conta? Criar grátis' : 'Já tem conta? Entrar'}
        </button>
        {msg && <p className="mt-2 text-center text-sm font-semibold">{msg}</p>}
        <p className="mt-4 text-center text-xs text-slate-400">Clientes agendam sem conta, só com nome + WhatsApp.</p>
      </div>
    </main>
  );
}
