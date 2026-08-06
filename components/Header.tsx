'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';
import { Settings, Archive, LogOut, Radio } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    if (navigator.geolocation) {
      setIsTracking(true);
    }

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

  // Captura abrangente de todas as propriedades possíveis de foto do Google/Supabase
  const meta = user?.user_metadata || {};
  const identity = user?.identities?.[0]?.identity_data || {};

  const avatar = 
    meta.avatar_url || 
    meta.picture || 
    identity.avatar_url || 
    identity.picture ||
    user?.raw_user_meta_data?.avatar_url ||
    user?.raw_user_meta_data?.picture;

  const fullName = meta.full_name || identity.full_name || 'Álefe';
  const name = fullName.split(' ')[0];

  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-900 sticky top-0 z-30">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            Olá, {name}
          </h1>
          {/* LED de Radar (Indica Geofencing e GPS Ativo) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
            <div className="relative flex h-2 w-2">
              {isTracking && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isTracking ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
            </div>
            <Radio size={12} className="text-zinc-400" />
          </div>
        </div>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">Nexus • Gestão Inteligente</p>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="focus:outline-none transition-transform active:scale-95 block relative"
        >
          {/* Fallback com a inicial caso não encontre a foto */}
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>

          {/* Imagem do Perfil por cima se a URL existir */}
          {avatar && (
            <img 
              src={avatar} 
              alt="Perfil" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-10 h-10 rounded-full border-2 border-indigo-500/50 object-cover shadow-md shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-4 py-2 border-b border-zinc-800/60 mb-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">{fullName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
            
            <button 
              onClick={() => { setMenuOpen(false); router.push('/archive'); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800/60 transition-all text-left"
            >
              <Archive size={15} className="text-indigo-400" /> Arquivados
            </button>

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
