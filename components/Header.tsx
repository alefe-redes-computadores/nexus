'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Busca o usuário completo autenticado no Supabase
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    // Fecha o menu ao clicar fora
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    await db.tasks.clear();
    router.push('/');
  }

  // Varredura ampla em todas as possíveis origens da foto do Google no Supabase
  const avatar = 
    user?.user_metadata?.avatar_url || 
    user?.user_metadata?.picture || 
    user?.identities?.[0]?.identity_data?.avatar_url ||
    user?.identities?.[0]?.identity_data?.picture;

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Álefe';

  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-900 sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
          Olá, {name} <span className="text-lg">👋</span>
        </h1>
        <p className="text-xs text-zinc-500 font-medium">Nexus • Gestão Inteligente</p>
      </div>

      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="focus:outline-none transition-transform active:scale-95 block"
        >
          {avatar ? (
            <img 
              src={avatar} 
              alt="Perfil" 
              className="w-10 h-10 rounded-full border-2 border-indigo-500/50 object-cover shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <UserIcon size={18} />
            </div>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-4 py-2 border-b border-zinc-800/60 mb-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">{user?.user_metadata?.full_name || 'Usuário'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
            
            <button 
              onClick={() => { setMenuOpen(false); router.push('/settings'); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800/60 transition-all text-left"
            >
              <Settings size={15} className="text-indigo-400" /> Configurações
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-all text-left"
            >
              <LogOut size={15} /> Sair da Conta
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
