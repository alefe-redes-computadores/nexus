'use client';
import { Check, Star, Clock, MapPin, Heart, User, Briefcase, FileText, Coffee, Bookmark, Square, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Task } from '../lib/db';
import { triggerHaptic } from '../lib/haptics';

// ... (ICONS_MAP igual ao anterior)

export default function TaskCard({ task, onComplete, onEdit, onToggleCheck }: any) {
  const IconComponent = ICONS_MAP[task.category] || Bookmark;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => { triggerHaptic('light'); onEdit(task); }}
      className="p-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md transition-all hover:border-zinc-700 cursor-pointer flex flex-col gap-3 shadow-sm active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <IconComponent size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">{task.title}</h3>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{task.category}</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); triggerHaptic('success'); task.id && onComplete(task.id); }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <Check size={18} />
        </button>
      </div>

      {/* Checklist com interação aprimorada */}
      {task.checklist?.length > 0 && (
        <div className="space-y-1 pl-1 border-l border-zinc-800 ml-1">
          {task.checklist.map((item: any) => (
            <div 
              key={item.id} 
              onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); onToggleCheck(task.id, item.id); }}
              className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-zinc-800/50"
            >
              {item.completed ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} className="text-zinc-600" />}
              <span className={`text-xs ${item.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{item.text}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
