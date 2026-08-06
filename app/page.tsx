'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { db, Task } from '../lib/db';
import { initAutoSync } from '../lib/sync';
import { startGeofenceWatcher } from '../lib/notifications';
import { useTasks } from '../hooks/useTasks';
import Header from '../components/Header';
import QuickInputBar from '../components/QuickInputBar';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import ActivityClock from '../components/ActivityClock';
import FocusModeModal from '../components/FocusModeModal';
import { CheckCircle2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Epicentro() {
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [isClockVisible, setIsClockVisible] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    categorizedTasks,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    handleCompleteTask,
    handleToggleCheck,
    loadTasks
  } = useTasks(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u);
      if (u) {
        const cleanup = initAutoSync(u.id, loadTasks);
        return () => cleanup?.();
      }
    });
    startGeofenceWatcher();
  }, []);

  const priorityTask = tasks.find(t => t.status === 'pending');
  const totalActive = tasks.length;

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100 font-sans">
      <Header />
      
      {/* Widget de Atividades / Zona de Foco Inteligente e Integrada */}
      <div className="px-6 mt-4">
        {isClockVisible ? (
          <div className="relative bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-4 backdrop-blur-xl shadow-xl transition-all">
            <div className="flex justify-end mb-1">
              <button 
                onClick={() => setIsClockVisible(false)}
                className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Ocultar
              </button>
            </div>
            
            <ActivityClock tasks={tasks} onOpenFocus={() => setIsFocusOpen(true)} />
          </div>
        ) : (
          <button 
            onClick={() => setIsClockVisible(true)}
            className="w-full py-2.5 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>+ Exibir Zona de Foco</span>
          </button>
        )}
      </div>

      {/* Barra de Título e Pesquisa Rápida */}
      <div className="px-6 mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-500">
          Atividades Ativas ({totalActive})
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400 transition-all"
            title="Pesquisar Tarefas"
          >
            <Search size={14} />
          </button>
          <div className="w-8 h-[2px] bg-zinc-900 rounded-full" />
        </div>
      </div>

      {/* Input de Pesquisa Expansível */}
      {isSearchOpen && (
        <div className="px-6 mb-4 animate-in fade-in">
          <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2">
            <Search size={14} className="text-zinc-500 mr-2" />
            <input 
              autoFocus
              type="text"
              placeholder="Pesquisar lembrete por nome ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-100 outline-none placeholder-zinc-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista Dividida por Prazos (Passado, Hoje, Próximos) */}
      <div className="px-6 space-y-6">
        <AnimatePresence>
          {totalActive === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10"
            >
              <CheckCircle2 size={36} className="mx-auto text-zinc-700 mb-2" />
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Painel limpo</p>
            </motion.div>
          ) : (
            <>
              {/* SEÇÃO PASSADO / ATRASADO */}
              {categorizedTasks.past.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Passado / Atrasados</span>
                  {categorizedTasks.past.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      sectionType="past"
                      onComplete={handleCompleteTask} 
                      onEdit={(t: Task) => { setEditingTask(t); setIsModalOpen(true); }} 
                      onToggleCheck={handleToggleCheck}
                    />
                  ))}
                </div>
              )}

              {/* SEÇÃO HOJE */}
              {categorizedTasks.today.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Hoje</span>
                  {categorizedTasks.today.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      sectionType="today"
                      onComplete={handleCompleteTask} 
                      onEdit={(t: Task) => { setEditingTask(t); setIsModalOpen(true); }} 
                      onToggleCheck={handleToggleCheck}
                    />
                  ))}
                </div>
              )}

              {/* SEÇÃO PRÓXIMOS / FUTURO */}
              {categorizedTasks.upcoming.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Próximos dias</span>
                  {categorizedTasks.upcoming.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      sectionType="upcoming"
                      onComplete={handleCompleteTask} 
                      onEdit={(t: Task) => { setEditingTask(t); setIsModalOpen(true); }} 
                      onToggleCheck={handleToggleCheck}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <QuickInputBar onClick={() => { setEditingTask(null); setIsModalOpen(true); }} />

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onTaskCreated={loadTasks}
        userId={user?.id}
        initialTask={editingTask}
      />

      <FocusModeModal 
        isOpen={isFocusOpen}
        onClose={() => setIsFocusOpen(false)}
        priorityTask={priorityTask}
        onCompleteTask={handleCompleteTask}
      />
    </main>
  );
}
