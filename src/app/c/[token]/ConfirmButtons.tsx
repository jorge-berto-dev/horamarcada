'use client';
import { useState } from 'react';

export default function ConfirmButtons({ token }: { token: string }) {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState('');

  async function act(action: 'confirmado' | 'cancelado') {
    setLoading(action);
    setMsg('');
    const res = await fetch('/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    });
    const json = await res.json();
    setLoading('');
    setMsg(res.ok ? `Status atualizado para ${json.appointment.status}!` : json.error || 'Erro');
  }

  return (
    <div className="mt-4 space-y-2">
      <button onClick={() => act('confirmado')} disabled={!!loading} className="w-full rounded-full bg-emerald-600 px-4 py-2.5 font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-50">
        {loading === 'confirmado' ? '...' : 'SIM, confirmo presença'}
      </button>
      <button onClick={() => act('cancelado')} disabled={!!loading} className="w-full rounded-full bg-red-50 px-4 py-2.5 font-bold text-red-700 ring-1 ring-red-100 transition hover:bg-red-100 disabled:opacity-50">
        {loading === 'cancelado' ? '...' : 'Preciso cancelar'}
      </button>
      {msg && <p className="text-sm font-semibold">{msg}</p>}
    </div>
  );
}
