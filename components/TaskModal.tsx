'use client';
import { useState, useEffect } from 'react';
import { X, Mic, CheckSquare, Square, Star, Clock, MapPin, Plus, Heart, User, Briefcase, FileText, Coffee, Bookmark, Smile, Dumbbell, Home, ShoppingBag, Car, Plane, Shield, Zap, BookOpen, Music, Code } from 'lucide-react';
import { db, Task, CheckItem, Category } from '../lib/db';
import { supabase } from '../lib/supabase';
import { syncPushTask, syncPushCategory } from '../lib/sync';
import { triggerHaptic } from '../lib/haptics';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  userId: string;
  initialTask?: Task | null;
}

const ICON_CATEGORIES = [
  { category: 'Geral', icons: [User, Heart, Briefcase, FileText, Coffee, Bookmark, Home, ShoppingBag] },
  { category: 'Estilo de Vida', icons: [Smile, Dumbbell, Car, Plane, Shield, Zap, BookOpen, Music, Code] }
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
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    let cats = await db.categories.toArray();
    if (cats.length === 0) {
      const defaultCats: Category[] = [
        { id: crypto.randomUUID(), name: 'Saúde', icon: 'Heart' },
        { id: crypto.randomUUID(), name: 'Pessoal', icon: 'User' },
        { id: crypto.randomUUID(), name: 'Trabalho', icon: 'Briefcase' },
        { id: crypto.randomUUID(), name: 'Documentos', icon: 'FileText' }
      ];
      for (const cat of defaultCats) {
        await db.categories.put(cat);
      }
      cats = await db.categories.toArray();
    }
    setCategoriesList(cats);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    triggerHaptic('success');
    
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: newCatName.trim(),
      icon: selectedIcon,
      user_id: userId
    };

    // Salva na nuvem e local via sync
    await syncPushCategory(newCat);
    setNewCatName('');
    setShowNewCatInput(false);
    loadCategories();
    setCategory(newCat.name);
  }

  function handleVoiceInput() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Seu navegador não suporta ditado por voz.');
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
    triggerHaptic('light');
    setChecklist([...checklist, { id: Math.random().toString(), text: newCheckText, completed: false }]);
    setNewCheckText('');
  }

  function toggleCheckItem(id: string) {
    triggerHaptic('light');
    setChecklist(checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
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
      updated_at: new Date().toISOString()
    };

    try {
      triggerHaptic('success');
      await syncPushTask(taskData);
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    // Clique fora do modal fecha (Backdrop Click)
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) { triggerHaptic('light'); onClose(); } }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-t-[32px] sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto font-sans">
        
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-zinc-100 tracking-tight">
            {initialTask ? 'Editar Lembrete' : 'Novo Lembrete'}
          </h2>
          <div className="flex items-center gap-1.5">
            <button 
              type="button" 
              onClick={() => { triggerHaptic('light'); setIsImportant(!isImportant); }} 
              className={`p-2.5 rounded-2xl transition-all ${isImportant ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'}`}
              title="Marcar como Importante"
            >
              <Star size={16} fill={isImportant ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => { triggerHaptic('light'); onClose(); }} className="p-2.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:text-white transition-all">
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
              placeholder="O que precisa ser feito? (Ex: Tomar Metadona 5mg)"
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
                onClick={() => { triggerHaptic('light'); setShowNewCatInput(!showNewCatInput); }}
                className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1"
              >
                <Plus size={12} /> Nova Categoria
              </button>
            </div>

            {showNewCatInput && (
              <div className="space-y-3 mb-3 p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl animate-in fade-in">
                <input 
                  type="text" 
                  placeholder="Nome da categoria..." 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 outline-none"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsIconPickerOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-indigo-300 font-semibold"
                  >
                    <span>Ícone Selecionado: {selectedIcon}</span>
                  </button>
                  <button type="button" onClick={handleAddCategory} className="px-4 py-2 bg-indigo-600 text-xs font-bold text-white rounded-xl">Criar Categoria</button>
                </div>
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categoriesList.map((cat) => (
                <button 
                  key={cat.id || cat.name}
                  type="button"
                  onClick={() => { triggerHaptic('light'); setCategory(cat.name); }}
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
                onClick={() => { triggerHaptic('light'); setReminderType('none'); }}
                className={`py-2 text-xs rounded-xl font-medium border transition-all ${reminderType === 'none' ? 'bg-zinc-700 border-zinc-500 text-white font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
              >
                Padrão
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setReminderType('time'); }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl font-medium border transition-all ${reminderType === 'time' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
              >
                <Clock size={14} /> Horário
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setReminderType('location'); }}
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
                <MapPin size={14} className="text-indigo-400" /> Selecione o local no mapa:
              </label>
              
              <MapPicker 
                lat={lat} 
                lng={lng} 
                radius={radiusMeters} 
                onLocationChange={(newLat: number, newLng: number) => { 
                  setLat(newLat); 
                  setLng(newLng); 
                  setLocationName(`Lat: ${newLat.toFixed(4)}, Lng: ${newLng.toFixed(4)}`);
                }} 
              />

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Raio de alcance do alerta:</span>
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

          {/* Checklist */}
          <div className="p-3.5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl space-y-2.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckSquare size={14} className="text-indigo-400" /> Checklist (Subtarefas)
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleCheckItem(item.id)}
                  className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-xl text-xs border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {item.completed ? (
                      <CheckSquare size={15} className="text-indigo-400 shrink-0" />
                    ) : (
                      <Square size={15} className="text-zinc-600 shrink-0" />
                    )}
                    <span className={item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                      {item.text}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setChecklist(checklist.filter(i => i.id !== item.id));
                    }}
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

      {/* MODAL SELETOR DE ÍCONES AVANÇADO */}
      {isIconPickerOpen && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-100">Escolha um Ícone</h3>
              <button onClick={() => setIsIconPickerOpen(false)} className="p-2 text-zinc-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {ICON_CATEGORIES.map((group) => (
                <div key={group.category} className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{group.category}</span>
                  <div className="grid grid-cols-4 gap-2">
                    {group.icons.map((IconComp: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(group.category);
                          setIsIconPickerOpen(false);
                          triggerHaptic('success');
                        }}
                        className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-300 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <IconComp size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
