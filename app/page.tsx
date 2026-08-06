'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Briefcase, User, Heart, X, Check, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Epicentro() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', pillar: 'pessoal' });

  // Busca e Carregamento
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data } = await supabase.from('tasks').select('*').eq('status', 'pending');
    setTasks(data || []);
  }

  // Função de Arquivamento (Swipe lógico)
  async function archiveTask(id: string) {
    await supabase.from('tasks').update({ status: 'archived' }).eq('id', id);
    loadTasks();
  }

  // Função de Criação
  async function addTask() {
    if (!newTask.title) return;
    await supabase.from('tasks').insert([newTask]);
    setIsModalOpen(false);
    setNewTask({ title: '', pillar: 'pessoal' });
    loadTasks();
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100 font-sans">
      <header className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Epicentro</h1>
          <p className="text-sm text-zinc-500">Gestão Integrada</p>
        </div>
      </header>

      {/* Lista de Tarefas com animação */}
      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div 
              key={task.id}
              exit={{ x: -100, opacity: 0 }}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">{task.pillar}</span>
              </div>
              <button 
                onClick={() => archiveTask(task.id)}
                className="p-2 text-zinc-600 hover:text-indigo-400 transition-colors"
              >
                <Archive size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FAB de Adicionar */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-900/20 active:scale-95 transition-transform"
      >
        <Plus size={30} />
      </button>

      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Nova Tarefa</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <input 
              autoFocus
              className="w-full bg-zinc-800 rounded-xl p-4 mb-4 outline-none"
              placeholder="O que precisa ser feito?"
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            <div className="flex gap-2 mb-6">
              {['empresa', 'pessoal', 'saude'].map(p => (
                <button key={p} onClick={() => setNewTask({...newTask, pillar: p})} className={`flex-1 py-2 text-xs rounded-lg capitalize ${newTask.pillar === p ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={addTask} className="w-full py-4 bg-indigo-600 rounded-xl font-bold">Criar Tarefa</button>
          </div>
        </div>
      )}
    </main>
  );
}
