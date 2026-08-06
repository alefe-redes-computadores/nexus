'use client';
import { Flame, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsPanel({ completedToday, streak }: { completedToday: number, streak: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="px-6 mt-4"
    >
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-sm select-none">
        
        {/* Bloco 1: Concluídas Hoje */}
        <div className="flex-1 flex items-center gap-3 pl-2 border-r border-zinc-800">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Hoje</p>
            <p className="text-sm font-semibold text-zinc-100">{completedToday} concluídas</p>
          </div>
        </div>

        {/* Bloco 2: Sequência / Streak */}
        <div className="flex-1 flex items-center gap-3 pl-2">
          <div className={`p-2 rounded-xl ${streak > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-zinc-800 text-zinc-500'}`}>
            <Flame size={16} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Sequência</p>
            <p className="text-sm font-semibold text-zinc-100">{streak} {streak === 1 ? 'dia' : 'dias'}</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
