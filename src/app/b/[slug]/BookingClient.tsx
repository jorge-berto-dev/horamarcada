'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildFreeSlots, formatSlot } from '@/lib/slots';
import { createClient } from '@/lib/supabase/client';
import type { Availability, Business, Professional, Service } from '@/lib/types';

type ApptLite = { professional_id: string; inicio: string; fim: string; status: string };
type ExcLite = { professional_id: string; data: string; fechado: boolean; inicio: string | null; fim: string | null };

function localKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Step({ n, t }: { n: string; t: string }) {
  return (
    <span className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white">{n}</span>
      {t}
    </span>
  );
}

export default function BookingClient({
  business,
  services,
  professionals,
  availabilities,
  appointments,
  exceptions,
}: {
  business: Business;
  services: Service[];
  professionals: Professional[];
  availabilities: Availability[];
  appointments: ApptLite[];
  exceptions: ExcLite[];
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
  const [logged, setLogged] = useState(false);

  // Logado? Preenche nome/Whats do perfil e vincula o agendamento à conta.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      setLogged(true);
      const { data: prof } = await supabase
        .from('profiles')
        .select('nome, whatsapp')
        .eq('id', data.session.user.id)
        .single();
      const p = prof as { nome: string; whatsapp: string } | null;
      if (p?.nome) setNome((v) => v || p.nome);
      if (p?.whatsapp) setWhats((v) => v || p.whatsapp);
    });
  }, []);

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
  const dayExc = exceptions.find((e) => e.professional_id === profId && selectedDay && e.data === localKey(selectedDay));

  const slots = useMemo(() => {
    if (!service || !profId || !selectedDay) return [];
    // Exceção do dia (feriado/folga/horário especial) tem prioridade sobre a rotina semanal
    const exc = exceptions.find((e) => e.professional_id === profId && e.data === localKey(selectedDay));
    if (exc?.fechado) return [];
    const rules = exc && exc.inicio && exc.fim
      ? [{ id: 'exc', professional_id: profId, dia_semana: selectedDay.getDay(), inicio: exc.inicio, fim: exc.fim }]
      : availabilities.filter((a) => a.professional_id === profId);
    return buildFreeSlots({
      date: selectedDay,
      availabilities: rules,
      appointments: appointments
        .filter((a) => a.professional_id === profId)
        .map((a) => ({ inicio: a.inicio, fim: a.fim, status: a.status as never })),
      duracaoMin: service.duracao_min,
    });
  }, [service, profId, selectedDay, availabilities, appointments, exceptions]);

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
      <div className="card text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Horário reservado!</h2>
        <p className="mt-1 text-slate-600"><b>{done.quando}</b> • {business.nome}</p>
        <a className="mt-2 block break-all text-sm text-emerald-700 underline" href={confirmUrl}>{confirmUrl}</a>
        <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2">
          <a href={`/api/ics/${done.token}`} className="rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white hover:bg-slate-700">
            📅 Adicionar na agenda do celular
          </a>
          <a href={confirmUrl} className="rounded-full bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-emerald-700">
            Confirmar / remarcar
          </a>
          <a href="/meus-agendamentos" className="text-center text-sm text-slate-500 underline">
            Crie uma conta para ver seus agendamentos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <Step n="1" t="Escolha o serviço" />
        <select className="input mt-2" value={serviceId} onChange={(e) => { setServiceId(e.target.value); setSlotIso(''); }}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.nome} • {s.duracao_min}min • R$ {Number(s.preco).toFixed(2)}</option>
          ))}
        </select>
        {services.length === 0 && <p className="mt-2 text-sm text-red-600">Nenhum serviço cadastrado ainda.</p>}

        <div className="mt-4"><Step n="2" t="Escolha o profissional" /></div>
        <select className="input mt-2" value={profId} onChange={(e) => { setProfId(e.target.value); setSlotIso(''); }}>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>

        <div className="mt-4"><Step n="3" t="Escolha o dia" /></div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => { setDayOffset(i); setSlotIso(''); }}
              className={`min-w-[68px] rounded-2xl border px-2 py-2 text-center text-sm transition ${
                i === dayOffset
                  ? 'border-slate-900 bg-slate-900 text-white shadow-soft'
                  : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <span className="block text-xs opacity-70">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
              <span className="block font-extrabold">{d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
            </button>
          ))}
        </div>

        <div className="mt-4"><Step n="4" t={`Escolha o horário (${slots.length} livres)`} /></div>
        {dayExc?.fechado && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
            Fechado neste dia. Escolha outra data.
          </p>
        )}
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((s) => (
            <button
              key={s.toISOString()}
              onClick={() => setSlotIso(s.toISOString())}
              className={`rounded-xl border px-2 py-2 text-sm font-bold transition ${
                slotIso === s.toISOString()
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-soft'
                  : 'border-slate-200 bg-white hover:border-emerald-400 hover:text-emerald-700'
              }`}
            >
              {s.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))}
        </div>
        {slots.length === 0 && <p className="mt-2 text-sm text-slate-500">Sem horários neste dia. Tente outro dia ou profissional.</p>}
        {slotIso && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
            Escolhido: {formatSlot(new Date(slotIso))}
          </p>
        )}
      </div>

      <div className="card">
        <Step n="5" t="Seus dados — sem criar conta" />
        {logged && (
          <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
            Logado — este agendamento entra em <a href="/meus-agendamentos" className="underline">Meus agendamentos</a>.
          </p>
        )}
        <input className="input mt-2" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="input mt-2" placeholder="WhatsApp (DDD + número)" inputMode="tel" value={whats} onChange={(e) => setWhats(e.target.value)} />
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <button
          onClick={submit}
          disabled={loading}
          className="mt-3 w-full rounded-full bg-emerald-600 px-4 py-3.5 font-extrabold text-white shadow-soft transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? 'Reservando...' : 'Confirmar agendamento'}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">Ao agendar você concorda em ser contatado no WhatsApp para confirmação.</p>
      </div>
      <p className="pb-2 text-center text-xs text-slate-400">Feito com <b>HoraMarcada</b> • <a href="/explorar" className="underline">conheça outros negócios</a></p>
    </div>
  );
}
