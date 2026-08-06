'use client';
import { useState, useEffect } from 'react';
import { X, Mic, CheckSquare, Square, Star, Clock, MapPin, User, Briefcase, FileText, Coffee, Bookmark, Smile, Dumbbell, Home, ShoppingBag, Car, Plane, Shield, Zap, BookOpen, Music, Code, Image as ImageIcon, Navigation, Check, Trash2, Edit2, Eye } from 'lucide-react';
import { db, Task, CheckItem, Category } from '../lib/db';
import { supabase } from '../lib/supabase';
import { syncPushTask, syncPushCategory, uploadTaskAttachment } from '../lib/sync';
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

export default function TaskModal({ isOpen, onClose, onTaskCreated, userId, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [category, setCategory] = useState(initialTask?.category || 'Pessoal');
  const [isImportant, setIsImportant] = useState(initialTask?.is_important || false);
  const [checklist, setChecklist] = useState<CheckItem[]>(initialTask?.checklist || []);
  const [newCheckText, setNewCheckText] = useState('');
  
  const [reminderType, setReminderType] = useState<'none' | 'time' | 'location'>(initialTask?.reminder_type || 'none');
  const [reminderTime, setReminderTime] = useState(initialTask?.reminder_time || '');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(initialTask?.recurrence || 'none');
  
  const [locationName, setLocationName] = useState(initialTask?.location_name || 'Local Selecionado');
  const [lat, setLat] = useState<number | undefined>(initialTask?.lat || -18.5808);
  const [lng, setLng] = useState<number | undefined>(initialTask?.lng || -46.5181);
  const [radiusMeters, setRadiusMeters] = useState(initialTask?.radius_meters || 100);

  // Gerenciamento Avançado de Anexos
  const [attachments, setAttachments] = useState<any[]>(initialTask?.attachments || []);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [editingAttachmentIndex, setEditingAttachmentIndex] = useState<number | null>(null);
  const [tempCustomName, setTempCustomName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('User');

  const [activeTab, setActiveTab] = useState<'none' | 'category' | 'time' | 'location' | 'attachment' | 'checklist'>('none');
  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    let cats = await db.categories.toArray();
    if (cats.length === 0) {
      const defaultCats: Category[] = [
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

  // Remove a extensão do nome para exibição limpa
  function stripExtension(filename: string) {
    return filename.replace(/\.[^/.]+$/, '');
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      triggerHaptic('medium');
      const tempId = initialTask?.id || crypto.randomUUID();
      const publicUrl = await uploadTaskAttachment(file, tempId);

      // Salva o nome sem extensão por padrão
      const cleanName = stripExtension(file.name);

      setAttachments([...attachments, { 
        name: cleanName, 
        url: publicUrl, 
        type: file.type 
      }]);
      triggerHaptic('success');
    } catch (err) {
      console.error('Erro ao enviar arquivo:', err);
      alert('Erro ao enviar o anexo para a nuvem.');
    } finally {
      setUploadingFile(false);
    }
  }

  function saveAttachmentName(index: number) {
    if (!tempCustomName.trim()) return;
    const updated = [...attachments];
    // Garante que o nome customizado não traga extensões acidentais digitadas pelo usuário
    updated[index].name = stripExtension(tempCustomName.trim());
    setAttachments(updated);
    setEditingAttachmentIndex(null);
    setTempCustomName('');
    triggerHaptic('light');
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
      attachments, 
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
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) { triggerHaptic('light'); onClose(); } }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-t-[32px] sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto font-sans flex flex-col justify-between">
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
              {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <div className="flex items-center gap-1.5">
              <button 
                type="button" 
                onClick={() => { triggerHaptic('light'); setIsImportant(!isImportant); }} 
                className={`p-2 rounded-xl transition-all ${isImportant ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}`}
                title="Importante"
              >
                <Star size={15} fill={isImportant ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => { triggerHaptic('light'); onClose(); }} className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">
                <X size={15} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3">
              <input 
                autoFocus
                type="text"
                className="w-full bg-transparent text-sm outline-none text-zinc-100 placeholder-zinc-500 pr-10"
                placeholder="O que precisa ser feito?..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button 
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-3 p-1.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-400 hover:text-indigo-400'}`}
              >
                <Mic size={16} />
              </button>
            </div>

            {/* BARRA DE FERRAMENTAS INFERIOR */}
            <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 px-2">
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setActiveTab(activeTab === 'category' ? 'none' : 'category'); }}
                className={`p-2.5 rounded-xl transition-all ${activeTab === 'category' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                title="Categoria"
              >
                <User size={18} />
              </button>

              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setActiveTab(activeTab === 'time' ? 'none' : 'time'); setReminderType('time'); }}
                className={`p-2.5 rounded-xl transition-all ${activeTab === 'time' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                title="Horário"
              >
                <Clock size={18} />
              </button>

              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setActiveTab(activeTab === 'location' ? 'none' : 'location'); setReminderType('location'); }}
                className={`p-2.5 rounded-xl transition-all ${activeTab === 'location' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                title="Localização"
              >
                <MapPin size={18} />
              </button>

              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setActiveTab(activeTab === 'attachment' ? 'none' : 'attachment'); }}
                className={`p-2.5 rounded-xl transition-all ${activeTab === 'attachment' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                title="Galeria de Anexos"
              >
                <ImageIcon size={18} />
              </button>

              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setActiveTab(activeTab === 'checklist' ? 'none' : 'checklist'); }}
                className={`p-2.5 rounded-xl transition-all ${activeTab === 'checklist' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                title="Checklist"
              >
                <CheckSquare size={18} />
              </button>
            </div>

            {/* GAVETA: CATEGORIA */}
            {activeTab === 'category' && (
              <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Selecionar Categoria</span>
                  <button type="button" onClick={() => setShowNewCatInput(!showNewCatInput)} className="text-xs text-indigo-400 font-bold">+ Nova</button>
                </div>
                {showNewCatInput && (
                  <div className="space-y-2 pb-2 border-b border-zinc-800">
                    <input 
                      type="text" 
                      placeholder="Nome da nova categoria..." 
                      value={newCatName} 
                      onChange={e => setNewCatName(e.target.value)} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                    />
                    <button type="button" onClick={handleAddCategory} className="w-full py-2 bg-indigo-600 text-xs font-bold text-white rounded-xl">Salvar Categoria</button>
                  </div>
                )}
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {categoriesList.map((cat) => (
                    <button 
                      key={cat.id || cat.name}
                      type="button"
                      onClick={() => { triggerHaptic('light'); setCategory(cat.name); setActiveTab('none'); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${category === cat.name ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}
                    >
                      <span>{cat.name}</span>
                      {category === cat.name && <Check size={14} className="text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GAVETA: HORÁRIO E RECORRÊNCIA */}
            {activeTab === 'time' && (
              <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Agendamento de Data e Hora</span>
                  <button type="button" onClick={() => setReminderTime('')} className="text-[10px] text-zinc-500 hover:text-zinc-300">Limpar</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setHours(d.getHours() + 1);
                      setReminderTime(d.toISOString().slice(0, 16));
                      triggerHaptic('light');
                    }}
                    className="py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-medium hover:border-indigo-500 transition-all"
                  >
                    Daqui a 1 hora
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      d.setHours(8, 0, 0, 0);
                      setReminderTime(d.toISOString().slice(0, 16));
                      triggerHaptic('light');
                    }}
                    className="py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-medium hover:border-indigo-500 transition-all"
                  >
                    Amanhã (08:00)
                  </button>
                </div>
                <input 
                  type="datetime-local"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 outline-none focus:border-indigo-500"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
                <div className="pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setIsRecurrenceOpen(!isRecurrenceOpen)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-semibold"
                  >
                    <span>Repetição: <strong className="text-indigo-400 capitalize">{recurrence === 'none' ? 'Não Repetir' : recurrence}</strong></span>
                    <span className="text-[10px] text-zinc-500">Alterar ▾</span>
                  </button>
                  {isRecurrenceOpen && (
                    <div className="mt-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                      {[
                        { id: 'none', label: 'Não Repetir' },
                        { id: 'daily', label: 'Diariamente' },
                        { id: 'weekly', label: 'Semanalmente' },
                        { id: 'monthly', label: 'Mensalmente' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setRecurrence(item.id as any);
                            setIsRecurrenceOpen(false);
                            triggerHaptic('light');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${recurrence === item.id ? 'bg-indigo-600/20 text-indigo-300 font-bold' : 'text-zinc-400 hover:bg-zinc-800'}`}
                        >
                          <span>{item.label}</span>
                          {recurrence === item.id && <Check size={14} className="text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GAVETA: LOCALIZAÇÃO */}
            {activeTab === 'location' && (
              <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gatilho de Localização</span>
                  <button type="button" onClick={() => {
                    if (!navigator.geolocation) return alert('Geolocalização não suportada.');
                    triggerHaptic('medium');
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setLat(pos.coords.latitude);
                      setLng(pos.coords.longitude);
                      setReminderType('location');
                      setLocationName('Localização Atual (GPS)');
                    });
                  }} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold">
                    <Navigation size={12} /> GPS Atual
                  </button>
                </div>
                <MapPicker 
                  lat={lat} 
                  lng={lng} 
                  radius={radiusMeters} 
                  onLocationChange={(newLat: number, newLng: number, name?: string) => { 
                    setLat(newLat); 
                    setLng(newLng); 
                    if (name) setLocationName(name);
                  }} 
                />
              </div>
            )}

            {/* GAVETA: GALERIA DE ANEXOS LIMPA */}
            {activeTab === 'attachment' && (
              <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Galeria de Anexos</span>
                  <span className="text-[10px] text-zinc-500">{attachments.length} arquivo(s)</span>
                </div>
                
                {/* Grid de Miniaturas */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5 flex flex-col justify-between group">
                        
                        {editingAttachmentIndex === idx ? (
                          <div className="space-y-1.5 my-auto">
                            <input 
                              type="text" 
                              autoFocus
                              value={tempCustomName}
                              onChange={(e) => setTempCustomName(e.target.value)}
                              className="w-full bg-zinc-950 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white outline-none"
                              placeholder="Nome limpo..."
                            />
                            <div className="flex gap-1 justify-end">
                              <button type="button" onClick={() => saveAttachmentName(idx)} className="px-2 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-bold">Salvar</button>
                              <button type="button" onClick={() => setEditingAttachmentIndex(null)} className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md text-[10px]">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                <FileText size={16} />
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  type="button" 
                                  onClick={() => setPreviewUrl(file.url)}
                                  className="p-1.5 bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-all"
                                  title="Visualizar em Tela Cheia"
                                >
                                  <Eye size={13} />
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => { setEditingAttachmentIndex(idx); setTempCustomName(file.name); }}
                                  className="p-1.5 bg-zinc-800 text-zinc-300 hover:text-indigo-400 rounded-lg transition-all"
                                  title="Renomear Arquivo (Sem extensão)"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} 
                                  className="p-1.5 bg-zinc-800 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-zinc-200 truncate" title={file.name}>{file.name}</p>
                              <p className="text-[9px] text-zinc-500 uppercase font-mono">arquivo nuvem</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão de Upload */}
                <div className="text-center p-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40">
                  <ImageIcon size={24} className="mx-auto text-indigo-400 mb-1" />
                  <p className="text-xs font-bold text-zinc-200">{uploadingFile ? 'Enviando para a nuvem...' : 'Adicionar novo arquivo'}</p>
                  <input 
                    type="file" 
                    disabled={uploadingFile}
                    className="w-full text-xs text-zinc-400 file:mt-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}

            {/* GAVETA: CHECKLIST */}
            {activeTab === 'checklist' && (
              <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Checklist de Subtarefas</span>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {checklist.map((item) => (
                    <div key={item.id} onClick={() => toggleCheckItem(item.id)} className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-xl text-xs border border-zinc-800 cursor-pointer">
                      <div className="flex items-center gap-2">
                        {item.completed ? <CheckSquare size={14} className="text-indigo-400" /> : <Square size={14} className="text-zinc-600" />}
                        <span className={item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>{item.text}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setChecklist(checklist.filter(i => i.id !== item.id)); }} className="text-zinc-500 hover:text-red-400">✕</button>
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
                  <button type="button" onClick={addChecklistItem} className="bg-indigo-600 px-3 py-2 rounded-xl text-xs font-bold text-white">Adicionar</button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || uploadingFile}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-xs tracking-wider uppercase shadow-xl shadow-indigo-600/30 active:scale-98 transition-all disabled:opacity-50 mt-4 text-white"
            >
              {loading ? 'Salvando...' : (initialTask ? 'Salvar Alterações' : 'Criar Tarefa')}
            </button>
          </form>
        </div>

      </div>

      {/* LIGHTBOX / TELA CHEIA */}
      {previewUrl && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-12 right-0 p-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-all"
            >
              <X size={20} />
            </button>
            <div className="w-full overflow-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex items-center justify-center max-h-[80vh]">
              {previewUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || previewUrl.includes('image') ? (
                <img src={previewUrl} alt="Visualização" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
              ) : (
                <iframe src={previewUrl} className="w-full h-[75vh] rounded-xl bg-white" title="Documento" />
              )}
            </div>
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              Abrir em Nova Aba / Baixar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
