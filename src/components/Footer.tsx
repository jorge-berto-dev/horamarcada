import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-3 text-sm text-slate-400">
            Agendamento online para qualquer negócio. Sua hora marcada, sem faltar.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Produto</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/explorar" className="hover:text-white">Explorar negócios</a></li>
            <li><a href="/#precos" className="hover:text-white">Preços</a></li>
            <li><a href="/dashboard" className="hover:text-white">Cadastrar negócio</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Conta</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/login" className="hover:text-white">Entrar</a></li>
            <li><a href="/meus-agendamentos" className="hover:text-white">Meus agendamentos</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Piloto</p>
          <p className="mt-3 text-sm text-slate-400">
            Versão piloto gratuita. Feito no Brasil, para pequenos negócios.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500">
          <span>© 2026 HoraMarcada</span>
          <span>Sem app para baixar • Funciona no celular e no PC</span>
        </div>
      </div>
    </footer>
  );
}
