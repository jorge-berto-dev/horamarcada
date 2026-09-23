'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Availability, AvailabilityException, Business, Professional, Service } from '@/lib/types';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

type Interval = { inicio: string; fim: string };
type DayState = { ativo: boolean; intervals: Interval[] };
type ExcLocal = { key: string; data: string; fechado: boolean; inicio: string; fim: string; motivo: string };

const hm = (t: string) => (t || '').slice(0, 5); // "08:00:00" -> "08:00"
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

function weekFromAvail(profId: string, all: Availability[]): DayState[] {
  return DIAS.map((_, dow) => {
    const rows = all
      .filter((a) => a.professional_id === profId && a.dia_semana === dow)
      .map((a) => ({ inicio: hm(a.inicio), fim: hm(a.fim) }))
      .sort((x, y) => x.inicio.localeCompare(y.inicio));
    return rows.length > 0 ? { ativo: true, intervals: rows } : { ativo: false, intervals: [{ inicio: '08:00', fim: '18:00' }] };
  });
}

const PRESETS: { label: string; build: () => DayState[] }[] = [
  {
    label: 'Comercial (seg–sex 8h–18h)',
    build: () => DIAS.map((_, d) => (d >= 1 && d <= 5
      ? { ativo: true, intervals: [{ inicio: '08:00', fim: '18:00' }] }
      : { ativo: false, intervals: [{ inicio: '08:00', fim: '18:00' }] })),
  },
  {
    label: 'Com almoço (8–12h + 14–18h)',
    build: () => DIAS.map((_, d) => (d >= 1 && d <= 5
      ? { ativo: true, intervals: [{ inicio: '08:00', fim: '12:00' }, { inicio: '14:00', fim: '18:00' }] }
      : { ativo: false, intervals: [{ inicio: '08:00', fim: '18:00' }] })),
  },
  {
    label: 'Meio período (seg–sáb 8–12h)',
    build: () => DIAS.map((_, d) => (d >= 1 && d <= 6
      ? { ativo: true, intervals: [{ inicio: '08:00', fim: '12:00' }] }
      : { ativo: false, intervals: [{ inicio: '08:00', fim: '18:00' }] })),
  },
];

export default function AvailabilityEditor({
  businesses,
  professionals,
  availabilities,
  exceptions,
  services,
}: {
  businesses: Business[];
  professionals: Professional[];
  availabilities: Availability[];
  exceptions: AvailabilityException[];
  services: Service[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [profId, setProfId] = useState(professionals[0]?.id ?? '');
  const [week, setWeek] = useState<DayState[]>(() => weekFromAvail(professionals[0]?.id ?? '', availabilities));
  const [excs, setExcs] = useState<ExcLocal[]>(() =>
    exceptions.filter((e) => e.professional_id === (professionals[0]?.id ?? '')).map((e) => ({
      key: e.id, data: e.data, fechado: e.fechado, inicio: hm(e.inicio || '08:00'), fim: hm(e.fim || '18:00'), motivo: e.motivo || '',
    }))
  );
  const [origExcIds, setOrigExcIds] = useState<string[]>(
    exceptions.filter((e) => e.professional_id === (professionals[0]?.id ?? '')).map((e) => e.id)
  );
  const [previewSvc, setPreviewSvc] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const prof = professionals.find((p) => p.id === profId);
  const bizServices = useMemo(() => services.filter((s) => s.business_id === prof?.business_id), [services, prof]);

  function switchProf(id: string) {
    setProfId(id);
    setWeek(weekFromAvail(id, availabilities));
    const list = exceptions.filter((e) => e.professional_id === id).map((e) => ({
      key: e.id, data: e.data, fechado: e.fechado, inicio: hm(e.inicio || '08:00'), fim: hm(e.fim || '18:00'), motivo: e.motivo || '',
    }));
    setExcs(list);
    setOrigExcIds(list.map((e) => e.key));
    setPreviewSvc('');
    setMsg('');
  }

  function setDay(dow: number, patch: Partial<DayState>) {
    setWeek((w) => w.map((d, i) => (i === dow ? { ...d, ...patch } : d)));
  }
  function setInt(dow: number, idx: number, patch: Partial<Interval>) {
    setWeek((w) => w.map((d, i) => (i === dow
      ? { ...d, intervals: d.intervals.map((iv, j) => (j === idx ? { ...iv, ...patch } : iv)) }
      : d)));
  }

  function validate(): string | null {
    for (let dow = 0; dow < 7; dow++) {
      const d = week[dow];
      if (!d.ativo) continue;
      if (d.intervals.length === 0) return `${DIAS[dow]}: dia ativo precisa de ao menos 1 intervalo.`;
      const sorted = [...d.intervals].sort((a, b) => a.inicio.localeCompare(b.inicio));
      for (const iv of sorted) {
        if (!iv.inicio || !iv.fim) return `${DIAS[dow]}: preencha início e fim.`;
        if (iv.inicio >= iv.fim) return `${DIAS[dow]}: ${iv.inicio} precisa ser antes de ${iv.fim}.`;
      }
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].inicio < sorted[i - 1].fim) return `${DIAS[dow]}: intervalos se sobrepõem (${sorted[i - 1].fim} × ${sorted[i].inicio}).`;
      }
    }
    if (!week.some((d) => d.ativo)) return 'Ative ao menos 1 dia da semana.';
    for (const e of excs) {
      if (!e.data) return 'Toda exceção precisa de uma data.';
      if (!e.fechado && e.inicio >= e.fim) return `Exceção ${e.data}: início precisa ser antes do fim.`;
    }
    return null;
  }

  async function save() {
    setMsg('');
    const err = validate();
    if (err) { setMsg(err); return; }
    if (!profId) { setMsg('Escolha um profissional.'); return; }
    setSaving(true);
    try {
      const del = await supabase.from('availabilities').delete().eq('professional_id', profId);
      if (del.error) throw del.error;
      const rows: { professional_id: string; dia_semana: number; inicio: string; fim: string }[] = [];
      week.forEach((d, dow) => {
        if (d.ativo) d.intervals.forEach((iv) => rows.push({ professional_id: profId, dia_semana: dow, inicio: iv.inicio, fim: iv.fim }));
      });
      if (rows.length > 0) {
        const ins = await supabase.from('availabilities').insert(rows);
        if (ins.error) throw ins.error;
      }
      const currentKeys = new Set(excs.map((e) => e.key));
      const removed = origExcIds.filter((id) => !currentKeys.has(id));
      if (removed.length > 0) {
        const r = await supabase.from('availability_exceptions').delete().in('id', removed);
        if (r.error) throw r.error;
      }
      if (excs.length > 0) {
        const up = await supabase.from('availability_exceptions').upsert(
          excs.map((e) => ({
            professional_id: profId,
            data: e.data,
            fechado: e.fechado,
            inicio: e.fechado ? null : e.inicio,
            fim: e.fechado ? null : e.fim,
            motivo: e.motivo.slice(0, 80),
          })),
          { onConflict: 'professional_id,data' }
        );
        if (up.error) throw up.error;
      }
      setMsg('Horários salvos! ✅');
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  const weeklyCapacity = useMemo(() => {
    const svc = bizServices.find((s) => s.id === previewSvc);
    if (!svc || svc.duracao_min <= 0) return null;
    let total = 0;
    week.forEach((d) => {
      if (!d.ativo) return;
      d.intervals.forEach((iv) => { total += Math.floor((toMin(iv.fim) - toMin(iv.inicio)) / svc.duracao_min); });
    });
    return total;
  }, [week, bizServices, previewSvc]);

  if (professionals.length === 0) {
    return (
      <section className="card mt-4">
        <h2 className="font-extrabold">⏰ Horários de atendimento</h2>
        <p className="mt-1 text-sm text-slate-500">Cadastre um profissional acima para configurar os horários.</p>
      </section>
    );
  }

  return (
    <section className="card mt-4">
      <h2 className="text-lg font-extrabold">⏰ Horários de atendimento</h2>
      <p className="text-sm text-slate-500">Defina quando cada profissional atende. Vale na hora para o agendamento online.</p>

      <label className="mt-3 block text-sm font-bold">Profissional</label>
      <select className="input mt-1" value={profId} onChange={(e) => switchProf(e.target.value)}>
        {professionals.map((p) => {
          const b = businesses.find((x) => x.id === p.business_id);
          return <option key={p.id} value={p.id}>{p.nome}{b ? ` — ${b.nome}` : ''}</option>;
        })}
      </select>

      <label className="mt-4 block text-sm font-bold">Comece por um modelo</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => setWeek(p.build())} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold hover:bg-slate-200">
            {p.label}
          </button>
        ))}
        <button onClick={() => setWeek(DIAS.map(() => ({ ativo: false, intervals: [{ inicio: '08:00', fim: '18:00' }] })))} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold hover:bg-slate-200">
          Limpar tudo
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {week.map((d, dow) => (
          <div key={dow} className={`rounded-2xl border p-3 ${d.ativo ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2 font-bold">
                <input type="checkbox" checked={d.ativo} onChange={(e) => setDay(dow, { ativo: e.target.checked })} className="h-5 w-5 accent-emerald-600" />
                {DIAS[dow]}
              </label>
              {dow === 1 && (
                <button
                  onClick={() => setWeek((w) => w.map((x, i) => (i >= 2 && i <= 5 ? { ...w[1] } : x)))}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                  title="Copia os horários de segunda para ter–sex"
                >
                  Copiar seg → ter–sex
                </button>
              )}
            </div>
            {d.ativo && (
              <div className="mt-2 space-y-2">
                {d.intervals.map((iv, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="time" className="input" value={iv.inicio} onChange={(e) => setInt(dow, idx, { inicio: e.target.value })} />
                    <span className="text-slate-400">até</span>
                    <input type="time" className="input" value={iv.fim} onChange={(e) => setInt(dow, idx, { fim: e.target.value })} />
                    {d.intervals.length > 1 && (
                      <button onClick={() => setDay(dow, { intervals: d.intervals.filter((_, j) => j !== idx) })} className="px-2 text-lg text-red-500" title="Remover intervalo">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setDay(dow, { intervals: [...d.intervals, { inicio: '14:00', fim: '18:00' }] })} className="text-xs font-bold text-emerald-700 hover:underline">
                  + adicionar intervalo (ex: volta do almoço)
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className="mt-5 font-extrabold">📅 Exceções (feriados, férias, folgas)</h3>
      <p className="text-sm text-slate-500">Dias que fogem da rotina. Sem isso, cliente agenda em dia fechado.</p>
      <div className="mt-2 space-y-2">
        {excs.map((e) => (
          <div key={e.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <input type="date" className="input !w-auto" value={e.data} onChange={(ev) => setExcs((l) => l.map((x) => (x.key === e.key ? { ...x, data: ev.target.value } : x)))} />
              <label className="flex items-center gap-1 text-sm font-bold">
                <input type="checkbox" checked={e.fechado} onChange={(ev) => setExcs((l) => l.map((x) => (x.key === e.key ? { ...x, fechado: ev.target.checked } : x)))} className="h-4 w-4 accent-emerald-600" />
                Fechado o dia todo
              </label>
              <button onClick={() => setExcs((l) => l.filter((x) => x.key !== e.key))} className="ml-auto text-sm font-bold text-red-500">remover</button>
            </div>
            {!e.fechado && (
              <div className="mt-2 flex items-center gap-2">
                <input type="time" className="input" value={e.inicio} onChange={(ev) => setExcs((l) => l.map((x) => (x.key === e.key ? { ...x, inicio: ev.target.value } : x)))} />
                <span className="text-slate-400">até</span>
                <input type="time" className="input" value={e.fim} onChange={(ev) => setExcs((l) => l.map((x) => (x.key === e.key ? { ...x, fim: ev.target.value } : x)))} />
              </div>
            )}
            <input className="input mt-2" placeholder="Motivo (ex: feriado, férias)" value={e.motivo} onChange={(ev) => setExcs((l) => l.map((x) => (x.key === e.key ? { ...x, motivo: ev.target.value } : x)))} />
          </div>
        ))}
        <button
          onClick={() => setExcs((l) => [...l, { key: `new-${Date.now()}`, data: '', fechado: true, inicio: '08:00', fim: '18:00', motivo: '' }])}
          className="text-sm font-bold text-emerald-700 hover:underline"
        >
          + adicionar exceção
        </button>
      </div>

      {bizServices.length > 0 && (
        <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-sm font-bold">👁 Prévia da capacidade</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select className="input !w-auto !border-white/20 !bg-white/10 !text-white" value={previewSvc} onChange={(e) => setPreviewSvc(e.target.value)}>
              <option value="" className="text-slate-900">Escolha um serviço...</option>
              {bizServices.map((s) => <option key={s.id} value={s.id} className="text-slate-900">{s.nome} ({s.duracao_min}min)</option>)}
            </select>
            {weeklyCapacity !== null && (
              <p className="text-sm">≈ <b className="text-emerald-400">{weeklyCapacity} horários/semana</b> <span className="text-slate-400">(antes dos agendamentos)</span></p>
            )}
          </div>
        </div>
      )}

      {msg && <p className="mt-3 text-sm font-bold">{msg}</p>}
      <button onClick={save} disabled={saving} className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-3 font-extrabold text-white shadow-soft transition hover:bg-emerald-700 disabled:opacity-50">
        {saving ? 'Salvando...' : 'Salvar horários'}
      </button>
    </section>
  );
}
