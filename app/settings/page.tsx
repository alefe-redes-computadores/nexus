'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/db';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { LogOut, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/');
      } else {
        setUser(data.user);
      }
    });
  }, [router]);

  // Função para limpar os dados locais do Dexie (Limpar Cache)
  async function handleClearLocalData() {
    if (confirm('Deseja limpar todos os dados locais do dispositivo?')) {
      await db.tasks.clear();
      alert('Dados locais limpos com sucesso!');
      window.location.reload();
    }
  }

  // Função de Logout (Sair da Conta)
  async function handleLogout() {
    await supabase.auth.signOut();
    await db.tasks.clear(); // Limpa o banco local ao sair
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100">
      <Header user={user} />
      
      <div className="px-6 space-y-6">
        <h2 className="text-xl font-bold tracking-tight">Configurações</h2>

        {/* Card de Perfil */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-3">
            <UserIcon size={20} className="text-indigo-400" />
            <h3 className="font-semibold text-sm">Conta Conectada</h3>
          </div>
          <div className="text-xs text-zinc-400 space-y-1">
            <p><strong className="text-zinc-200">Nome:</strong> {user?.user_metadata?.full_name || 'Não informado'}</p>
            <p><strong className="text-zinc-200">E-mail:</strong> {user?.email || 'Não informado'}</p>
          </div>
        </div>

        {/* Card de Ações do Sistema */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-indigo-400" />
            <h3 className="font-semibold text-sm">Armazenamento Local</h3>
          </div>
          <p className="text-xs text-zinc-400">
            O aplicativo opera em modo Local-First usando o IndexedDB do seu aparelho para máxima velocidade.
          </p>
          <button 
            onClick={handleClearLocalData}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 transition-all"
          >
            <Trash2 size={16} /> Limpar Cache Local
          </button>
        </div>

        {/* Botão de Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 rounded-2xl text-xs font-bold text-red-400 transition-all active:scale-[0.98]"
        >
          <LogOut size={16} /> Sair da Conta
        </button>
      </div>

      <Navbar onAddTask={() => {}} />
    </main>
  );
}
