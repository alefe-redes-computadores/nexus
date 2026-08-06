// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Briefcase, User, Activity, LogOut } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário está logado ao abrir o app
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Se não tiver sessão, manda pro login
        router.push('/login');
      } else {
        // Se estiver logado, libera a tela
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Tela de carregamento enquanto verifica a segurança
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Sua Rotina</h1>
          <p className="text-zinc-400 text-sm mt-1">O que vamos focar hoje?</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 mt-4">
        
        {/* Card Empresa */}
        <button className="flex items-center gap-4 p-5 bg-zinc-900/80 border border-zinc-800/80 rounded-3xl hover:bg-zinc-800/80 transition-all text-left">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Empresa</h2>
            <p className="text-sm text-zinc-500 mt-1">Tarefas corporativas e prazos</p>
          </div>
        </button>

        {/* Card Pessoal */}
        <button className="flex items-center gap-4 p-5 bg-zinc-900/80 border border-zinc-800/80 rounded-3xl hover:bg-zinc-800/80 transition-all text-left">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Pessoal</h2>
            <p className="text-sm text-zinc-500 mt-1">Rotinas diárias e metas</p>
          </div>
        </button>

        {/* Card Saúde */}
        <button className="flex items-center gap-4 p-5 bg-zinc-900/80 border border-zinc-800/80 rounded-3xl hover:bg-zinc-800/80 transition-all text-left">
          <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Saúde</h2>
            <p className="text-sm text-zinc-500 mt-1">Medicamentos e consultas</p>
          </div>
        </button>

      </div>
    </div>
  );
}
