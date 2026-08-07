'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { db, Task } from '../../lib/db';
import Header from '../../components/Header';
import { useRouter } from 'next/navigation';
import { RefreshCcw, Trash2, ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArchivePage() {
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadArchived();
  }, []);

  async function loadArchived() {
    setLoading(true);
    // Busca as tarefas arquivadas
    const local = await db.tasks.where('status').equals('archived').toArray();
    
    // Ordena das mais recentes para as mais antigas
    local.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

    // Agrupa por Mês e Ano (Ex: "Agosto 2026")
    const grouped = local.reduce((acc, task) => {
      const date = new Date(task.updated_at || Date.now());
      const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1); // "Agosto de 2026"
      
      if (!acc[capitalizedMonth]) acc[capitalizedMonth] = [];
      acc[capitalizedMonth].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    setGroupedTasks(grouped);
    setLoading(false);
  }

  // Restaura a tarefa para a Home
  async function handleRestore(task: Task) {
    if (!task.id) return;
    triggerHaptic('success');
    
    const now = new Date().toISOString();
    await db.tasks.update(task.id, { status: 'pending', updated_at: now });
    await supabase.from('tasks').update({ status: 'pending', updated_at: now }).eq('id', task.id);
    
    loadArchived(); // Recarrega a lista
  }

  // Exclui a tarefa definitivamente
  async function handleDelete(id: string) {
    if (!id) return;
    triggerHaptic('medium');
    
    await db.tasks.delete(id);
    await supabase.from('tasks').delete().eq('id', id);
    
    loadArchived(); // Recarrega a lista
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100 font-sans">
      <Header />
      
      {/* Barra de Navegação Interna */}
      <div className="px-6 mt-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerHaptic('light'); router.push('/'); }}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-300">
            Histórico Arquivado
          </h2>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {loading ? (
          <p className="text-center text-zinc-600 text-xs py-10 font-medium uppercase tracking-widest">Carregando histórico...</p>
        ) : Object.keys(groupedTasks).length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10"
          >
            <CheckCircle2 size={36} className="mx-auto text-zinc-700 mb-2" />
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Nenhuma tarefa finalizada</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {Object.entries(groupedTasks).map(([month, tasksInMonth]) => (
              <div key={month} className="space-y-3">
                {/* Cabeçalho do Mês */}
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {month}
                  </span>
                  <div className="flex-1 h-[1px] bg-zinc-800/60 ml-2" />
                </div>

                {/* Lista de Tarefas do Mês */}
                <div className="space-y-2">
                  {tasksInMonth.map(task => (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={task.id} 
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 opacity-80 hover:opacity-100 transition-all"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-semibold text-sm text-zinc-400 line-through truncate">{task.title}</h3>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">{task.category}</span>
                          {task.tags && task.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Botões de Ação */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => handleRestore(task)}
                          className="p-2 rounded-xl bg-zinc-800/50 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all"
                          title="Restaurar Tarefa"
                        >
                          <RefreshCcw size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(task.id!)}
                          className="p-2 rounded-xl bg-zinc-800/50 text-red-500/70 hover:bg-red-500/20 hover:text-red-400 transition-all"
                          title="Excluir Definitivamente"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
