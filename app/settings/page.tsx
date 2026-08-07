'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/db';
import { fullSyncWithCloud } from '../../lib/sync';
import { requestNotificationPermission } from '../../lib/notifications';
import Header from '../../components/Header';
import { LogOut, RefreshCw, Bell, User as UserIcon, Trash2, ChevronRight, ArrowLeft, Clock, Tags, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { triggerHaptic } from '../../lib/haptics';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [notifGranted, setNotifGranted] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // Estados do Pomodoro
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  // Estados de Categorias
  const [categories, setCategories] = useState<string[]>(['Pessoal', 'Trabalho', 'Documentos', 'Alimentação', 'Geral']);
  const [newCat, setNewCat] = useState('');

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login');
      } else {
        setUser(data.user);
      }
      setLoadingAuth(false);
    });

    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }

    // Carrega configurações locais do Pomodoro
    const savedFocus = localStorage.getItem('@nexus:focusTime');
    const savedBreak = localStorage.getItem('@nexus:breakTime');
    if (savedFocus) setFocusTime(Number(savedFocus));
    if (savedBreak) setBreakTime(Number(savedBreak));

    // Carrega categorias salvas
    const savedCats = localStorage.getItem('@nexus:categories');
    if (savedCats) {
      try {
        setCategories(JSON.parse(savedCats));
      } catch (e) {
        console.error("Erro ao ler categorias");
      }
    }
  }, [router]);

  // --- FUNÇÕES DO POMODORO ---
  const handleSavePomodoro = (f: number, b: number) => {
    triggerHaptic('success');
    setFocusTime(f);
    setBreakTime(b);
    localStorage.setItem('@nexus:focusTime', String(f));
    localStorage.setItem('@nexus:breakTime', String(b));
  };

  // --- FUNÇÕES DE CATEGORIAS ---
  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    const catName = newCat.trim();
    if (!categories.includes(catName)) {
      const updated = [...categories, catName];
      setCategories(updated);
      localStorage.setItem('@nexus:categories', JSON.stringify(updated));
      triggerHaptic('success');
    }
    setNewCat('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    triggerHaptic('medium');
    const updated = categories.filter(c => c !== catToRemove);
    setCategories(updated);
    localStorage.setItem('@nexus:categories', JSON.stringify(updated));
  };

  // --- FUNÇÕES DE SISTEMA ---
  async function handleManualSync() {
    if (!user) return;
    triggerHaptic('light');
    setSyncing(true);
    setSyncStatus('Sincronizando...');
    const res = await fullSyncWithCloud(user.id);
    setSyncStatus(res.message);
    setSyncing(false);
  }

  async function handleClearCache() {
    triggerHaptic('heavy');
    if (confirm('Deseja limpar o cache local? Isso não apagará os dados na nuvem.')) {
      await db.tasks.clear();
      alert('Cache limpo!');
      window.location.reload();
    }
  }

  async function handleLogout() {
    triggerHaptic('heavy');
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      await db.tasks.clear().catch(() => {});
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      window.location.href = '/login';
    }
  }

  if (loadingAuth) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
        Carregando...
      </main>
    );
  }

  // Fallback e busca robusta de Avatar
  const meta = user?.user_metadata || {};
  const identity = user?.identities?.[0]?.identity_data || {};
  const avatar = meta.avatar_url || meta.picture || identity?.avatar_url || identity?.picture;
  const fullName = meta.full_name || identity?.full_name || 'Álefe';

  return (
    <main className="min-h-screen bg-zinc-950 pb-20 text-zinc-100 font-sans">
      <Header />
      
      {/* Barra de Navegação Interna */}
      <div className="px-6 mt-6 mb-6 flex items-center gap-3">
        <button 
          onClick={() => { triggerHaptic('light'); router.push('/'); }}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-300">
          Configurações
        </h2>
      </div>

      <div className="px-6 space-y-8">
        
        {/* PERFIL */}
        <section className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Conta Principal</span>
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-4 flex items-center gap-4 shadow-sm">
            <div className="relative shrink-0 w-14 h-14 rounded-full border border-zinc-700/50 bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              {!avatar || imgError ? (
                <UserIcon size={24} />
              ) : (
                <img 
                  src={avatar} 
                  className="absolute inset-0 w-full h-full rounded-full object-cover" 
                  alt="Perfil" 
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className="font-bold text-sm text-zinc-100 truncate">{fullName}</h3>
              <p className="text-xs text-zinc-500 truncate font-medium">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* PRODUTIVIDADE (POMODORO) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 ml-1">
            <Clock size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Imersão & Foco</span>
          </div>
          
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-1 flex gap-1">
            <button 
              onClick={() => handleSavePomodoro(25, 5)}
              className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${focusTime === 25 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              Clássico (25/5 min)
            </button>
            <button 
              onClick={() => handleSavePomodoro(50, 10)}
              className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${focusTime === 50 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              Profundo (50/10 min)
            </button>
          </div>
        </section>

        {/* GERENCIADOR DE CATEGORIAS */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 ml-1">
            <Tags size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gerenciar Categorias</span>
          </div>

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">{cat}</span>
                  <button onClick={() => handleRemoveCategory(cat)} className="text-zinc-500 hover:text-red-400 p-0.5 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Nova categoria..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500/50 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button 
                onClick={handleAddCategory}
                className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-600/30 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </section>

        {/* SISTEMA E DADOS */}
        <section className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Sistema & Dados</span>
          
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60 shadow-sm">
            
            {/* Sync */}
            <button onClick={handleManualSync} disabled={syncing} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/40 transition-all text-left">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Sincronizar Manualmente</h4>
                  <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{syncStatus || 'Backup forçado com a nuvem'}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
            </button>

            {/* Notificações */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Bell size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Permissão de Alertas</h4>
                  <p className="text-[10px] font-medium mt-0.5 text-zinc-500">{notifGranted ? 'Notificações Ativas' : 'Alertas Desativados'}</p>
                </div>
              </div>
              {!notifGranted && (
                <button onClick={async () => { triggerHaptic('light'); const g = await requestNotificationPermission(); setNotifGranted(g); }} className="px-4 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-400 active:scale-95 transition-all">
                  Ativar
                </button>
              )}
            </div>

            {/* Cache Local */}
            <button onClick={handleClearCache} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/40 transition-all text-left">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Limpar Armazenamento Local</h4>
                  <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Resolve erros de lentidão ou cache</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
            </button>
          </div>
        </section>

        {/* ZONA DE PERIGO (LOGOUT) */}
        <section className="pt-4">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </section>
      </div>
    </main>
  );
}
