'use client';
import { LayoutGrid, Archive, Plus, Settings } from 'lucide-react';

export default function Navbar({ onAddTask }: { onAddTask: () => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 p-4 flex justify-around items-center">
      <button className="text-indigo-400"><LayoutGrid size={24} /></button>
      <button onClick={onAddTask} className="bg-indigo-600 p-3 rounded-full -mt-8 shadow-xl shadow-indigo-900/40">
        <Plus size={28} className="text-white" />
      </button>
      <button className="text-zinc-600"><Archive size={24} /></button>
    </nav>
  );
}
