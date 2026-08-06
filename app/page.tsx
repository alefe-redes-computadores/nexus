'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { db, Task } from '../lib/db';
import { initAutoSync } from '../lib/sync';
import { startGeofenceWatcher } from '../lib/notifications';
import Header from '../components/Header';
import QuickInputBar from '../components/QuickInputBar';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import { LayoutGrid, Flame, Archive, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Epicentro() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'pending' | 'archived'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u);
      if (u) {
        const cleanup = initAutoSync(u.id, loadTasks);
        return () => cleanup?.();
      }
    });
    loadTasks();
    startGeofenceWatcher();
  }, [view]);

  async function loadTasks() {
    const localTasks = await db.tasks.where('status').equals(view).toArray();
    setTasks(localTasks);
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100 font-sans">
      <Header />
      
      {/* Painel de Comando - Substitui abas chatas */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => setView('pending')}
            className={`relative overflow-hidden p-4 rounded-3xl border transition-all ${view === 'pending' ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800'}`}
          >
            <div className="flex flex-col gap-1 text-left">
              <Zap size={18} className={view === 'pending' ? 'text-indigo-400' : 'text-zinc-500'} />
              <span className="text-xs font-bold text-zinc-300">Pendentes</span>
            </div>
          </button>
          <button 
            onClick={() => setView('archived')}
            className={`relative overflow-hidden p-4 rounded-3xl border transition-all ${view === 'archived' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-zinc-900 border-zinc-800'}`}
          >
            <div className="flex flex-col gap-1 text-left">
              <ShieldCheck size={18} className={view === 'archived' ? 'text-emerald-400' : 'text-zinc-500'} />
              <span className="text-xs font-bold text-zinc-300">Arquivados</span>
            </div>
          </button>
        </div>

        {/* Header do Painel */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold tracking-tight text-zinc-400 flex items-center gap-2">
            <LayoutGrid size={14} /> Atividades {view === 'pending' ? 'Ativas' : 'Concluídas'}
          </h2>
          <div className="w-8 h-[2px] bg-zinc-800 rounded-full" />
        </div>
      </div>

      {/* Lista de Tarefas - Estilo Grid otimizado */}
      <div className="px-6 space-y-3">
        {tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10"
          >
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Painel Limpo</p>
          </motion.div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onComplete={async (id: string) => { 
                const newStatus = view === 'pending' ? 'archived' : 'pending';
                await db.tasks.update(id, { status: newStatus });
                await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
                loadTasks();
              }} 
              onEdit={(t: Task) => { setEditingTask(t); setIsModalOpen(true); }} 
            />
          ))
        )}
      </div>

      {/* Input Flutuante no Rodapé */}
      <QuickInputBar onClick={() => { setEditingTask(null); setIsModalOpen(true); }} />

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onTaskCreated={loadTasks}
        userId={user?.id}
        initialTask={editingTask}
      />
    </main>
  );
}
