export default function Logo({ light = false, size = 32 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="14" fill="#059669" />
        <path d="M16 9v7l5 3" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="14" stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.5" />
      </svg>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        Hora<span className="text-emerald-600">Marcada</span>
      </span>
    </span>
  );
}
