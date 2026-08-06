import { supabase } from './supabase';
import { db, Task, Category } from './db';

export function initAutoSync(userId: string, onDataChanged: () => void) {
  if (!userId) return;

  // Puxa tudo da nuvem ao iniciar
  syncPull(userId).then(onDataChanged);

  // Canal em tempo real para Tasks
  const tasksChannel = supabase
    .channel('public:tasks')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      async (payload) => {
        if (payload.eventType === 'DELETE') {
          await db.tasks.delete(payload.old.id);
        } else {
          await db.tasks.put(payload.new as Task);
        }
        onDataChanged();
      }
    )
    .subscribe();

  return () => { 
    supabase.removeChannel(tasksChannel); 
  };
}

export async function syncPull(userId: string) {
  // 1. Sincroniza Tarefas
  const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', userId);
  if (tasksData) {
    for (const task of tasksData) {
      await db.tasks.put(task);
    }
  }

  // 2. Sincroniza Categorias
  const { data: catsData } = await supabase.from('categories').select('*');
  if (catsData) {
    for (const cat of catsData) {
      await db.categories.put(cat);
    }
  }
}

export async function syncPushTask(task: Task) {
  if (!task.id) task.id = crypto.randomUUID();
  await db.tasks.put(task);
  await supabase.from('tasks').upsert([task]);
}

export async function syncPushCategory(category: Category) {
  await db.categories.put(category);
  await supabase.from('categories').upsert([category]);
}

// NOVO: Função para enviar anexos direto para o Supabase Storage na nuvem
export async function uploadTaskAttachment(file: File, taskId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${taskId}/${crypto.randomUUID()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('attachments')
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName);
    
  return publicUrlData.publicUrl;
}
