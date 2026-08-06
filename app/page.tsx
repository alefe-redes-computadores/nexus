'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { db, Task } from '../lib/db';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import { Calendar, Star, Heart, User, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Epicentro() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadLocalAndSync();
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

  // Filtragem baseada nos tiles da Samsung
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'important') return task.is_important;
    return task.category === activeFilter;
  });

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100 font-sans selection:bg-indigo-500">
      <Header user={user} />
      
      {/* Dashboard Tiles (Estilo Samsung Reminder) */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-2.5">
          
          {/* Tile: Todos / Hoje */}
          <button 
            onClick={() => setActiveFilter('all')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${activeFilter === 'all' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'}`}
          >
            <div className="flex justify-between items-center w-full">
              <Calendar size={18} className="text-indigo-400" />
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-zinc-800/80">{tasks.length}</span>
            </div>
            <span className="text-xs font-semibold tracking-wide">Geral</span>
          </button>

          {/* Tile: Importantes */}
          <button 
            onClick={() => setActiveFilter('important')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${activeFilter === 'important' ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'}`}
          >
            <div className="flex justify-between items-center w-full">
              <Star size={18} className="text-amber-400" />
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-zinc-800/80">{tasks.filter(t => t.is_important).length}</span>
            </div>
            <span className="text-xs font-semibold tracking-wide">Importantes</span>
          </button>

          {/* Tile: Saúde */}
          <button 
            onClick={() => setActiveFilter('saude')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${activeFilter === 'saude' ? 'bg-rose-500/20 border-rose-500 text-rose-200' : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'}`}
          >
            <div className="flex justify-between items-center w-full">
              <Heart size={18} className="text-rose-400" />
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-zinc-800/80">{tasks.filter(t => t.category === 'saude').length}</span>
            </div>
            <span className="text-xs font-semibold tracking-wide">Saúde</span>
          </button>

        </div>

        {/* Linha secundária de categorias rápidas */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto no-scrollbar">
          {['pessoal', 'vencimentos', 'lanchonete', 'pagamentos', 'estudos'].map((cat) => {
            const count = tasks.filter(t => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize shrink-0 border transition-all ${activeFilter === cat ? 'bg-zinc-200 text-zinc-950 border-white font-bold' : 'bg-zinc-900/40 text-zinc-400 border-zinc-800'}`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Tarefas Estilizada */}
      <div className="px-6 space-y-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            {activeFilter === 'all' ? 'Todas as Tarefas' : `Filtro: ${activeFilter}`}
          </h3>
          {activeFilter !== 'all' && (
            <button onClick={() => setActiveFilter('all')} className="text-xs text-indigo-400 font-semibold">Limpar Filtro</button>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800/80 rounded-3xl bg-zinc-900/20">
            <CheckCircle2 size={32} className="mx-auto text-zinc-700 mb-2" />
            <p className="text-zinc-500 text-sm">Nenhum lembrete encontrado aqui.</p>
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
