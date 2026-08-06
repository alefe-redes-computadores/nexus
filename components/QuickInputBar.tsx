'use client';
import { useState } from 'react';
import { Mic, Plus, Pill, Briefcase, User, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../lib/haptics';

export default function QuickInputBar({ onClick }: { onClick: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  const categories = [
    { name: 'Saúde', icon: Pill },
    { name: 'Trabalho', icon: Briefcase },
    { name: 'Pessoal', icon: User },
    { name: 'Estudos', icon: BookOpen }
  ];

  return (
    <>
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-6 right-6 z-40 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-2xl flex justify-between"
          >
            {categories.map((cat) => (
              <button 
                key={cat.name} 
                onClick={() => { triggerHaptic('light'); setShowMenu(false); onClick(); }}
                className="flex flex-col items-center gap-2 text-zinc-400 hover:text-indigo-400"
              >
                <cat.icon size={20} />
                <span className="text-[9px] font-bold uppercase">{cat.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-6 right-6 z-40 max-w-lg mx-auto">
        <div className="w-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={onClick}>
            <div 
              onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); setShowMenu(!showMenu); }}
              className={`p-2 rounded-xl transition-colors ${showMenu ? 'bg-indigo-600 text-white' : 'bg-indigo-600/20 text-indigo-400'}`}
            >
              {showMenu ? <X size={18} /> : <Plus size={18} />}
            </div>
            <span className="text-xs font-medium text-zinc-400">Adicionar lembrete...</span>
          </div>
          <button className="p-2.5 text-zinc-400 hover:text-indigo-400 transition-all">
            <Mic size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
