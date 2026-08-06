'use client';
import { Check, Star, Heart, User, Briefcase, FileText, Coffee, Bookmark, Square, CheckSquare, Trash2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { triggerHaptic } from '../lib/haptics';

const ICONS_MAP: any = { 
  Saúde: Heart, 
  Pessoal: User, 
  Trabalho: Briefcase, 
  Documentos: FileText, 
  Alimentação: Coffee, 
  Geral: Bookmark 
};

export default function TaskCard({ task, onComplete, onEdit, onToggleCheck }: any) {
  const Icon = ICONS_MAP[task.category] || Bookmark;
  
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['rgba(239, 68, 68, 0.2)', 'rgba(24, 24, 27, 0.4)', 'rgba(34, 197, 94, 0.2)']
  );

  function handleDragEnd(event: any, info: any) {
    if (info.offset.x > 100) {
      triggerHaptic('success');
      onComplete(task.id);
    } else if (info.offset.x < -100) {
      triggerHaptic('medium');
      onComplete(task.id); // Alterna estado (arquiva/completa)
    }
  }

  return (
    <motion.div 
      style={{ background }}
      className="rounded-3xl overflow-hidden border border-zinc-800 shadow-sm transition-colors"
    >
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x }}
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={() => { triggerHaptic('light'); onEdit(task); }}
        className="p-4 bg-zinc-900/90 backdrop-blur-md cursor-pointer flex flex-col gap-3 active:cursor-grabbing select-none"
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Icon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-zinc-100">{task.title}</h3>
                {task.is_important && <Star size={14} className="text-amber-400 fill-amber-400" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{task.category}</span>
            </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); triggerHaptic('success'); onComplete(task.id); }} 
            className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            title="Concluir"
          >
            <Check size={18} />
          </button>
        </div>

        {task.checklist && task.checklist.length > 0 && (
          <div className="space-y-1.5 pl-2 border-l border-zinc-800 ml-1 pt-1">
            {task.checklist.map((item: any) => (
              <div 
                key={item.id} 
                onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); onToggleCheck(task.id, item.id); }} 
                className="flex items-center gap-2.5 py-1 px-2 rounded-xl text-xs text-zinc-400 hover:bg-zinc-800/60 transition-all"
              >
                {item.completed ? <CheckSquare size={14} className="text-indigo-400 shrink-0" /> : <Square size={14} className="text-zinc-600 shrink-0" />}
                <span className={item.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
