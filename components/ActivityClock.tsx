'use client';
import { motion } from 'framer-motion';

export default function ActivityClock({ tasks }: { tasks: any[] }) {
  // Simples lógica: conta tarefas para hoje, amanhã e depois
  const todayTasks = tasks.length; 
  const progress = Math.min((todayTasks / 5) * 100, 100);

  return (
    <div className="flex items-center gap-6 p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 my-4 mx-6">
      <div className="relative w-20 h-20 flex items-center justify-center">
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
          <span className="text-xl font-black">{todayTasks}</span>
          <p className="text-[8px] uppercase tracking-widest text-zinc-500">Hoje</p>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold">Fluxo do Dia</h3>
        <p className="text-[11px] text-zinc-500 leading-tight">O Nexus está monitorando {todayTasks} atividades pendentes na sua linha do tempo.</p>
      </div>
    </div>
  );
}
