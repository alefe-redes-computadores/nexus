'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as UserIcon } from 'lucide-react';

export default function Header({ user: propUser }: { user?: any }) {
  const [user, setUser] = useState(propUser);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setUser(data.user);
      });
    }
  }, [propUser]);

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Álefe';
  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-900 sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
          Olá, {name} <span className="text-lg">👋</span>
        </h1>
        <p className="text-xs text-zinc-500 font-medium">Nexus • Gestão Inteligente</p>
      </div>
      <div className="flex items-center">
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
      </div>
    </header>
  );
}
