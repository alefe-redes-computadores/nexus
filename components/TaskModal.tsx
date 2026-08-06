'use client';
import { useState } from 'react';
import { X, Clock, MapPin, Mic, CheckSquare, Paperclip, Star } from 'lucide-react';
import { db, Task, CheckItem } from '../lib/db';
import { supabase } from '../lib/supabase';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  userId: string;
  initialTask?: Task | null; // Se passado, funciona como tela de Edição!
}

export default function TaskModal({ isOpen, onClose, onTaskCreated, userId, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [category, setCategory] = useState(initialTask?.category || 'pessoal');
  const [isImportant, setIsImportant] = useState(initialTask?.is_important || false);
  const [checklist, setChecklist] = useState<CheckItem[]>(initialTask?.checklist || []);
  const [newCheckText, setNewCheckText] = useState('');
  
  const [reminderType, setReminderType] = useState<'none' | 'time' | 'location'>(initialTask?.reminder_type || 'none');
  const [reminderTime, setReminderTime] = useState(initialTask?.reminder_time || '');
  const [recurrence, setRecurrence] = useState<any>(initialTask?.recurrence || 'none');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Função de Reconhecimento de Voz (Estilo Samsung Voice Input)
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
      const speechText = event.results[0][0].transcript;
      setTitle(speechText);
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
      reminder_type: reminderType,
      reminder_time: reminderType === 'time' ? reminderTime : undefined,
    };

    try {
      if (initialTask?.id) {
        // Modo Edição
        await db.tasks.update(initialTask.id, taskData);
        await supabase.from('tasks').update(taskData).eq('id', initialTask.id);
      } else {
        // Modo Criação
        await db.tasks.add(taskData);
        await supabase.from('tasks').insert([taskData]);
      }

      onTaskCreated();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header do Modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-zinc-100">{initialTask ? 'Editar Lembrete' : 'Adicionar Lembrete'}</h2>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => setIsImportant(!isImportant)} 
              className={`p-2 rounded-xl transition-all ${isImportant ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}
              title="Marcar como Importante"
            >
              <Star size={18} fill={isImportant ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Input principal com botão de Voz embutido */}
          <div className="relative">
            <input 
              autoFocus
              type="text"
              className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-2xl p-4 pr-12 text-sm outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-500"
              placeholder="O que precisa ser feito? (Ex: Renovar Receitas)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleVoiceInput}
              className={`absolute right-3 top-3.5 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-400 hover:text-indigo-400'}`}
              title="Adicionar por Voz"
            >
              <Mic size={18} />
            </button>
          </div>

          {/* Categorias (Tiles estilo Samsung) */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Categoria / Lista</label>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['saude', 'pessoal', 'vencimentos', 'lanchonete', 'pagamentos', 'estudos'].map((cat) => (
                <button 
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 transition-all ${
                    category === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Interno (Subtarefas para remédios, listas, etc.) */}
          <div className="p-3 bg-zinc-800/30 border border-zinc-800 rounded-2xl space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <CheckSquare size={14} className="text-indigo-400" /> Itens de Checklist (Subtarefas)
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {checklist.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between bg-zinc-800/80 px-3 py-2 rounded-xl text-xs">
                  <span className={item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>{item.text}</span>
                  <button 
                    type="button" 
                    onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))}
                    className="text-zinc-500 hover:text-red-400 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input 
                type="text"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs outline-none text-zinc-200"
                placeholder="Adicionar item (ex: Mytedom 10mg)..."
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
              />
              <button 
                type="button" 
                onClick={addChecklistItem}
                className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-xl text-xs font-bold text-white"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Configuração de Horário e Recorrência */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Horário</label>
              <input 
                type="datetime-local"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200 outline-none"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Recorrência</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200 outline-none capitalize"
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
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 mt-3"
          >
            {loading ? 'Salvando...' : (initialTask ? 'Salvar Alterações' : 'Criar Lembrete')}
          </button>
        </form>
      </div>
    </div>
  );
}
