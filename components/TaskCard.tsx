'use client';
import { Check, Star, Heart, User, Briefcase, FileText, Coffee, Bookmark, Square, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '../lib/haptics';

const ICONS_MAP: any = { Saúde: Heart, Pessoal: User, Trabalho: Briefcase, Documentos: FileText, Alimentação: Coffee, Geral: Bookmark };

export default function TaskCard({ task, onComplete, onEdit, onToggleCheck }: any) {
  const Icon = ICONS_MAP[task.category] || Bookmark;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => { triggerHaptic('light'); onEdit(task); }}
      className="p-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md cursor-pointer flex flex-col gap-3 active:scale-[0.98] transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400"><Icon size={18} /></div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">{task.title}</h3>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">{task.category}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); triggerHaptic('success'); onComplete(task.id); }} className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all"><Check size={18} /></button>
      </div>
      {task.checklist?.map((item: any) => (
        <div key={item.id} onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); onToggleCheck(task.id, item.id); }} className="flex items-center gap-2 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 rounded-lg">
          {item.completed ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} />}
          <span className={item.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}>{item.text}</span>
        </div>
      ))}
    </motion.div>
  );
}
