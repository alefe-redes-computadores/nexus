'use client';
import { Check, Star, Clock } from 'lucide-react';
import { Task } from '../lib/db';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onComplete, onEdit }: TaskCardProps) {
  return (
    <div 
      onClick={() => onEdit(task)}
      className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm transition-all hover:border-zinc-700 cursor-pointer flex flex-col gap-2"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {task.is_important && <Star size={14} className="text-amber-400" fill="currentColor" />}
          <h3 className="font-medium text-sm text-zinc-200">{task.title}</h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); task.id && onComplete(task.id); }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/50 text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <Check size={16} />
        </button>
      </div>

      {/* Renderização de Checklist Interno (Subtarefas) */}
      {task.checklist && task.checklist.length > 0 && (
        <div className="space-y-1 pl-2 border-l-2 border-indigo-500/30 my-1">
          {task.checklist.map(item => (
            <div key={item.id} className="text-xs text-zinc-400 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
              <span className={item.completed ? 'line-through text-zinc-600' : ''}>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
          {task.category}
        </span>
        {task.reminder_time && (
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Clock size={10} /> {new Date(task.reminder_time).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
