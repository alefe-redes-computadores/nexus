'use client';
import { Check, Star, Clock, MapPin, Heart, User, Briefcase, FileText, Coffee, Bookmark, Square, CheckSquare } from 'lucide-react';
import { Task } from '../lib/db';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleCheck: (taskId: string, checkId: string) => void;
}

const ICONS_MAP: Record<string, any> = {
  Saúde: Heart,
  Pessoal: User,
  Trabalho: Briefcase,
  Documentos: FileText,
  Alimentação: Coffee,
  Geral: Bookmark,
};

export default function TaskCard({ task, onComplete, onEdit, onToggleCheck }: TaskCardProps) {
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

      {/* Checklist Interativo */}
      {task.checklist && task.checklist.length > 0 && (
        <div className="space-y-1.5 pl-1 my-1">
          {task.checklist.map(item => (
            <div 
              key={item.id} 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (task.id) onToggleCheck(task.id, item.id); 
              }}
              className="text-xs flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-zinc-800/50 transition-all text-zinc-300"
            >
              {item.completed ? (
                <CheckSquare size={15} className="text-indigo-400 shrink-0" />
              ) : (
                <Square size={15} className="text-zinc-600 shrink-0" />
              )}
              <span className={item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé com Alertas */}
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
