'use client';
import { useState } from 'react';
import { X, Mic, CheckSquare, Star } from 'lucide-react';
import { db, Task, CheckItem } from '../lib/db';
import { supabase } from '../lib/supabase';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  userId: string;
  initialTask?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onTaskCreated, userId, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [category, setCategory] = useState(initialTask?.category || 'pessoal');
  const [isImportant, setIsImportant] = useState(initialTask?.is_important || false);
  const [checklist, setChecklist] = useState<CheckItem[]>(initialTask?.checklist || []);
  const [newCheckText, setNewCheckText] = useState('');
  
  const [reminderTime, setReminderTime] = useState(initialTask?.reminder_time || '');
  const [recurrence, setRecurrence] = useState<any>(initialTask?.recurrence || 'none');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function handleVoiceInput() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta ditado por voz.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setTitle(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function addChecklistItem() {
    if (!newCheckText.trim()) return;
    setChecklist([...checklist, { id: Math.random().toString(), text: newCheckText, completed: false }]);
    setNewCheckText('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const taskData: Task = {
      user_id: userId,
      title,
      description,
      category,
      pillar: 'pessoal',
      status: initialTask?.status || 'pending',
      is_important: isImportant,
      checklist,
      recurrence,
      reminder_type: reminderTime ? 'time' : 'none',
      reminder_time: reminderTime || undefined,
    };

    try {
      if (initialTask?.id) {
        await db.tasks.update(initialTask.id, taskData);
        await supabase.from('tasks').update(taskData).eq('id', initialTask.id);
      } else {
        await db.tasks.add(taskData);
        await supabase.from('tasks').insert([taskData]);
      }
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-t-[32px] sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto font-sans">
        
        {/* Top bar */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-zinc-100 tracking-tight">
            {initialTask ? 'Editar Lembrete' : 'Novo Lembrete'}
          </h2>
          <div className="flex items-center gap-1.5">
            <button 
              type="button" 
              onClick={() => setIsImportant(!isImportant)} 
              className={`p-2.5 rounded-2xl transition-all ${isImportant ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'}`}
              title="Marcar como Importante"
            >
              <Star size={16} fill={isImportant ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onClose} className="p-2.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:text-white transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Main title input with voice */}
          <div className="relative">
            <input 
              autoFocus
              type="text"
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 pr-12 text-sm outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-500 transition-all shadow-inner"
              placeholder="O que precisa ser feito?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleVoiceInput}
              className={`absolute right-3.5 top-3.5 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-400 hover:text-indigo-400 bg-zinc-900'}`}
              title="Ditado por voz"
            >
              <Mic size={16} />
            </button>
          </div>

          {/* Categories */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Categoria / Lista</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['pessoal', 'saude', 'vencimentos', 'lanchonete', 'pagamentos', 'estudos'].map((cat) => (
                <button 
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize shrink-0 transition-all ${
                    category === cat 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' 
                      : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 hover:border-zinc-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="p-3.5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl space-y-2.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckSquare size={14} className="text-indigo-400" /> Checklist (Subtarefas)
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {checklist.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-xl text-xs border border-zinc-800">
                  <span className="text-zinc-200">{item.text}</span>
                  <button 
                    type="button" 
                    onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))}
                    className="text-zinc-500 hover:text-red-400 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none text-zinc-200 placeholder-zinc-600"
                placeholder="Adicionar item..."
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
              />
              <button 
                type="button" 
                onClick={addChecklistItem}
                className="bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Time & Recurrence */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Horário</label>
              <input 
                type="datetime-local"
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 outline-none focus:border-indigo-500"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Recorrência</label>
              <select
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 outline-none capitalize"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
              >
                <option value="none">Não repetir</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-xs tracking-wider uppercase shadow-xl shadow-indigo-600/30 active:scale-98 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Salvando...' : (initialTask ? 'Salvar Alterações' : 'Criar Lembrete')}
          </button>
        </form>
      </div>
    </div>
  );
}
