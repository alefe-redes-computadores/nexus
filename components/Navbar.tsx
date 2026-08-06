'use client';
import { LayoutGrid, Archive } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-6 py-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        <button 
          onClick={() => router.push('/')} 
          className={`p-3 rounded-2xl transition-all ${pathname === '/' ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Epicentro"
        >
          <LayoutGrid size={22} />
        </button>
        
        <button 
          onClick={() => router.push('/archive')} 
          className={`p-3 rounded-2xl transition-all ${pathname === '/archive' ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Arquivados"
        >
          <Archive size={22} />
        </button>
      </div>
    </nav>
  );
}
