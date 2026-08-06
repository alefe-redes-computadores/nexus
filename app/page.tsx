'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import { Briefcase, User, Heart } from 'lucide-react';

export default function Epicentro() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePillar, setActivePillar] = useState<string>('all');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadLocalAndSync();
  }, []);

  async function loadLocalAndSync() {
    // 1. Pega do Dexie (Local-First instantâneo)
    const localTasks = await db.tasks.where('status').equals('pending').toArray();
    setTasks(localTasks);

    // 2. Busca atualizações do Supabase em segundo plano
    const { data: remoteTasks } = await supabase.from('tasks').select('*').eq('status', 'pending');
    if (remoteTasks) {
      await db.tasks.clear();
      await db.tasks.bulkAdd(remoteTasks);
      setTasks(remoteTasks);
    }
  }

  const filteredTasks = activePillar === 'all' 
    ? tasks 
    : tasks.filter(t => t.pillar === activePillar);

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100">
      <Header user={user} />
      
      {/* Filtros de Pilares */}
      <div className="px-6 mb-6 flex gap-2">
        <button 
          onClick={() => setActivePillar('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activePillar === 'all' ? 'bg-zinc-200 text-zinc-950' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setActivePillar('empresa')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activePillar === 'empresa' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
        >
          <Briefcase size={14} /> Empresa
        </button>
        <button 
          onClick={() => setActivePillar('pessoal')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activePillar === 'pessoal' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
        >
          <User size={14} /> Pessoal
        </button>
        <button 
          onClick={() => setActivePillar('saude')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activePillar === 'saude' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
        >
          <Heart size={14} /> Saúde
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div className="px-6 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            Nenhuma tarefa encontrada neste pilar.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id || task.title} className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm flex flex-col gap-1">
              <h3 className="font-medium text-sm text-zinc-200">{task.title}</h3>
              {task.description && <p className="text-xs text-zinc-400">{task.description}</p>}
              <span className="mt-2 text-[10px] uppercase font-bold tracking-widest text-indigo-400 w-fit px-2 py-0.5 rounded bg-indigo-500/10">
                {task.pillar}
              </span>
            </div>
          ))
        )}
      </div>

      <Navbar onAddTask={() => setIsModalOpen(true)} />

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={loadLocalAndSync}
        userId={user?.id}
      />
    </main>
  );
}
