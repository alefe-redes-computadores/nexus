'use client';
import { Mic, Plus } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

interface QuickInputBarProps {
  onClick: () => void;
  onVoiceClick?: () => void;
}

export default function QuickInputBar({ onClick }: QuickInputBarProps) {
  return (
    <div className="fixed bottom-6 left-6 right-6 z-40 max-w-lg mx-auto">
      <div 
        onClick={() => { triggerHaptic('light'); onClick(); }}
        className="w-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-all active:scale-98"
      >
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Plus size={18} />
          </div>
          <span className="text-xs font-medium text-zinc-300">Adicionar lembrete...</span>
        </div>
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Evita conflito com o clique da barra
            triggerHaptic('medium');
            onClick();
            // Pequeno delay para garantir que o modal abriu antes de disparar o voz
            setTimeout(() => {
              const voiceBtn = document.getElementById('voice-input-trigger');
              if (voiceBtn) voiceBtn.click();
            }, 100);
          }}
          className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-indigo-400 transition-all"
          title="Ditado por voz rápido"
        >
          <Mic size={18} />
        </button>
      </div>
    </div>
  );
}
