'use client';
import { useState, useEffect } from 'react';
import { X, Mic, CheckSquare, Star, Clock, MapPin, Plus, Heart, User, FileText, Coffee, Briefcase, Bookmark } from 'lucide-react';
import { db, Task, CheckItem, Category } from '../lib/db';
import { supabase } from '../lib/supabase';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  userId: string;
  initialTask?: Task | null;
}

const AVAILABLE_ICONS = [
  { name: 'Pessoal', icon: User },
  { name: 'Saúde', icon: Heart },
  { name: 'Trabalho', icon: Briefcase },
  { name: 'Documentos', icon: FileText },
  { name: 'Alimentação', icon: Coffee },
  { name: 'Geral', icon: Bookmark }
];

export default function TaskModal({ isOpen, onClose, onTaskCreated, userId, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [category, setCategory] = useState(initialTask?.category || 'Pessoal');
  const [isImportant, setIsImportant] = useState(initialTask?.is_important || false);
  const [checklist, setChecklist] = useState<CheckItem[]>(initialTask?.checklist || []);
  const [newCheckText, setNewCheckText] = useState('');
  
  const [reminderType, setReminderType] = useState<'none' | 'time' | 'location'>(initialTask?.reminder_type || 'none');
  const [reminderTime, setReminderTime] = useState(initialTask?.reminder_time || '');
  const [recurrence, setRecurrence] = useState<any>(initialTask?.recurrence || 'none');
  const [locationName, setLocationName] = useState(initialTask?.location_name || '');
  const [radiusMeters, setRadiusMeters] = useState(initialTask?.radius_meters || 100);

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('User');

  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    let cats = await db.categories.toArray();
    if (cats.length === 0) {
      const defaultCats: Category[] = [
        { name: 'Saúde', icon: 'Heart' },
        { name: 'Pessoal', icon: 'User' },
        { name: 'Trabalho', icon: 'Briefcase' },
        { name: 'Documentos', icon: 'FileText' }
      ];
      await db.categories.bulkAdd(defaultCats);
      cats = await db.categories.toArray();
    }
    setCategoriesList(cats);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await db.categories.add({ name: newCatName.trim(), icon: selectedIcon });
    setNewCatName('');
    setShowNewCatInput(false);
    loadCategories();
    setCategory(newCatName.trim());
  }

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
      category,
      status: initialTask?.status || 'pending',
      is_important: isImportant,
      checklist,
      recurrence,
      reminder_type: reminderType,
      reminder_time: reminderType === 'time' ? reminderTime : undefined,
      location_name: reminderType === 'location' ? locationName : undefined,
      radius_meters: reminderType === 'location' ? radiusMeters : undefined,
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
      <div className="w-full max-w-lg rounded-t-[32px] sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto font-sans">
        
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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria / Lista</label>
              <button 
                type="button" 
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1"
              >
                <Plus size={12} /> Nova Categoria
              </button>
            </div>

            {showNewCatInput && (
              <div className="space-y-2 mb-3 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <input 
                  type="text" 
                  placeholder="Nome da categoria..." 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                />
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-zinc-500">Ícone:</span>
                  <div className="flex gap-1 overflow-x-auto">
                    {AVAILABLE_ICONS.map(item => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setSelectedIcon(item.name)}
                          className={`p-2 rounded-lg border ${selectedIcon === item.name ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                        >
                          <IconComponent size={14} />
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" onClick={handleAddCategory} className="ml-auto px-3 py-1.5 bg-indigo-600 text-xs font-bold text-white rounded-xl">Criar</button>
                </div>
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categoriesList.map((cat) => (
                <button 
                  key={cat.id || cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    category === cat.name 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' 
                      : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 hover:border-zinc-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Gatilho de Alerta</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReminderType('none')}
                className={`py-2 text-xs rounded-xl font-medium border transition-all ${reminderType === 'none' ? 'bg-zinc-700 border-zinc-500 text-white font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
              >
                Padrão
              </button>
              <button
                type="button"
                onClick={() => setReminderType('time')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl font-medium border transition-all ${reminderType === 'time' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
              >
                <Clock size={14} /> Horário
              </button>
              <button
                type="button"
                onClick={() => setReminderType('location')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl font-medium border transition-all ${reminderType === 'location' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
              >
                <MapPin size={14} /> Local
              </button>
            </div>
          </div>

          {reminderType === 'time' && (
            <div className="p-3.5 bg-zinc-950/40 border border-zinc-800 rounded-2xl space-y-2.5 animate-in fade-in">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-400" /> Horário e Recorrência
              </label>
              <input 
                type="datetime-local"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 outline-none focus:border-indigo-500"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
              <select
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 outline-none capitalize"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
              >
                <option value="none">Não repetir</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>
          )}

          {reminderType === 'location' && (
            <div className="p-3.5 bg-zinc-950/40 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-indigo-400" /> Alerta por Localização (Geofencing)
              </label>
              <input 
                type="text"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 outline-none focus:border-indigo-500"
                placeholder="Nome do local (Ex: Trabalho, Farmácia...)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Raio de proximidade:</span>
                  <strong className="text-indigo-400 font-bold">{radiusMeters} metros</strong>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-900 cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="p-3.5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl space-y-2.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckSquare size={14} className="text-indigo-400" /> Checklist (Subtarefas)
            </label>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
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
