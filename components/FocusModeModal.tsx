'use client';
import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, Flame, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../lib/haptics';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  priorityTask: any;
  onCompleteTask: (id: string) => void;
}

const FOCUS_TIME = 25 * 60; // 25 minutos
const BREAK_TIME = 5 * 60;  // 5 minutos

export default function FocusModeModal({ isOpen, onClose, priorityTask, onCompleteTask }: FocusModeProps) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
    } else if (isActive && secondsLeft === 0) {
      // Quando o tempo acaba!
      triggerHaptic('heavy');
      setIsActive(false);
      
      // Troca automática de modo
      if (mode === 'focus') {
        setMode('break');
        setSecondsLeft(BREAK_TIME);
      } else {
        setMode('focus');
        setSecondsLeft(FOCUS_TIME);
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, mode]);

  // Se o modal for fechado, garantimos que o timer pause para não rodar fantasma 
  // (opcional: se quiser que rode em segundo plano, é só remover esse useEffect)
  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isFocus = mode === 'focus';

  function handleSwitchMode(newMode: 'focus' | 'break') {
    if (mode === newMode) return;
    triggerHaptic('light');
    setIsActive(false);
    setMode(newMode);
    setSecondsLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  }

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
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isFocus ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            {isFocus ? <Flame size={14} /> : <Coffee size={14} />}
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              {isFocus ? 'Zona de Foco' : 'Pausa Ativa'}
            </span>
          </div>
          <button 
            onClick={() => { triggerHaptic('light'); onClose(); }}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Centro - Tarefa em Destaque e Timer */}
        <div className="flex flex-col items-center text-center space-y-6 my-auto">
          {priorityTask && isFocus ? (
            <div className="space-y-3 max-w-sm animate-in fade-in slide-in-from-bottom-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prioridade Atual</span>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight leading-snug">
                {priorityTask.title}
              </h2>
              <div className="flex justify-center gap-2 flex-wrap">
                <span className="inline-block px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  {priorityTask.category}
                </span>
                {priorityTask.tags && priorityTask.tags.map((tag: string) => (
                  <span key={tag} className="inline-block px-2 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : !isFocus ? (
             <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold text-emerald-400 tracking-tight">Hora de relaxar a mente</h2>
              <p className="text-xs text-zinc-500">Levante-se, beba uma água e descanse os olhos.</p>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in">
              <h2 className="text-xl font-bold text-zinc-400 tracking-tight">Painel Limpo</h2>
              <p className="text-xs text-zinc-600">Nenhuma tarefa pendente na fila.</p>
            </div>
          )}

          {/* Seletor de Modo */}
          <div className="flex bg-zinc-900/50 border border-zinc-800 p-1 rounded-2xl">
            <button 
              onClick={() => handleSwitchMode('focus')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isFocus ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Foco (25m)
            </button>
            <button 
              onClick={() => handleSwitchMode('break')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${!isFocus ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Pausa (5m)
            </button>
          </div>

          {/* Relógio / Timer de Foco */}
          <div className="relative flex items-center justify-center py-4">
            <div className={`text-7xl font-black tracking-tighter font-mono transition-colors duration-500 ${isFocus ? 'text-indigo-400' : 'text-emerald-400'}`}>
              {formattedTime}
            </div>
          </div>

          {/* Controles do Timer */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { triggerHaptic('medium'); setIsActive(!isActive); }}
              className={`px-8 py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-xl flex items-center gap-2 active:scale-95 transition-all ${isFocus ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'}`}
            >
              {isActive ? <Pause size={16} /> : <Play size={16} />}
              {isActive ? 'Pausar' : 'Iniciar'}
            </button>
            <button 
              onClick={() => { 
                triggerHaptic('light'); 
                setSecondsLeft(isFocus ? FOCUS_TIME : BREAK_TIME); 
                setIsActive(false); 
              }}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white active:scale-95 transition-all"
              title="Resetar Tempo"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Rodapé - Ação de Concluir Tarefa Focada */}
        <div className="pb-4 min-h-[64px]">
          {priorityTask && isFocus && (
            <button 
              onClick={() => { 
                triggerHaptic('success'); 
                onCompleteTask(priorityTask.id); 
                onClose(); 
              }}
              className="w-full py-4 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <CheckCircle size={16} /> Concluir e Sair
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
