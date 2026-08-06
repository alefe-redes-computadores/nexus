'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/db';
import { fullSyncWithCloud } from '../../lib/sync';
import { requestNotificationPermission } from '../../lib/notifications';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { LogOut, RefreshCw, Bell, User as UserIcon, Trash2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
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
      setLoadingAuth(false);
    });

    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, [router]);

  if (loadingAuth) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-sm font-sans">
        Carregando...
      </main>
    );
  }

  async function handleManualSync() {
    if (!user) return;
    setSyncing(true);
    setSyncStatus('Sincronizando...');
    const res = await fullSyncWithCloud(user.id);
    setSyncStatus(res.message);
    setSyncing(false);
  }

  async function handleClearCache() {
    if (confirm('Deseja limpar o cache local?')) {
      await db.tasks.clear();
      alert('Cache limpo!');
      window.location.reload();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    await db.tasks.clear();
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-32 text-zinc-100 font-sans">
      <Header user={user} />
      
      <div className="px-6 max-w-md mx-auto space-y-6 pt-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">Configurações</h2>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center gap-4 shadow-xl">
          {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
            <img src={user.user_metadata.avatar_url || user.user_metadata.picture} className="w-12 h-12 rounded-full border border-zinc-700 object-cover" alt="Perfil" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <UserIcon size={22} />
            </div>
          )}
          <div className="overflow-hidden">
            <h3 className="font-semibold text-sm text-zinc-200 truncate">{user?.user_metadata?.full_name || 'Usuário'}</h3>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden divide-y divide-zinc-800/80 shadow-xl">
          <button onClick={handleManualSync} disabled={syncing} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400"><RefreshCw size={18} className={syncing ? 'animate-spin' : ''} /></div>
              <div>
                <h4 className="text-sm font-medium text-zinc-200">Sincronizar com Nuvem</h4>
                <p className="text-[11px] text-zinc-500">{syncStatus || 'Atualizar dados do Supabase'}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-600" />
          </button>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400"><Bell size={18} /></div>
              <div>
                <h4 className="text-sm font-medium text-zinc-200">Notificações Nativas</h4>
                <p className="text-[11px] text-zinc-500">{notifGranted ? 'Ativadas' : 'Desativadas'}</p>
              </div>
            </div>
            {!notifGranted && (
              <button onClick={async () => { const g = await requestNotificationPermission(); setNotifGranted(g); }} className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white active:scale-95 transition-all">
                Ativar
              </button>
            )}
          </div>

          <button onClick={handleClearCache} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400"><Trash2 size={18} /></div>
              <div>
                <h4 className="text-sm font-medium text-zinc-200">Limpar Cache Local</h4>
                <p className="text-[11px] text-zinc-500">Apagar banco Dexie do aparelho</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-600" />
          </button>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all active:scale-95">
          <LogOut size={16} /> Sair da Conta
        </button>
      </div>

      <Navbar onAddTask={() => {}} />
    </main>
  );
}
