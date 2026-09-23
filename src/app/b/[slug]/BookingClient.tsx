'use client';

import { useMemo, useState } from 'react';
import { buildFreeSlots, formatSlot } from '@/lib/slots';
import type { Availability, Business, Professional, Service } from '@/lib/types';

type ApptLite = { professional_id: string; inicio: string; fim: string; status: string };

export default function BookingClient({
  business,
  services,
  professionals,
  availabilities,
  appointments,
}: {
  business: Business;
  services: Service[];
  professionals: Professional[];
  availabilities: Availability[];
  appointments: ApptLite[];
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [profId, setProfId] = useState(professionals[0]?.id ?? '');
  const [dayOffset, setDayOffset] = useState(0);
  const [slotIso, setSlotIso] = useState('');
  const [nome, setNome] = useState('');
  const [whats, setWhats] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ token: string; quando: string } | null>(null);
  const [error, setError] = useState('');

  const service = services.find((s) => s.id === serviceId);

  const days = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      d.setHours(0, 0, 0, 0);
      arr.push(d);
    }
    return arr;
  }, []);

  const selectedDay = days[dayOffset];

  const slots = useMemo(() => {
    if (!service || !profId || !selectedDay) return [];
    return buildFreeSlots({
      date: selectedDay,
      availabilities: availabilities.filter((a) => a.professional_id === profId),
      appointments: appointments
        .filter((a) => a.professional_id === profId)
        .map((a) => ({ inicio: a.inicio, fim: a.fim, status: a.status as never })),
      duracaoMin: service.duracao_min,
    });
  }, [service, profId, selectedDay, availabilities, appointments]);

  async function submit() {
    setError('');
    if (!slotIso || !nome.trim() || !whats.trim()) {
      setError('Preencha nome, WhatsApp e escolha um horário.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          service_id: serviceId,
          professional_id: profId,
          inicio: slotIso,
          guest_nome: nome.trim(),
          guest_whatsapp: whats.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao agendar');
      setDone({
        token: json.appointment.token_publico,
        quando: new Date(json.appointment.inicio).toLocaleString('pt-BR'),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao agendar');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const confirmUrl = `${location.origin}/c/${done.token}`;
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold text-green-700">Agendado! 🎉</h2>
        <p className="mt-2">Quando: <b>{done.quando}</b></p>
        <p className="mt-1 text-sm text-gray-600">Guarde seu link de confirmação:</p>
        <a className="break-all text-blue-700 underline" href={confirmUrl}>{confirmUrl}</a>
        <div className="mt-4 flex flex-col gap-2">
          <a href={`/api/ics/${done.token}`} className="rounded-lg bg-black px-4 py-2 text-center text-white">
            Adicionar na agenda do celular (.ics)
          </a>
          <a href={confirmUrl} className="rounded-lg px-4 py-2 text-center text-white" style={{ background: business.cor }}>
            Confirmar / Cancelar
          </a>
          <a href="/meus-agendamentos" className="text-center text-sm text-gray-600 underline">
            Crie uma conta para ver seus agendamentos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow">
        <label className="text-sm font-semibold">1. Serviço</label>
        <select className="mt-1 w-full rounded-lg border p-2" value={serviceId} onChange={(e) => { setServiceId(e.target.value); setSlotIso(''); }}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.nome} • {s.duracao_min}min • R$ {Number(s.preco).toFixed(2)}</option>
          ))}
        </select>
        {services.length === 0 && <p className="text-sm text-red-600">Nenhum serviço cadastrado ainda.</p>}

        <label className="mt-3 block text-sm font-semibold">2. Profissional</label>
        <select className="mt-1 w-full rounded-lg border p-2" value={profId} onChange={(e) => { setProfId(e.target.value); setSlotIso(''); }}>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>

        <label className="mt-3 block text-sm font-semibold">3. Dia</label>
        <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => { setDayOffset(i); setSlotIso(''); }}
              className={`min-w-[64px] rounded-lg border px-2 py-1 text-sm ${i === dayOffset ? 'bg-black text-white' : 'bg-white'}`}
            >
              {d.toLocaleDateString('pt-BR', { weekday: 'short' })}<br />{d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-sm font-semibold">4. Horário ({slots.length} livres)</label>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {slots.map((s) => (
            <button
              key={s.toISOString()}
              onClick={() => setSlotIso(s.toISOString())}
              className={`rounded-lg border px-2 py-1 text-sm ${slotIso === s.toISOString() ? 'bg-green-600 text-white' : 'bg-white'}`}
            >
              {s.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))}
        </div>
        {slots.length === 0 && <p className="mt-2 text-sm text-gray-500">Sem horários neste dia. Tente outro dia/profissional.</p>}
        {slotIso && <p className="mt-2 text-sm">Escolhido: <b>{formatSlot(new Date(slotIso))}</b></p>}
      </div>

      <div className="rounded-xl bg-white p-4 shadow">
        <label className="text-sm font-semibold">5. Seus dados (sem criar conta)</label>
        <input className="mt-1 w-full rounded-lg border p-2" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="mt-2 w-full rounded-lg border p-2" placeholder="WhatsApp (DDD + número)" value={whats} onChange={(e) => setWhats(e.target.value)} />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={submit}
          disabled={loading}
          className="mt-3 w-full rounded-lg px-4 py-3 font-bold text-white disabled:opacity-50"
          style={{ background: business.cor }}
        >
          {loading ? 'Agendando...' : 'Confirmar agendamento'}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">Ao agendar você concorda em ser contatado no WhatsApp para confirmação.</p>
      </div>
    </div>
  );
}
