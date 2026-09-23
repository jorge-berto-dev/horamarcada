'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold">{modo === 'entrar' ? 'Entrar' : 'Criar conta (dono)'}</h1>
      <p className="mt-1 text-sm text-gray-600">Clientes podem agendar sem conta. Conta serve para dono gerenciar e cliente ver histórico.</p>
      {modo === 'criar' && (
        <input className="mt-4 w-full rounded-lg border p-2" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      )}
      <input className="mt-2 w-full rounded-lg border p-2" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="mt-2 w-full rounded-lg border p-2" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
      <button onClick={handle} className="mt-3 w-full rounded-lg bg-black px-4 py-2 font-bold text-white">Continuar</button>
      <button onClick={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')} className="mt-2 w-full text-sm text-blue-700 underline">
        {modo === 'entrar' ? 'Não tem conta? Criar' : 'Já tem conta? Entrar'}
      </button>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </main>
  );
}
