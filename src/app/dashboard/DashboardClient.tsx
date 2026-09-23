'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { waLink, reminderBatchMessage } from '@/lib/wame';
import type { Appointment, Availability, AvailabilityException, Business, Professional, Service } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import Logo from '@/components/Logo';
import AvailabilityEditor from './AvailabilityEditor';

export default function DashboardClient({
  userEmail, businesses, appointments, services, professionals, availabilities, exceptions,
}: {
  userEmail: string;
  businesses: Business[];
  appointments: (Appointment & { services?: { nome: string } })[];
  services: Service[];
  professionals: Professional[];
  availabilities: Availability[];
  exceptions: AvailabilityException[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [bizForm, setBizForm] = useState({ nome: '', slug: '', whatsapp: '', categoria: 'beleza', descricao: '' });
  const [msg, setMsg] = useState('');

  async function createBusiness() {
    setMsg('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg('Faça login.'); return; }
    const slug = bizForm.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (!bizForm.nome || !slug) { setMsg('Preencha nome e slug (ex: salao-bela-vista).'); return; }
    const { error } = await supabase.from('businesses').insert({
      owner_id: user.id, nome: bizForm.nome, slug, whatsapp: bizForm.whatsapp,
      categoria: bizForm.categoria, descricao: bizForm.descricao,
    });
    setMsg(error ? error.message : 'Negócio criado! Recarregue a página.');
    if (!error) setBizForm({ nome: '', slug: '', whatsapp: '', categoria: 'beleza', descricao: '' });
  }

  async function setStatus(id: string, status: Appointment['status']) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    setMsg(error ? error.message : `Agendamento → ${status}. Recarregue.`);
  }

  async function quickAdd(table: 'services' | 'professionals', business_id: string, nome: string, extra?: Record<string, unknown>) {
    if (!nome.trim()) return;
    const { error } = await supabase.from(table).insert({ business_id, nome: nome.trim(), ...extra });
    setMsg(error ? error.message : 'Adicionado! Recarregue.');
  }

  const [svcName, setSvcName] = useState('');
  const [profName, setProfName] = useState('');

  return (
    <main className="min-h-screen">
      <div className="border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <a href="/" aria-label="HoraMarcada"><Logo size={26} /></a>
          <div className="flex items-center gap-3 text-sm">
            <a href="/explorar" className="font-bold text-slate-500 hover:text-slate-900">Explorar</a>
            <a href="/conta" className="font-bold text-slate-500 hover:text-slate-900">Conta</a>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/'); router.refresh(); }}
              className="font-bold text-slate-500 hover:text-slate-900"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Painel do dono</h1>
      <p className="text-sm text-slate-500">{userEmail}</p>

      <section className="mt-4 rounded-xl bg-white p-4 shadow">
        <h2 className="font-bold">+ Novo negócio (qualquer área)</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input className="rounded-lg border p-2" placeholder="Nome (Salão Bela Vista)" value={bizForm.nome} onChange={(e) => setBizForm({ ...bizForm, nome: e.target.value })} />
          <input className="rounded-lg border p-2" placeholder="slug (salao-bela-vista)" value={bizForm.slug} onChange={(e) => setBizForm({ ...bizForm, slug: e.target.value })} />
          <input className="rounded-lg border p-2" placeholder="WhatsApp (55119...)" value={bizForm.whatsapp} onChange={(e) => setBizForm({ ...bizForm, whatsapp: e.target.value })} />
          <select className="rounded-lg border p-2" value={bizForm.categoria} onChange={(e) => setBizForm({ ...bizForm, categoria: e.target.value })}>
            {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <input className="mt-2 w-full rounded-lg border p-2" placeholder="Descrição curta (ex: cortes, barba e estética)" value={bizForm.descricao} onChange={(e) => setBizForm({ ...bizForm, descricao: e.target.value })} />
        <button onClick={createBusiness} className="mt-2 rounded-lg bg-black px-4 py-2 font-bold text-white">Criar</button>
      </section>

      {businesses.map((b) => (
        <section key={b.id} className="mt-4 rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg font-bold">{b.nome} <span className="text-xs font-normal text-gray-500">[{b.plano}]</span></h2>
          <p className="text-sm">Link público: <a className="text-blue-700 underline" href={`/b/${b.slug}`}>/b/{b.slug}</a></p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-2">
              <b className="text-sm">Serviços</b>
              {(services as Service[]).filter((s) => s.business_id === b.id).map((s) => (
                <p key={s.id} className="text-sm">{s.nome} • {s.duracao_min}min • R$ {Number(s.preco).toFixed(2)}</p>
              ))}
              <div className="mt-1 flex gap-1">
                <input className="w-full rounded border p-1 text-sm" placeholder="Novo serviço" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
                <button onClick={() => quickAdd('services', b.id, svcName, { duracao_min: 50, preco: 0 })} className="rounded bg-black px-2 text-white">+</button>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-2">
              <b className="text-sm">Profissionais</b>
              {(professionals as Professional[]).filter((p) => p.business_id === b.id).map((p) => (
                <p key={p.id} className="text-sm">{p.nome}</p>
              ))}
              <div className="mt-1 flex gap-1">
                <input className="w-full rounded border p-1 text-sm" placeholder="Novo profissional" value={profName} onChange={(e) => setProfName(e.target.value)} />
                <button onClick={() => quickAdd('professionals', b.id, profName)} className="rounded bg-black px-2 text-white">+</button>
              </div>
            </div>
          </div>

          <h3 className="mt-3 font-bold">Próximos agendamentos</h3>
          {(appointments as Appointment[]).filter((a) => a.business_id === b.id).length === 0 && (
            <p className="text-sm text-gray-500">Nenhum ainda. Divulgue seu link.</p>
          )}
          {(appointments as Appointment[]).filter((a) => a.business_id === b.id).map((a) => (
            <div key={a.id} className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm">
              <span><b>{new Date(a.inicio).toLocaleString('pt-BR')}</b> • {a.guest_nome} • {a.status}</span>
              <a
                className="rounded bg-green-600 px-2 py-1 text-white"
                target="_blank"
                href={waLink(a.guest_whatsapp || b.whatsapp, reminderBatchMessage(a.guest_nome, new Date(a.inicio).toLocaleString('pt-BR'), ''))}
              >
                WhatsApp
              </a>
              <a className="rounded bg-gray-200 px-2 py-1" target="_blank" href={`/c/${a.token_publico}`}>Abrir confirmação</a>
              <button onClick={() => setStatus(a.id, 'confirmado')} className="rounded bg-blue-100 px-2 py-1">Confirmar</button>
              <button onClick={() => setStatus(a.id, 'concluido')} className="rounded bg-gray-100 px-2 py-1">Concluir</button>
              <button onClick={() => setStatus(a.id, 'faltou')} className="rounded bg-yellow-100 px-2 py-1">Faltou</button>
              <button onClick={() => setStatus(a.id, 'cancelado')} className="rounded bg-red-100 px-2 py-1 text-red-700">Cancelar</button>
            </div>
          ))}
        </section>
      ))}
      {msg && <p className="mt-3 text-sm font-semibold">{msg}</p>}

      <AvailabilityEditor
        businesses={businesses}
        professionals={professionals}
        availabilities={availabilities}
        exceptions={exceptions}
        services={services}
      />
      </div>
    </main>
  );
}
