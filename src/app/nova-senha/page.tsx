'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function NovaSenhaPage() {
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function salvar() {
    setMsg('');
    if (senha.length < 6) { setMsg('Use ao menos 6 caracteres.'); return; }
    if (senha !== senha2) { setMsg('As senhas não coincidem.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setMsg('Senha atualizada! Redirecionando...');
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro. O link pode ter expirado — peça outro em /login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lift">
        <a href="/" aria-label="HoraMarcada"><Logo /></a>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Nova senha</h1>
        <p className="mt-1 text-sm text-slate-500">Escolha uma senha com ao menos 6 caracteres.</p>
        <input className="input mt-4" type="password" placeholder="Nova senha" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <input className="input mt-2" type="password" placeholder="Repita a nova senha" autoComplete="new-password" value={senha2} onChange={(e) => setSenha2(e.target.value)} />
        <button onClick={salvar} disabled={loading} className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-3 font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50">
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </button>
        {msg && <p className="mt-3 text-center text-sm font-semibold">{msg}</p>}
      </div>
    </main>
  );
}
