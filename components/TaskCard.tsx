'use client';
import { Check, Archive } from 'lucide-react';
import { Task } from '../lib/db';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

export default function TaskCard({ task, onComplete }: TaskCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm transition-all hover:border-zinc-700">
      <div className="flex flex-col gap-1 pr-2">
        <h3 className="font-medium text-sm text-zinc-200">{task.title}</h3>
        {task.description && (
          <p className="text-xs text-zinc-400 line-clamp-2">{task.description}</p>
        )}
        <span className="mt-2 text-[10px] uppercase font-bold tracking-widest text-indigo-400 w-fit px-2 py-0.5 rounded bg-indigo-500/10">
          {task.pillar}
        </span>
      </div>

      <button
        onClick={() => task.id && onComplete(task.id)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/50 text-zinc-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95"
        title="Concluir tarefa"
      >
        <Check size={18} />
      </button>
    </div>
  );
}
