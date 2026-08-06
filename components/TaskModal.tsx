'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { db, Task } from '../lib/db';
import { supabase } from '../lib/supabase';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  userId: string;
}

export default function TaskModal({ isOpen, onClose, onTaskCreated, userId }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pillar, setPillar] = useState<'empresa' | 'pessoal' | 'saude'>('pessoal');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    const newTask: Task = {
      user_id: userId,
      title,
      description,
      pillar,
      status: 'pending',
    };

    try {
      // 1. Salva localmente primeiro (Local-First instantâneo)
      await db.tasks.add(newTask);

      // 2. Envia para o Supabase em background
      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) console.error('Erro ao sincronizar com nuvem:', error);

      setTitle('');
      setDescription('');
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Nova Tarefa</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <input 
            autoFocus
            type="text"
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl p-4 text-sm outline-none focus:border-indigo-500"
            placeholder="O que precisa ser feito?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea 
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 resize-none h-20"
            placeholder="Detalhes ou anotação (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-2">
            {(['empresa', 'pessoal', 'saude'] as const).map((p) => (
              <button 
                key={p} 
                type="button"
                onClick={() => setPillar(p)} 
                className={`flex-1 py-2.5 text-xs rounded-xl capitalize font-medium transition-all ${
                  pillar === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Salvando...' : 'Criar Tarefa'}
          </button>
        </form>
      </div>
    </div>
  );
}
