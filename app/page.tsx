'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { db, Task } from '../lib/db';
import { startGeofenceWatcher } from '../lib/notifications';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import { Calendar, Star, CheckCircle2, Bookmark } from 'lucide-react';

export default function Epicentro() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadLocalAndSync();

    // Inicia o motor de rastreamento de geolocalização e notificações em background
    startGeofenceWatcher();
  }, []);

  async function loadLocalAndSync() {
    const localTasks = await db.tasks.where('status').equals('pending').toArray();
    setTasks(localTasks);

    const { data: remoteTasks } = await supabase.from('tasks').select('*').eq('status', 'pending');
    if (remoteTasks) {
      await db.tasks.clear();
      await db.tasks.bulkAdd(remoteTasks);
      setTasks(remoteTasks);
    }
  }

  async function handleCompleteTask(id: string) {
    try {
      await db.tasks.update(id, { status: 'archived' });
      setTasks(prev => prev.filter(t => t.id !== id));
      await supabase.from('tasks').update({ status: 'archived' }).eq('id', id);
    } catch (err) {
      console.error('Erro ao arquivar:', err);
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'important') return task.is_important;
    return task.category === activeFilter;
  });

  return (
    <main className="min-h-screen bg-zinc-950 pb-32 text-zinc-100 font-sans">
      <Header user={user} />
      
      {/* Dashboard Tiles */}
      <div className="px-6 mb-6 pt-2">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`p-4 rounded-3xl border text-left transition-all flex flex-col justify-between h-28 ${activeFilter === 'all' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-600/10' : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300'}`}
          >
            <div className="flex justify-between items-center w-full">
              <Calendar size={20} className="text-indigo-400" />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-800">{tasks.length}</span>
            </div>
            <div>
              <span className="text-sm font-bold block">Todos</span>
              <span className="text-[10px] text-zinc-500">Geral</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveFilter('important')}
            className={`p-4 rounded-3xl border text-left transition-all flex flex-col justify-between h-28 ${activeFilter === 'important' ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10' : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300'}`}
          >
            <div className="flex justify-between items-center w-full">
              <Star size={20} className="text-amber-400" />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-800">{tasks.filter(t => t.is_important).length}</span>
            </div>
            <div>
              <span className="text-sm font-bold block">Importantes</span>
              <span className="text-[10px] text-zinc-500">Destaques</span>
            </div>
          </button>
        </div>
      </div>

      {/* Lista de Lembretes */}
      <div className="px-6 space-y-3">
        <div className="flex justify-between items-center mb-1 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            {activeFilter === 'all' ? 'Lembretes Pendentes' : `Filtro: ${activeFilter}`}
          </h3>
          {activeFilter !== 'all' && (
            <button onClick={() => setActiveFilter('all')} className="text-xs text-indigo-400 font-semibold">Ver Todos</button>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            <CheckCircle2 size={36} className="mx-auto text-zinc-700 mb-2" />
            <p className="text-zinc-500 text-sm font-medium">Nenhum lembrete por aqui.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onComplete={handleCompleteTask} 
              onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }} 
            />
          ))
        )}
      </div>

      <Navbar onAddTask={() => { setEditingTask(null); setIsModalOpen(true); }} />

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onTaskCreated={loadLocalAndSync}
        userId={user?.id}
        initialTask={editingTask}
      />
    </main>
  );
}
