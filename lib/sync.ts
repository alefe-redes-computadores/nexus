import { supabase } from './supabase';
import { db, Task } from './db';

// Inicializa a sincronização automática em tempo real
export function initAutoSync(userId: string, onDataChanged: () => void) {
  if (!userId) return;

  // 1. Sincronização inicial ao abrir o app
  syncPull(userId).then(onDataChanged);

  // 2. Canal de Realtime do Supabase (Ouvindo mudanças na nuvem)
  const channel = supabase
    .channel('public:tasks')
    .on(
      'postgres_changes',
      {
        event: '*', // Escuta INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const remoteTask = payload.new as Task;
        if (payload.eventType === 'DELETE') {
          await db.tasks.delete(payload.old.id);
        } else if (remoteTask) {
          // Atualiza o banco local com o que veio da nuvem
          await db.tasks.put(remoteTask);
        }
        onDataChanged();
      }
    )
    .subscribe();

  // Retorna a função para fechar o canal se necessário
  return () => {
    supabase.removeChannel(channel);
  };
}

// Função de puxar dados (Pull)
export async function syncPull(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    if (data) {
      for (const task of data) {
        await db.tasks.put(task);
      }
    }
  } catch (err) {
    console.error('Erro no Auto-Sync Pull:', err);
  }
}

// Função de empurrar dados (Push imediato para cada ação)
export async function syncPushTask(task: Task) {
  try {
    // Grava localmente primeiro (Local-First)
    if (!task.id) {
      task.id = crypto.randomUUID();
    }
    await db.tasks.put(task);

    // Envia para a nuvem em background
    const { error } = await supabase.from('tasks').upsert([task]);
    if (error) throw error;
  } catch (err) {
    console.error('Erro no Auto-Sync Push (salvo offline localmente):', err);
  }
}
