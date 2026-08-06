'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { db, Task } from '../lib/db';
import { initAutoSync } from '../lib/sync';
import { startGeofenceWatcher } from '../lib/notifications';
import { processRecurrence } from '../lib/recurrence';
import Header from '../components/Header';
import QuickInputBar from '../components/QuickInputBar';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import ActivityClock from '../components/ActivityClock';
import FocusModeModal from '../components/FocusModeModal';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Epicentro() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [isClockVisible, setIsClockVisible] = useState(true); // Permite ocultar o painel de foco
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
  }, []);

  async function loadTasks() {
    // Carrega apenas as tarefas pendentes na home principal
    const localTasks = await db.tasks.where('status').equals('pending').toArray();
    setTasks(localTasks);
  }

  // Otimização de Performance com useMemo
  const filteredTasks = useMemo(() => {
    return tasks.sort((a, b) => {
      if (a.is_important && !b.is_important) return -1;
      return 0;
    });
  }, [tasks]);

  async function handleCompleteTask(id: string) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus = 'archived';
    
    // Atualiza local e nuvem
    await db.tasks.update(id, { status: newStatus });
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);

    // Processa a Recorrência Inteligente (Gera a próxima ocorrência automaticamente se houver)
    await processRecurrence(task);

    loadTasks();
  }

  async function handleToggleCheck(taskId: string, checkId: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;
    const updatedChecklist = task.checklist.map(item => 
      item.id === checkId ? { ...item, completed: !item.completed } : item
    );
    await db.tasks.update(taskId, { checklist: updatedChecklist });
    await supabase.from('tasks').update({ checklist: updatedChecklist }).eq('id', taskId);
    loadTasks();
  }

  const priorityTask = tasks.find(t => t.status === 'pending');

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100 font-sans">
      <Header />
      
      {/* Widget de Atividades / Zona de Foco Colapsável com Padrão de Elite */}
      <div className="px-6 mt-4">
        {isClockVisible ? (
          <div className="relative bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-1 backdrop-blur-xl shadow-xl transition-all">
            <ActivityClock tasks={tasks} onOpenFocus={() => setIsFocusOpen(true)} />
            <div className="flex justify-end px-4 pb-2">
              <button 
                onClick={() => setIsClockVisible(false)}
                className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Ocultar Painel
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsClockVisible(true)}
            className="w-full py-3 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>+ Exibir Zona de Foco</span>
          </button>
        )}
      </div>

      {/* Título de Seção Limpo */}
      <div className="px-6 mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-500">
          Atividades Ativas ({filteredTasks.length})
        </h2>
        <div className="w-8 h-[2px] bg-zinc-900 rounded-full" />
      </div>

      {/* Lista de Tarefas Otimizada */}
      <div className="px-6 space-y-3">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10"
            >
              <CheckCircle2 size={36} className="mx-auto text-zinc-700 mb-2" />
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Painel limpo</p>
            </motion.div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={handleCompleteTask} 
                onEdit={(t: Task) => { setEditingTask(t); setIsModalOpen(true); }} 
                onToggleCheck={handleToggleCheck}
              />
            ))
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
