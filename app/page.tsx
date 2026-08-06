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
import { Archive, ListTodo, CheckCircle2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Epicentro() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasksCount, setAllTasksCount] = useState({ total: 0, completed: 0 });
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

    // Calcula o progresso global para o Modo Foco
    const allPending = await db.tasks.where('status').equals('pending').count();
    const allArchived = await db.tasks.where('status').equals('archived').count();
    const total = allPending + allArchived;
    setAllTasksCount({ total, completed: allArchived });
  }

  async function handleCompleteTask(id: string) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = view === 'pending' ? 'archived' : 'pending';
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

  const progressPercentage = allTasksCount.total > 0 
    ? Math.round((allTasksCount.completed / allTasksCount.total) * 100) 
    : 0;

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100 font-sans">
      <Header />
      
      {/* Modo Foco / Barra de Progresso Global */}
      <div className="px-6 mt-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-4 shadow-xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Flame size={16} />
              </div>
              <span className="text-xs font-bold text-zinc-200">Modo Foco Diário</span>
            </div>
            <span className="text-xs font-extrabold text-indigo-400">{progressPercentage}% Concluído</span>
          </div>
          
          {/* Barra de Progresso Animada */}
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">
            {allTasksCount.completed} de {allTasksCount.total} tarefas finalizadas.
          </p>
        </div>
      </div>

      {/* Abas de Navegação Minimalistas */}
      <div className="px-6 mt-4 mb-6">
        <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
          <button onClick={() => setView('pending')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${view === 'pending' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>
            <ListTodo size={16} /> Pendentes
          </button>
          <button onClick={() => setView('archived')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${view === 'archived' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>
            <Archive size={16} /> Arquivados
          </button>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="px-6 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            <CheckCircle2 size={36} className="mx-auto text-zinc-700 mb-2" />
            <p className="text-zinc-500 text-sm font-medium">Nenhum lembrete nesta aba.</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onComplete={handleCompleteTask} 
              onEdit={(t: Task) => { setEditingTask(t); setIsModalOpen(true); }} 
              onToggleCheck={handleToggleCheck}
            />
          ))
        )}
      </div>

      {/* Input Fixado no Rodapé */}
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
