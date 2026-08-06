'use client';
import { Check, Star, Clock, MapPin, Heart, User, Briefcase, FileText, Coffee, Bookmark } from 'lucide-react';
import { Task } from '../lib/db';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
}

// Mapeamento dinâmico de ícones para as categorias
const ICONS_MAP: Record<string, any> = {
  Saúde: Heart,
  Pessoal: User,
  Trabalho: Briefcase,
  Documentos: FileText,
  Alimentação: Coffee,
  Geral: Bookmark,
};

export default function TaskCard({ task, onComplete, onEdit }: TaskCardProps) {
  // Pega o ícone com base na categoria ou usa um padrão
  const IconComponent = ICONS_MAP[task.category] || Bookmark;

  return (
    <div 
      onClick={() => onEdit(task)}
      className="p-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl transition-all hover:border-zinc-700 cursor-pointer flex flex-col gap-2.5 shadow-lg active:scale-[0.99]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <IconComponent size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              {task.is_important && <Star size={13} className="text-amber-400 fill-amber-400" />}
              <h3 className="font-semibold text-sm text-zinc-100">{task.title}</h3>
            </div>
            <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">{task.category}</span>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); task.id && onComplete(task.id); }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-zinc-700/60 bg-zinc-800/80 text-zinc-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95"
          title="Concluir lembrete"
        >
          <Check size={16} />
        </button>
      </div>

      {/* Checklist / Subtarefas internas */}
      {task.checklist && task.checklist.length > 0 && (
        <div className="space-y-1.5 pl-3 border-l-2 border-indigo-500/30 my-1">
          {task.checklist.map(item => (
            <div key={item.id} className="text-xs text-zinc-400 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${item.completed ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
              <span className={item.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé do Card com Gatilhos (Horário ou Local) */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40 text-[11px] text-zinc-500">
        {task.reminder_type === 'time' && task.reminder_time && (
          <span className="flex items-center gap-1 text-indigo-300">
            <Clock size={12} /> {new Date(task.reminder_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        )}
        {task.reminder_type === 'location' && task.location_name && (
          <span className="flex items-center gap-1 text-emerald-400">
            <MapPin size={12} /> {task.location_name} ({task.radius_meters || 100}m)
          </span>
        )}
        {task.reminder_type === 'none' && <span>Sem alerta</span>}
      </div>
    </div>
  );
}
