'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/db';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';

export default function ArchivePage() {
  const [user, setUser] = useState<any>(null);
  const [archivedTasks, setArchivedTasks] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadArchived();
  }, []);

  async function loadArchived() {
    const local = await db.tasks.where('status').equals('archived').toArray();
    setArchivedTasks(local);
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100">
      <Header user={user} />
      
      <div className="px-6">
        <h2 className="text-xl font-bold mb-6">Tarefas Arquivadas</h2>
        <div className="space-y-3">
          {archivedTasks.length === 0 ? (
            <p className="text-center text-zinc-600 py-10">Nenhuma tarefa finalizada ainda.</p>
          ) : (
            archivedTasks.map(task => (
              <div key={task.id} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 opacity-70">
                <h3 className="font-medium text-zinc-400 line-through">{task.title}</h3>
                <span className="text-[10px] uppercase text-zinc-600">{task.category || task.pillar}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <Navbar onAddTask={() => {}} />
    </main>
  );
}
