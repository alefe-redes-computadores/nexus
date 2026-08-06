'use client';
import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../lib/haptics';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  priorityTask: any;
  onCompleteTask: (id: string) => void;
}

export default function FocusModeModal({ isOpen, onClose, priorityTask, onCompleteTask }: FocusModeProps) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 minutos de foco
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      triggerHaptic('success');
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-zinc-950/98 backdrop-blur-3xl flex flex-col justify-between p-6 font-sans text-zinc-100"
      >
        {/* Topo */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Flame size={14} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Zona de Foco Ativa</span>
          </div>
          <button 
            onClick={() => { triggerHaptic('light'); onClose(); }}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Centro - Tarefa em Destaque e Timer */}
        <div className="flex flex-col items-center text-center space-y-8 my-auto">
          {priorityTask ? (
            <div className="space-y-3 max-w-sm">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tarefa Prioritária</span>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight leading-snug">
                {priorityTask.title}
              </h2>
              <span className="inline-block px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-indigo-400 font-semibold">
                {priorityTask.category}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-zinc-400">Nenhuma tarefa pendente no momento</h2>
              <p className="text-xs text-zinc-600">Curta seu momento de descanso ou adicione novas metas.</p>
            </div>
          )}

          {/* Relógio / Timer de Foco */}
          <div className="relative flex items-center justify-center p-8">
            <div className="text-6xl font-black tracking-tighter text-indigo-400 font-mono">
              {formattedTime}
            </div>
          </div>

          {/* Controles do Timer */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { triggerHaptic('medium'); setIsActive(!isActive); }}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              {isActive ? <Pause size={16} /> : <Play size={16} />}
              {isActive ? 'Pausar' : 'Iniciar Foco'}
            </button>
            <button 
              onClick={() => { triggerHaptic('light'); setSecondsLeft(25 * 60); setIsActive(false); }}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white active:scale-95 transition-all"
              title="Resetar"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Rodapé - Ação de Concluir Tarefa Focada */}
        {priorityTask && (
          <div className="pb-4">
            <button 
              onClick={() => { 
                triggerHaptic('success'); 
                onCompleteTask(priorityTask.id); 
                onClose(); 
              }}
              className="w-full py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <CheckCircle size={16} /> Concluir esta Tarefa e Sair
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
