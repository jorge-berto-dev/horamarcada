import Logo from './Logo';
import UserMenu from './UserMenu';

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
        <UserMenu />
      </div>
    </header>
  );
}
