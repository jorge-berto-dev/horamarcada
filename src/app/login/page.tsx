'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '@/components/Logo';

type Modo = 'entrar' | 'criar' | 'recuperar';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [whats, setWhats] = useState('');
  const [papel, setPapel] = useState<'dono' | 'cliente'>('dono');
  const [modo, setModo] = useState<Modo>('entrar');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const afterLogin = (tipo?: string) => {
    const next = params.get('next');
    if (next) { router.push(next); return; }
    router.push(tipo === 'cliente' ? '/explorar' : '/dashboard');
  };

  async function entrar() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    const { data: prof } = await supabase.from('profiles').select('tipo').eq('id', data.user.id).single();
    afterLogin((prof as { tipo: string } | null)?.tipo);
  }

  async function criar() {
    if (!nome.trim()) throw new Error('Informe seu nome.');
    if (senha.length < 6) throw new Error('A senha precisa de ao menos 6 caracteres.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${papel === 'cliente' ? '/explorar' : '/dashboard'}` },
    });
    if (error) throw error;
    if (data.user) {
      const { error: pErr } = await supabase.from('profiles').upsert({
        id: data.user.id, nome: nome.trim(), whatsapp: whats.trim(), tipo: papel,
      });
      if (pErr) throw pErr;
    }
    // Se o Supabase exigir confirmação de e-mail, não há sessão ainda:
    const { data: { session } } = await supabase.auth.getSession();
    if (session) afterLogin(papel);
    else setMsg('Conta criada! Verifique seu e-mail para confirmar e entre.');
  }

  async function recuperar() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/nova-senha`,
    });
    if (error) throw error;
    setMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) throw error;
  }

  async function handle() {
    setMsg('');
    setLoading(true);
    try {
      if (modo === 'entrar') await entrar();
      else if (modo === 'criar') await criar();
      else await recuperar();
    } catch (e) {
      setMsg(e instanceof Error ? friendly(e.message) : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lift">
        <a href="/" aria-label="HoraMarcada"><Logo /></a>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          {modo === 'entrar' ? 'Bem-vindo de volta' : modo === 'criar' ? 'Crie sua conta' : 'Recuperar senha'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {modo === 'criar'
            ? 'Grátis no piloto. Sua página no ar em 5 minutos.'
            : modo === 'recuperar'
              ? 'Enviamos um link para redefinir sua senha.'
              : 'Gerencie sua página e sua agenda.'}
        </p>

        {params.get('erro') === 'callback' && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            Não foi possível concluir o login. Tente novamente.
          </p>
        )}

        {modo === 'criar' && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              {(['dono', 'cliente'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPapel(p)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition ${papel === p ? 'bg-white shadow' : 'text-slate-500'}`}
                >
                  {p === 'dono' ? '🏪 Sou dono' : '📅 Sou cliente'}
                </button>
              ))}
            </div>
            <input className="input mt-2" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input className="input mt-2" placeholder="WhatsApp (opcional)" inputMode="tel" value={whats} onChange={(e) => setWhats(e.target.value)} />
          </>
        )}

        <input className="input mt-2" placeholder="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {modo !== 'recuperar' && (
          <input className="input mt-2" placeholder="Senha (mín. 6 caracteres)" type="password" autoComplete={modo === 'criar' ? 'new-password' : 'current-password'} value={senha} onChange={(e) => setSenha(e.target.value)} />
        )}

        <button onClick={handle} disabled={loading} className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-3 font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-50">
          {loading ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : modo === 'criar' ? 'Criar conta grátis' : 'Enviar link'}
        </button>

        <button onClick={google} className="mt-2 w-full rounded-full bg-white px-4 py-3 font-bold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white">G</span>
          Continuar com Google
        </button>

        <div className="mt-3 flex flex-col gap-1 text-center text-sm">
          {modo === 'entrar' ? (
            <>
              <button onClick={() => setModo('criar')} className="font-semibold text-emerald-700 hover:underline">Não tem conta? Criar grátis</button>
              <button onClick={() => setModo('recuperar')} className="text-slate-500 hover:underline">Esqueci minha senha</button>
            </>
          ) : modo === 'criar' ? (
            <button onClick={() => setModo('entrar')} className="font-semibold text-emerald-700 hover:underline">Já tem conta? Entrar</button>
          ) : (
            <button onClick={() => setModo('entrar')} className="font-semibold text-emerald-700 hover:underline">Voltar ao login</button>
          )}
        </div>

        {msg && <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-center text-sm font-semibold">{msg}</p>}
        <p className="mt-4 text-center text-xs text-slate-400">Clientes agendam sem conta, só com nome + WhatsApp.</p>
      </div>
    </main>
  );
}

function friendly(m: string) {
  if (/invalid login|invalid.*credentials/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/already registered|already exists|user already/i.test(m)) return 'Este e-mail já tem conta. Tente entrar.';
  if (/password.*6|weak/i.test(m)) return 'Use uma senha com ao menos 6 caracteres.';
  if (/email.*invalid/i.test(m)) return 'Verifique o e-mail digitado.';
  return m;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
