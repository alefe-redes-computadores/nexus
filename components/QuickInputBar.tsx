'use client';
import { Mic } from 'lucide-react';

interface QuickInputBarProps {
  onClick: () => void;
}

export default function QuickInputBar({ onClick }: QuickInputBarProps) {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-6 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div 
          onClick={onClick}
          className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-full px-5 py-3.5 flex items-center justify-between shadow-2xl cursor-pointer active:scale-[0.98] transition-all hover:border-zinc-700 group"
        >
          <span className="text-sm text-zinc-400 font-normal group-hover:text-zinc-300 transition-colors">
            Adicionar lembrete...
          </span>
          <div className="p-2 rounded-full bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Mic size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
