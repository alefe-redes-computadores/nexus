'use client';
import { LayoutGrid, Archive, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar({ onAddTask }: { onAddTask: () => void }) {
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 p-4 flex justify-around items-center">
      <button onClick={() => router.push('/')} className="text-zinc-500 hover:text-indigo-400"><LayoutGrid size={24} /></button>
      <button onClick={onAddTask} className="bg-indigo-600 p-3 rounded-full -mt-8 shadow-xl shadow-indigo-900/40">
        <Plus size={28} className="text-white" />
      </button>
      <button onClick={() => router.push('/archive')} className="text-zinc-500 hover:text-indigo-400"><Archive size={24} /></button>
    </nav>
  );
}
