'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
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
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 bg-[#09090b]">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
        
        {/* Logo do App com tamanho travado (64x64) */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-zinc-700/50 flex items-center justify-center bg-black w-16 h-16">
            <Image 
              src="/logo.png" 
              alt="Nexus Logo" 
              width={64} 
              height={64} 
              className="object-cover"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Nexus</h1>
            <p className="text-xs tracking-wider text-zinc-400 uppercase mt-0.5">Gestão Inteligente</p>
          </div>
        </div>

        {error && (
          <div className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium py-3 px-4 rounded-2xl transition-all disabled:opacity-50 mt-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15C3.5 18.9 7.4 23 12 23z"/>
          </svg>
          <span className="text-sm font-semibold">{loading ? 'Conectando...' : 'Entrar com o Google'}</span>
        </button>

      </div>
    </div>
  );
}
