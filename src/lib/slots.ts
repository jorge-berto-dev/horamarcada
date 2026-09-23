import type { Availability, Appointment } from './types';

function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function overlaps(aIni: Date, aFim: Date, bIni: Date, bFim: Date) {
  return aIni < bFim && bIni < aFim;
}

// Gera slots livres de um dia para um profissional/serviço.
// availabilities: regras semanais do profissional | appointments: agendamentos não-cancelados do dia
export function buildFreeSlots(opts: {
  date: Date; // dia (ano/mes/dia, hora ignorada)
  availabilities: Availability[];
  appointments: Pick<Appointment, 'inicio' | 'fim' | 'status'>[];
  duracaoMin: number;
  passoMin?: number; // granularidade, padrão = duração
}): Date[] {
  const { date, availabilities, appointments, duracaoMin, passoMin } = opts;
  const dow = date.getDay();
  const regras = availabilities.filter((a) => a.dia_semana === dow);
  if (regras.length === 0) return [];

  const step = passoMin ?? duracaoMin;
  const busy = appointments
    .filter((a) => a.status !== 'cancelado')
    .map((a) => ({ ini: new Date(a.inicio), fim: new Date(a.fim) }));

  const slots: Date[] = [];
  for (const r of regras) {
    const baseMin = timeToMin(r.inicio);
    const endMin = timeToMin(r.fim);
    for (let m = baseMin; m + duracaoMin <= endMin; m += step) {
      const ini = new Date(date);
      ini.setHours(Math.floor(m / 60), m % 60, 0, 0);
      const fim = new Date(ini.getTime() + duracaoMin * 60000);
      if (fim <= new Date()) continue; // não mostra passado
      const choque = busy.some((b) => overlaps(ini, fim, b.ini, b.fim));
      if (!choque) slots.push(ini);
    }
  }
  return slots.sort((a, b) => a.getTime() - b.getTime());
}

export function formatSlot(d: Date) {
  return d.toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export { minToTime };
