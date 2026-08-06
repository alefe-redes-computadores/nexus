'use client';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

export default function ActivityClock({ tasks, onOpenFocus }: { tasks: any[], onOpenFocus: () => void }) {
  const todayTasks = tasks.length; 
  const progress = Math.min((todayTasks / 5) * 100, 100);

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={() => { triggerHaptic('medium'); onOpenFocus(); }}
      className="flex items-center gap-6 p-6 bg-gradient-to-br from-indigo-950/30 to-zinc-900/60 rounded-3xl border border-indigo-500/20 my-4 mx-6 cursor-pointer shadow-xl relative overflow-hidden group"
    >
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
      
      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" className="stroke-zinc-800" strokeWidth="6" fill="transparent" />
          <motion.circle 
            cx="40" cy="40" r="36" 
            className="stroke-indigo-500" 
            strokeWidth="6" 
            fill="transparent"
            strokeDasharray="226"
            initial={{ strokeDashoffset: 226 }}
            animate={{ strokeDashoffset: 226 - (226 * progress) / 100 }}
            transition={{ duration: 1 }}
          />
        </svg>
        <div className="absolute text-center">
          <Flame size={20} className="mx-auto text-indigo-400 mb-0.5 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Focar</span>
        </div>
      </div>
      
      <div className="space-y-1 z-10">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-zinc-100">Ativar Zona de Foco</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">{todayTasks} pendentes</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-tight">Toque aqui para isolar sua prioridade máxima e iniciar a imersão.</p>
      </div>
    </motion.div>
  );
}
