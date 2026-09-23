import Logo from './Logo';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="/" aria-label="HoraMarcada">
          <Logo />
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a href="/explorar" className="hover:text-slate-900">Explorar</a>
          <a href="/#como-funciona" className="hover:text-slate-900">Como funciona</a>
          <a href="/#precos" className="hover:text-slate-900">Preços</a>
          <a href="/#faq" className="hover:text-slate-900">Dúvidas</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 sm:block">
            Entrar
          </a>
          <a href="/dashboard" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-emerald-700">
            Cadastrar grátis
          </a>
        </div>
      </div>
    </header>
  );
}
