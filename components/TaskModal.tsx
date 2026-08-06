'use client';
import { useState } from 'react';
import { X, Clock, MapPin } from 'lucide-react';
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
  
  // Estados para as regras avançadas de lembrete
  const [reminderType, setReminderType] = useState<'none' | 'time' | 'location'>('none');
  const [reminderTime, setReminderTime] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(100); // Raio padrão de 100m
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    const newTask: Task & { reminder_type?: string; reminder_time?: string; radius_meters?: number; location_name?: string } = {
      user_id: userId,
      title,
      description,
      pillar,
      status: 'pending',
      reminder_type: reminderType,
      reminder_time: reminderType === 'time' ? reminderTime : undefined,
      radius_meters: reminderType === 'location' ? radiusMeters : undefined,
      location_name: reminderType === 'location' ? locationName : undefined,
    };

    try {
      // Salva localmente (Local-First)
      await db.tasks.add(newTask);

      // Sincroniza com o Supabase em background
      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) console.error('Erro ao sincronizar:', error);

      // Limpa os campos
      setTitle('');
      setDescription('');
      setReminderType('none');
      setReminderTime('');
      setLocationName('');
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Nova Tarefa Inteligente</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <input 
            autoFocus
            type="text"
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-indigo-500"
            placeholder="O que precisa ser feito?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea 
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 resize-none h-16"
            placeholder="Detalhes ou anotação (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Seleção de Pilares */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Pilar</label>
            <div className="flex gap-2">
              {(['empresa', 'pessoal', 'saude'] as const).map((p) => (
                <button 
                  key={p} 
                  type="button"
                  onClick={() => setPillar(p)} 
                  className={`flex-1 py-2 text-xs rounded-xl capitalize font-medium transition-all ${
                    pillar === p ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Gatilhos de Lembrete Inteligente */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Gatilho de Alerta</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReminderType('none')}
                className={`py-2 text-xs rounded-xl font-medium border transition-all ${reminderType === 'none' ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800/50 border-zinc-800 text-zinc-400'}`}
              >
                Padrão
              </button>
              <button
                type="button"
                onClick={() => setReminderType('time')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl font-medium border transition-all ${reminderType === 'time' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-800/50 border-zinc-800 text-zinc-400'}`}
              >
                <Clock size={14} /> Horário
              </button>
              <button
                type="button"
                onClick={() => setReminderType('location')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl font-medium border transition-all ${reminderType === 'location' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-800/50 border-zinc-800 text-zinc-400'}`}
              >
                <MapPin size={14} /> Local
              </button>
            </div>
          </div>

          {/* Configuração de Horário */}
          {reminderType === 'time' && (
            <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-2xl space-y-2 animate-in fade-in">
              <label className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                <Clock size={14} className="text-indigo-400" /> Selecionar Horário do Lembrete
              </label>
              <input 
                type="datetime-local"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
          )}

          {/* Configuração de Localização e Raio em Metros */}
          {reminderType === 'location' && (
            <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in">
              <label className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                <MapPin size={14} className="text-indigo-400" /> Alerta por Proximidade (Geofencing)
              </label>
              <input 
                type="text"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500"
                placeholder="Ex: Trabalho, Casa, Hospital Sarah..."
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
                  className="w-full accent-indigo-500 bg-zinc-800 cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">O app vai disparar a notificação quando você estiver a essa distância do ponto.</span>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Salvando...' : 'Criar Tarefa'}
          </button>
        </form>
      </div>
    </div>
  );
}
