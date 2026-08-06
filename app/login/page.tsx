// app/login/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Login com E-mail e Senha
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  // Login Social com Google (Otimizado para Capacitor/Web)
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl shadow-2xl">
        
        {/* Logo do App */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-zinc-700/50">
            <Image 
              src="/logo.png" 
              alt="Nexus Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Nexus</h1>
            <p className="text-xs tracking-wider text-zinc-400 uppercase mt-0.5">Gestão Inteligente</p>
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {error && (
          <div className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Formulário de Email/Senha */}
        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-3">
          <div className="relative flex items-center">
            <Mail className="absolute left-4 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              required
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-11 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-4 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-11 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-medium py-3 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <span>{loading ? 'Entrando...' : 'Entrar na conta'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="flex items-center w-full my-1">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Ou acesse com</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Botão Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-zinc-950/60 hover:bg-zinc-800/80 active:scale-[0.99] border border-zinc-800 text-zinc-200 font-medium py-3 px-4 rounded-2xl transition-all"
        >
          {/* Ícone SVG oficial do Google */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15C3.5 18.9 7.4 23 12 23z"
            />
          </svg>
          <span className="text-sm font-semibold">Google</span>
        </button>

      </div>

      <span className="text-[11px] text-zinc-600 tracking-wider uppercase mt-8 font-medium">
        Uso Interno e Pessoal
      </span>
    </div>
  );
}
