'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const processLogin = async () => {
      // O Supabase automaticamente captura os tokens da URL assim que essa página carrega
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        router.replace('/'); // Deu certo, vai pro Epicentro!
      } else {
        router.replace('/login'); // Falhou, volta pro login
      }
    };

    processLogin();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm font-medium text-zinc-400 animate-pulse">Concluindo acesso...</p>
      </div>
    </div>
  );
}
