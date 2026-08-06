'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

export default function Header({ user: initialUser }: { user?: any }) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    // Se a página não passou o usuário, o Header busca diretamente da sessão do Supabase
    if (!initialUser) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUser(data.user);
      });
    } else {
      setUser(initialUser);
    }
  }, [initialUser]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Álefe';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="space-y-0.5">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-100">
          Olá, <span className="text-indigo-400">{firstName}</span> 👋
        </h1>
        <p className="text-xs text-zinc-500 font-medium">Nexus • Gestão Inteligente</p>
      </div>

      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            className="h-11 w-11 rounded-full border-2 border-indigo-500/40 object-cover shadow-lg shadow-indigo-500/10" 
            alt="Perfil do Google" 
          />
        ) : (
          <div className="h-11 w-11 rounded-full border-2 border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 shadow-inner">
            <User size={20} />
          </div>
        )}
      </div>
    </header>
  );
}
