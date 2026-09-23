'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ContaClient({
  email, profile,
}: {
  email: string;
  profile: { nome: string; whatsapp: string; tipo: string } | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [nome, setNome] = useState(profile?.nome || '');
  const [whats, setWhats] = useState(profile?.whatsapp || '');
  const [msg, setMsg] = useState('');

  async function salvar() {
    setMsg('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg('Sessão expirada. Entre de novo.'); return; }
    const { error } = await supabase.from('profiles').upsert({
      id: user.id, nome: nome.trim() || email, whatsapp: whats.trim(),
      tipo: profile?.tipo || 'cliente',
    });
    setMsg(error ? error.message : 'Dados salvos! ✅');
  }

  async function sair() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-extrabold tracking-tight">Minha conta</h1>
      <p className="mt-1 text-sm text-slate-500">{email} • {profile?.tipo === 'dono' ? '🏪 Dono' : '📅 Cliente'}</p>
      <label className="mt-4 block text-sm font-bold">Nome</label>
      <input className="input mt-1" value={nome} onChange={(e) => setNome(e.target.value)} />
      <label className="mt-3 block text-sm font-bold">WhatsApp</label>
      <input className="input mt-1" inputMode="tel" value={whats} onChange={(e) => setWhats(e.target.value)} />
      {msg && <p className="mt-2 text-sm font-bold">{msg}</p>}
      <button onClick={salvar} className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-3 font-extrabold text-white hover:bg-emerald-700">
        Salvar dados
      </button>
      <div className="mt-2 flex gap-2">
        <a href="/dashboard" className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-center text-sm font-bold hover:bg-slate-200">Painel</a>
        <a href="/meus-agendamentos" className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-center text-sm font-bold hover:bg-slate-200">Agendamentos</a>
        <button onClick={sair} className="flex-1 rounded-full bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-100 hover:bg-red-100">Sair</button>
      </div>
    </div>
  );
}
