// hooks/useTasks.ts
import { useState, useEffect, useMemo } from 'react';
import { db, Task } from '../lib/db';
import { supabase } from '../lib/supabase';
import { processRecurrence } from '../lib/recurrence';

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const loadTasks = async () => {
    const localTasks = await db.tasks.where('status').equals('pending').toArray();
    setTasks(localTasks);
  };

  useEffect(() => {
    loadTasks();
  }, [userId]);

  // Agrupamento Inteligente por Prazos e Filtro de Pesquisa
  const categorizedTasks = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const filtered = tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const past: Task[] = [];
    const today: Task[] = [];
    const upcoming: Task[] = [];

    filtered.forEach(t => {
      if (!t.reminder_time) {
        upcoming.push(t);
        return;
      }
      const taskDateStr = t.reminder_time.slice(0, 10);
      if (taskDateStr < todayStr) {
        past.push(t);
      } else if (taskDateStr === todayStr) {
        today.push(t);
      } else {
        upcoming.push(t);
      }
    });

    return { past, today, upcoming };
  }, [tasks, searchQuery]);

  const handleCompleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus = 'archived';
    await db.tasks.update(id, { status: newStatus });
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);

    await processRecurrence(task);
    loadTasks();
  };

  const handleToggleCheck = async (taskId: string, checkId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;
    const updatedChecklist = task.checklist.map(item => 
      item.id === checkId ? { ...item, completed: !item.completed } : item
    );
    await db.tasks.update(taskId, { checklist: updatedChecklist });
    await supabase.from('tasks').update({ checklist: updatedChecklist }).eq('id', taskId);
    loadTasks();
  };

  return {
    tasks,
    categorizedTasks,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    handleCompleteTask,
    handleToggleCheck,
    loadTasks
  };
}
