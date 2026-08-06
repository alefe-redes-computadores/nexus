'use client';
import { LayoutGrid, Archive, Plus, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar({ onAddTask }: { onAddTask: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-6 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        
        {/* Botão Home */}
        <button 
          onClick={() => router.push('/')} 
          className={`p-3 rounded-2xl transition-all ${pathname === '/' ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <LayoutGrid size={22} />
        </button>

        {/* Botão de Adicionar (Centralizado perfeitamente com geometria exata) */}
        <button 
          onClick={onAddTask} 
          className="absolute left-1/2 -top-6 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/40 active:scale-90 transition-all border-4 border-zinc-950"
        >
          <Plus size={26} />
        </button>

        {/* Botão Arquivo */}
        <button 
          onClick={() => router.push('/archive')} 
          className={`p-3 rounded-2xl transition-all ${pathname === '/archive' ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Archive size={22} />
        </button>

        {/* Botão Configurações */}
        <button 
          onClick={() => router.push('/settings')} 
          className={`p-3 rounded-2xl transition-all ${pathname === '/settings' ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Settings size={22} />
        </button>

      </div>
    </nav>
  );
}
