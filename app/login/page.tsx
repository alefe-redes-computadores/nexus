'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 text-zinc-100">
      {/* Background Glow FX */}
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6">
          
          {/* Logo com brilho */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 opacity-30 blur-sm" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700/60 bg-zinc-950 p-2 shadow-inner">
              <Image 
                src="/logo.png" 
                alt="Nexus Logo" 
                width={64} 
                height={64} 
                className="h-full w-full object-contain"
                priority
              />
            </div>
          </div>

          {/* Título e Subtítulo */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Nexus
            </h1>
            <p className="mt-1 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Gestão Inteligente
            </p>
          </div>

          {/* Divider discreto */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          {error && (
            <div className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs font-medium text-rose-400">
              {error}
            </div>
          )}

          {/* Botão Google Estilizado */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950/80 py-3.5 px-4 font-semibold text-zinc-100 shadow-lg transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-900 active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="h-5 w-5 min-w-[20px] transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15C3.5 18.9 7.4 23 12 23z"/>
            </svg>
            <span className="text-sm font-semibold tracking-wide">
              {loading ? 'Conectando...' : 'Entrar com o Google'}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
