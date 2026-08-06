'use client';
import { useState, useEffect } from 'react';
import { X, Mic, CheckSquare, Square, Star, Clock, MapPin, Plus, Heart, User, Briefcase, FileText, Coffee, Bookmark, Navigation } from 'lucide-react';
import { db, Task, CheckItem, Category } from '../lib/db';
import { supabase } from '../lib/supabase';
import { syncPushTask } from '../lib/sync';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });

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
  { name: 'Geral', icon: Bookmark },
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
  
  const [locationName, setLocationName] = useState(initialTask?.location_name || 'Local Selecionado no Mapa');
  const [lat, setLat] = useState<number | undefined>(initialTask?.lat || -18.5808);
  const [lng, setLng] = useState<number | undefined>(initialTask?.lng || -46.5181);
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
        { name: 'Saúde', icon: 'Heart' }, { name: 'Pessoal', icon: 'User' },
        { name: 'Trabalho', icon: 'Briefcase' }, { name: 'Documentos', icon: 'FileText' }
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

  function handleVoiceInput() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Seu navegador não suporta ditado.');
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setTitle(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function addChecklistItem() {
    if (!newCheckText.trim()) return;
    setChecklist([...checklist, { id: Math.random().toString(), text: newCheckText, completed: false }]);
    setNewCheckText('');
  }

  function toggleCheckItem(id: string) {
    setChecklist(checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  }

  function removeChecklistItem(id: string) {
    setChecklist(checklist.filter(item => item.id !== id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const taskData: Task = {
      id: initialTask?.id || crypto.randomUUID(),
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
      lat: reminderType === 'location' ? lat : undefined,
      lng: reminderType === 'location' ? lng : undefined,
      radius_meters: reminderType === 'location' ? radiusMeters : undefined,
    };

    try {
      await syncPushTask(taskData);
      onTaskCreated();
      onClose();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-t-[32px] sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto font-sans">
        
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-zinc-100 tracking-tight">{initialTask ? 'Editar Lembrete' : 'Novo Lembrete'}</h2>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-zinc-800/80 text-zinc-400"><X size={16} /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="relative">
            <input autoFocus type="text" className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 pr-12 text-sm text-zinc-100" placeholder="O que precisa ser feito?" value={title} onChange={(e) => setTitle(e.target.value)} />
            <button type="button" onClick={handleVoiceInput} className={`absolute right-3.5 top-3.5 p-2 rounded-xl ${isListening ? 'bg-red-500 text-white' : 'text-zinc-400'}`}><Mic size={16} /></button>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500">Categoria / Lista</label>
            <div className="flex gap-2 overflow-x-auto py-2">
              {categoriesList.map(cat => (
                <button key={cat.name} type="button" onClick={() => setCategory(cat.name)} className={`px-4 py-2 rounded-xl text-xs font-semibold ${category === cat.name ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{cat.name}</button>
              ))}
              <button type="button" onClick={() => setShowNewCatInput(!showNewCatInput)} className="px-4 py-2 rounded-xl bg-zinc-800 text-indigo-400 text-xs font-semibold">+ Nova</button>
            </div>
            {showNewCatInput && (
              <div className="flex gap-2 p-2 bg-zinc-950 rounded-xl mb-2">
                <input className="flex-1 bg-transparent text-xs p-1" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nome..." />
                <button type="button" onClick={handleAddCategory} className="text-xs text-indigo-400 font-bold">Salvar</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['none', 'time', 'location'].map((type) => (
              <button key={type} type="button" onClick={() => setReminderType(type as any)} className={`py-2 text-xs rounded-xl border ${reminderType === type ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                {type === 'none' ? 'Padrão' : type === 'time' ? 'Horário' : 'Local'}
              </button>
            ))}
          </div>

          {reminderType === 'location' && (
            <div className="p-3.5 bg-zinc-950/40 border border-zinc-800 rounded-2xl space-y-3">
              <MapPicker lat={lat} lng={lng} radius={radiusMeters} onLocationChange={(nl: number, nln: number) => { setLat(nl); setLng(nln); }} />
              <input type="range" min="50" max="1000" step="50" value={radiusMeters} onChange={(e) => setRadiusMeters(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          )}

          <div className="p-3.5 bg-zinc-950/40 border border-zinc-800 rounded-2xl space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Checklist</label>
            {checklist.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-zinc-900 p-2 rounded-xl text-xs">
                <div className="flex items-center gap-2" onClick={() => toggleCheckItem(item.id)}>
                  {item.completed ? <CheckSquare size={14} className="text-indigo-400" /> : <Square size={14} className="text-zinc-600" />}
                  <span className={item.completed ? 'line-through text-zinc-600' : 'text-zinc-200'}>{item.text}</span>
                </div>
                <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-zinc-600 hover:text-red-400">✕</button>
              </div>
            ))}
            <div className="flex gap-2">
              <input className="flex-1 bg-zinc-900 rounded-xl p-2 text-xs text-zinc-200" value={newCheckText} onChange={e => setNewCheckText(e.target.value)} placeholder="Add item..." />
              <button type="button" onClick={addChecklistItem} className="bg-indigo-600 text-xs text-white px-3 py-2 rounded-xl font-bold">Add</button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 rounded-2xl font-bold text-xs text-white">Salvar Lembrete</button>
        </form>
      </div>
    </div>
  );
}
