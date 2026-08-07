'use client';
import { Flame, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsPanelProps {
  completedToday: number;
  streak: number;
  totalActiveToday?: number; // Opcional para calcular porcentagem se houver tarefas
}

export default function StatsPanel({ completedToday, streak }: StatsPanelProps) {
  // Meta diária simulada ou baseada em progresso (ex: meta de 5 tarefas por dia)
  const dailyGoal = 5;
  const progressPercent = Math.min(Math.round((completedToday / dailyGoal) * 100), 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="px-6 mt-4 font-sans"
    >
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-4 shadow-lg backdrop-blur-xl space-y-3 select-none">
        
        {/* Linha Superior: Métricas principais */}
        <div className="flex items-center gap-3">
          
          {/* Bloco 1: Concluídas Hoje */}
          <div className="flex-1 flex items-center gap-3 bg-zinc-950/50 border border-zinc-800/60 rounded-2xl p-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Hoje</p>
              <p className="text-sm font-bold text-zinc-100 truncate">{completedToday} <span className="text-xs font-normal text-zinc-400">concluídas</span></p>
            </div>
          </div>

          {/* Bloco 2: Sequência / Streak */}
          <div className="flex-1 flex items-center gap-3 bg-zinc-950/50 border border-zinc-800/60 rounded-2xl p-3">
            <div className={`p-2.5 border rounded-xl shrink-0 ${streak > 0 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 animate-pulse' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500'}`}>
              <Flame size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Sequência</p>
              <p className="text-sm font-bold text-zinc-100 truncate">{streak} <span className="text-xs font-normal text-zinc-400">{streak === 1 ? 'dia' : 'dias'}</span></p>
            </div>
          </div>

        </div>

        {/* Linha Inferior: Barra de Progresso da Meta Diária */}
        <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-3 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
              <TrendingUp size={14} className="text-indigo-400" />
              <span>Progresso Diário</span>
            </div>
            <span className="font-mono font-bold text-indigo-400">{progressPercent}%</span>
          </div>

          {/* Barra Visual */}
          <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
            />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
