'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/db';
import { fullSyncWithCloud } from '../../lib/sync';
import { requestNotificationPermission } from '../../lib/notifications';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { LogOut, RefreshCw, Bell, MapPin, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [notifGranted, setNotifGranted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/');
      } else {
        setUser(data.user);
      }
    });

    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, [router]);

  // Ação de Sincronização Manual (Forçar puxar da nuvem e enviar local)
  async function handleManualSync() {
    if (!user) return;
    setSyncing(true);
    setSyncStatus('Sincronizando com Supabase...');

    const res = await fullSyncWithCloud(user.id);
    setSyncStatus(res.message);
    setSyncing(false);
  }

  // Ação de Solicitar Notificação Nativa
  async function handleEnableNotifications() {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) alert('Notificações ativadas com sucesso!');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    await db.tasks.clear();
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100">
      <Header user={user} />
      
      <div className="px-6 space-y-5">
        <h2 className="text-xl font-bold tracking-tight">Configurações & Sincronização</h2>

        {/* Card de Sincronização Cloud */}
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className={`text-indigo-400 ${syncing ? 'animate-spin' : ''}`} />
              <h3 className="font-semibold text-sm">Sincronização com a Nuvem</h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            Use esta opção se reinstalou o app ou deseja forçar a atualização dos dados com a sua conta no Supabase.
          </p>
          <button 
            onClick={handleManualSync}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
          {syncStatus && <p className="text-[11px] text-center text-indigo-300 font-medium">{syncStatus}</p>}
        </div>

        {/* Card de Permissões (GPS e Notificações) */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-400" /> Permissões do Dispositivo
          </h3>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <Bell size={16} className="text-zinc-500" /> Notificações
            </div>
            {notifGranted ? (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Ativo</span>
            ) : (
              <button onClick={handleEnableNotifications} className="text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1 rounded-lg font-semibold">Ativar</button>
            )}
          </div>

          <div className="flex items-center justify-between py-1 border-t border-zinc-800/60 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <MapPin size={16} className="text-zinc-500" /> Rastreamento de GPS
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">Local-First</span>
          </div>
        </div>

        {/* Card da Conta */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <UserIcon size={16} className="text-indigo-400" /> Perfil do Usuário
          </div>
          <p className="text-xs text-zinc-400 truncate">{user?.email || 'Carregando...'}</p>
        </div>

        {/* Botão Sair */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 rounded-xl text-xs font-bold text-red-400 transition-all active:scale-95"
        >
          <LogOut size={16} /> Sair da Conta
        </button>
      </div>

      <Navbar onAddTask={() => {}} />
    </main>
  );
}
