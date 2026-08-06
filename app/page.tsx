'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
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
    const localTasks = await db.tasks.where('status').equals('pending').toArray();
    setTasks(localTasks);

    const { data: remoteTasks } = await supabase.from('tasks').select('*').eq('status', 'pending');
    if (remoteTasks) {
      await db.tasks.clear();
      await db.tasks.bulkAdd(remoteTasks);
      setTasks(remoteTasks);
    }
  }

  // Função para concluir/arquivar a tarefa (Local-First)
  async function handleCompleteTask(id: string) {
    try {
      // 1. Atualiza localmente no Dexie (some da tela instantaneamente)
      await db.tasks.update(id, { status: 'archived' });
      setTasks(prev => prev.filter(t => t.id !== id));

      // 2. Atualiza no Supabase em background
      await supabase.from('tasks').update({ status: 'archived' }).eq('id', id);
    } catch (err) {
      console.error('Erro ao arquivar tarefa:', err);
    }
  }

  const filteredTasks = activePillar === 'all' 
    ? tasks 
    : tasks.filter(t => t.pillar === activePillar);

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100">
      <Header user={user} />
      
      {/* Filtros de Pilares */}
      <div className="px-6 mb-6 flex gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActivePillar('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${activePillar === 'all' ? 'bg-zinc-200 text-zinc-950' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setActivePillar('empresa')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${activePillar === 'empresa' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
        >
          <Briefcase size={14} /> Empresa
        </button>
        <button 
          onClick={() => setActivePillar('pessoal')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${activePillar === 'pessoal' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
        >
          <User size={14} /> Pessoal
        </button>
        <button 
          onClick={() => setActivePillar('saude')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${activePillar === 'saude' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
        >
          <Heart size={14} /> Saúde
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div className="px-6 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-zinc-600 text-sm">
            Nenhuma tarefa pendente neste pilar.
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} />
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
