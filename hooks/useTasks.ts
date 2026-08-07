import { useState, useEffect, useMemo } from 'react';
import { db, Task } from '../lib/db';
import { supabase } from '../lib/supabase';
import { processRecurrence } from '../lib/recurrence';

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null); // NOVO: Estado do filtro de tag

  const loadTasks = async () => {
    const localTasks = await db.tasks.where('status').equals('pending').toArray();
    setTasks(localTasks);
  };

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const categorizedTasks = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const query = searchQuery.toLowerCase().trim();

    const filtered = tasks.filter(t => {
      const matchTitle = t.title.toLowerCase().includes(query);
      const matchCategory = t.category.toLowerCase().includes(query);
      const matchAttachments = t.attachments?.some((att: any) => 
        att.name && att.name.toLowerCase().includes(query)
      );
      
      // Filtro por TAG: Se existir uma tag ativa, a tarefa só aparece se tiver a tag
      const matchTag = activeTag ? t.tags?.includes(activeTag) : true;

      return (matchTitle || matchCategory || matchAttachments) && matchTag;
    });

    const past: Task[] = [];
    const today: Task[] = [];
    const upcoming: Task[] = [];

    filtered.forEach(t => {
      if (!t.reminder_time) {
        upcoming.push(t);
        return;
      }
      const taskDateStr = t.reminder_time.slice(0, 10);
      if (taskDateStr < todayStr) past.push(t);
      else if (taskDateStr === todayStr) today.push(t);
      else upcoming.push(t);
    });

    return { past, today, upcoming };
  }, [tasks, searchQuery, activeTag]); // Adicionado activeTag como dependência

  const handleCompleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = 'archived';
    await db.tasks.update(id, { status: newStatus });
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    await processRecurrence(task);
    loadTasks();
  };

  return {
    tasks,
    categorizedTasks,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    activeTag,        // Expondo para o UI
    setActiveTag,     // Expondo para o UI
    handleCompleteTask,
    loadTasks
  };
}
