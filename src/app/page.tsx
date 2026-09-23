import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CATS = ['Salões', 'Barbearias', 'Clínicas', 'Estética', 'Tatuagem', 'Personal', 'Consultorias', 'Oficinas'];

const FEATURES = [
  {
    t: 'Sua página em 5 minutos',
    d: 'Link próprio horamarcada/b/seu-negocio com serviços, profissionais e horários. Sem programar, sem app para baixar.',
  },
  {
    t: 'Cliente agenda sozinho',
    d: 'Escolhe serviço, profissional e horário livre. Sem login obrigatório: só nome + WhatsApp.',
  },
  {
    t: 'Confirmação no WhatsApp',
    d: 'Link de SIM/NÃO pronto para enviar. Quem confirma, aparece. Quem some, você remarca antes.',
  },
  {
    t: 'Cai na agenda do celular',
    d: 'Botão que adiciona o horário no Google Agenda, Apple ou Samsung em 1 clique.',
  },
  {
    t: 'Sem horário duplicado',
    d: 'O sistema calcula ocupação em tempo real. Dois clientes nunca pegam o mesmo horário.',
  },
  {
    t: 'Painel do dono',
    d: 'Agenda do dia e da semana, status de cada atendimento e controle de faltas num só lugar.',
  },
];

const FAQS = [
  {
    q: 'É grátis mesmo?',
    a: 'Sim. O plano Free do piloto é grátis: página padrão, agendamento ilimitado dentro do limite do piloto e confirmação via WhatsApp. O plano Pro (vitrine personalizada) chega em breve.',
  },
  {
    q: 'Meu cliente precisa baixar aplicativo?',
    a: 'Não. Tudo funciona no navegador do celular e do PC. A página de agendamento abre por link, como um site.',
  },
  {
    q: 'Preciso trocar meu número de WhatsApp?',
    a: 'Não. A HoraMarcada gera as mensagens prontas e você envia pelo seu próprio WhatsApp, sem API paga e sem trocar de número.',
  },
  {
    q: 'Serve para o meu tipo de negócio?',
    a: 'Se você atende com hora marcada — salão, clínica, barbearia, estúdio, consultoria, oficina — serve. Se não servir, o piloto é grátis e você simplesmente para de usar.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Guardamos só o essencial da agenda: nome, WhatsApp e horários. Não pedimos diagnóstico, laudo ou dados sensíveis.',
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(600px 300px at 20% 10%, rgba(16,185,129,0.35), transparent), radial-gradient(700px 350px at 85% 20%, rgba(52,211,153,0.2), transparent)',
            }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 md:grid-cols-2 md:pb-24 md:pt-20">
            <div>
              <span className="chip !bg-white/10 !text-emerald-300 !ring-white/15">
                ● Piloto aberto • Grátis
              </span>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                Sua hora marcada, <span className="text-emerald-400">sem faltar.</span>
              </h1>
              <p className="mt-4 max-w-md text-lg text-slate-300">
                Página de agendamento para o seu negócio, confirmação no WhatsApp
                e horário na agenda do cliente. Em 5 minutos, sem app.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/dashboard" className="btn-primary">Criar minha página grátis</a>
                <a href="/explorar" className="btn-ghost !bg-white/10 !text-white !ring-white/20 hover:!ring-white/40">
                  Ver como fica
                </a>
              </div>
              <div className="mt-8 flex gap-8 text-sm">
                <div><p className="text-2xl font-extrabold">5min</p><p className="text-slate-400">para criar</p></div>
                <div><p className="text-2xl font-extrabold">R$0</p><p className="text-slate-400">no piloto</p></div>
                <div><p className="text-2xl font-extrabold">0 apps</p><p className="text-slate-400">para baixar</p></div>
              </div>
            </div>

            {/* Mockup do produto */}
            <div className="relative mx-auto w-full max-w-[320px]">
              <div className="rounded-[2rem] bg-white p-3 shadow-lift ring-1 ring-white/20">
                <div className="rounded-[1.6rem] bg-slate-50 p-4 text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-extrabold text-white">B</span>
                    <div>
                      <p className="text-sm font-extrabold">Salão Bela Vista</p>
                      <p className="text-xs text-slate-500">beleza • responde rápido</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl bg-white p-3 shadow-soft ring-1 ring-slate-100">
                    <p className="text-xs font-bold text-slate-500">CORTE + BARBA • 50 MIN</p>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-xs font-bold">
                      <span className="rounded-lg bg-slate-100 px-2 py-1.5">09:00</span>
                      <span className="rounded-lg bg-emerald-600 px-2 py-1.5 text-white">10:00</span>
                      <span className="rounded-lg bg-slate-100 px-2 py-1.5">11:00</span>
                    </div>
                  </div>
                  <div className="mt-2 rounded-xl bg-emerald-600 p-3 text-center text-sm font-extrabold text-white">
                    Confirmar agendamento
                  </div>
                </div>
              </div>
              <div className="absolute -left-10 top-8 animate-float rounded-2xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-lift ring-1 ring-slate-100">
                ✅ Maria confirmou • 14h
              </div>
              <div className="absolute -right-6 bottom-10 animate-float rounded-2xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-lift ring-1 ring-slate-100" style={{ animationDelay: '1.5s' }}>
                📅 Caiu no Google Agenda
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIAS */}
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-5">
            <span className="mr-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">Feito para</span>
            {CATS.map((c) => (
              <span key={c} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{c}</span>
            ))}
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="eyebrow">Como funciona</p>
          <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">
            Do cadastro ao primeiro agendamento em 3 passos
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { n: '1', t: 'Crie sua página', d: 'Nome, categoria, serviços, profissionais e horários. Pronto: você ganha um link só seu.' },
              { n: '2', t: 'Divulgue o link', d: 'Coloque no Instagram, Google, WhatsApp e na porta da loja. Cliente agenda sozinho, a qualquer hora.' },
              { n: '3', t: 'Confirme e atenda', d: 'Envie a confirmação pronta no WhatsApp, acompanhe no painel e reduza as faltas.' },
            ].map((s) => (
              <div key={s.n} className="card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-lg font-extrabold text-white">{s.n}</span>
                <h3 className="mt-3 text-lg font-extrabold">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <p className="eyebrow">O produto</p>
            <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">
              Tudo que um caderno e um WhatsApp solto não fazem
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.t} className="card transition hover:shadow-lift">
                  <span className="text-xl">✓</span>
                  <h3 className="mt-2 font-extrabold">{f.t}</h3>
                  <p className="mt-1 text-sm text-slate-600">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PREÇOS */}
        <section id="precos" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="eyebrow">Preços</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Comece grátis. Cresça quando fizer sentido.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="card">
              <p className="font-extrabold">Free</p>
              <p className="mt-1"><span className="text-4xl font-extrabold">R$0</span><span className="text-slate-500"> / piloto</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>✓ Página padrão de agendamento</li>
                <li>✓ Agendamento sem login (nome + WhatsApp)</li>
                <li>✓ Confirmação SIM/NÃO + WhatsApp</li>
                <li>✓ Adicionar na agenda do celular</li>
                <li>✓ Painel do dono</li>
              </ul>
              <a href="/dashboard" className="btn-ghost mt-6 w-full">Começar grátis</a>
            </div>
            <div className="card !bg-slate-950 !text-white !ring-slate-900">
              <p className="font-extrabold">Pro <span className="ml-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs text-slate-900">Em breve</span></p>
              <p className="mt-1"><span className="text-4xl font-extrabold">R$49–99</span><span className="text-slate-400"> /mês</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>✓ Tudo do Free</li>
                <li>✓ Vitrine personalizada (cores, banner, fotos)</li>
                <li>✓ Link com cara de site próprio</li>
                <li>✓ Relatórios de faltas e retorno</li>
                <li>✓ Suporte prioritário</li>
              </ul>
              <a href="/dashboard" className="btn-primary mt-6 w-full">Entrar na lista de espera</a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
            <p className="eyebrow">Dúvidas</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Perguntas frequentes</h2>
            <div className="mt-6 space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="card !p-4">
                  <summary className="cursor-pointer font-bold">{f.q}</summary>
                  <p className="mt-2 text-sm text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
          <div className="rounded-3xl bg-emerald-600 px-6 py-12 text-center text-white shadow-lift md:py-16">
            <h2 className="mx-auto max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">
              Sua próxima hora marcada pode chegar hoje
            </h2>
            <p className="mx-auto mt-3 max-w-md text-emerald-50">
              Crie sua página grátis em 5 minutos e receba o primeiro agendamento pelo link.
            </p>
            <a href="/dashboard" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-extrabold text-emerald-700 shadow transition hover:bg-emerald-50 active:scale-[0.98]">
              Criar minha página grátis
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
