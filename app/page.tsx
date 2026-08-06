'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { db, Task } from '../lib/db';
import { initAutoSync } from '../lib/sync';
import { startGeofenceWatcher } from '../lib/notifications';
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
  const [isClockVisible, setIsClockVisible] = useState(true); // Permite minimizar o relógio de foco
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
    await db.tasks.update(id, { status: newStatus });
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
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
      
      {/* Widget de Atividades / Zona de Foco com opção de minimizar */}
      {isClockVisible && (
        <div className="relative">
          <ActivityClock tasks={tasks} onOpenFocus={() => setIsFocusOpen(true)} />
          <button 
            onClick={() => setIsClockVisible(false)}
            className="absolute top-3 right-8 text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest font-bold"
          >
            Minimizar
          </button>
        </div>
      )}

      {/* Se o relógio estiver minimizado, exibe um botão discreto para reabri-lo */}
      {!isClockVisible && (
        <div className="px-6 mt-4">
          <button 
            onClick={() => setIsClockVisible(true)}
            className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/30 border border-indigo-500/20 px-4 py-2 rounded-xl"
          >
            + Exibir Painel de Foco
          </button>
        </div>
      )}

      {/* Título de Seção Limpo (Sem abas de To Do) */}
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
