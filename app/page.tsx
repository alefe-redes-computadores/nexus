'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

export default function Epicentro() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data } = await supabase.from('tasks').select('*').eq('status', 'pending');
    setTasks(data || []);
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      <Header user={user} />
      
      <div className="px-6 space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50">
            <h3 className="font-semibold">{task.title}</h3>
            <span className="text-[10px] uppercase text-zinc-500">{task.pillar}</span>
          </div>
        ))}
      </div>

      <Navbar onAddTask={() => alert('Abrir modal de criação')} />
    </main>
  );
}
