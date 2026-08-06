import { db, Task } from './db';
import { supabase } from './supabase';

export async function fullSyncWithCloud(userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: 'Usuário não autenticado.' };

  try {
    // 1. Baixar tudo do Supabase para o dispositivo (essencial pós-reinstalação)
    const { data: remoteTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    if (remoteTasks && remoteTasks.length > 0) {
      // Atualiza ou insere as tarefas remotas no banco local (Dexie)
      await db.transaction('rw', db.tasks, async () => {
        for (const rTask of remoteTasks) {
          const localTask = await db.tasks.get(rTask.id);
          if (!localTask) {
            await db.tasks.put(rTask);
          } else {
            // Preserva a versão mais recente
            await db.tasks.put({ ...localTask, ...rTask });
          }
        }
      });
    }

    // 2. Enviar para a nuvem tarefas criadas localmente que ainda não foram enviadas
    const localTasks = await db.tasks.where('user_id').equals(userId).toArray();
    const unsyncedTasks = localTasks.filter(t => !t.id || typeof t.id === 'number');

    for (const task of unsyncedTasks) {
      const { id, ...taskData } = task; // Remove ID numérico temporário do Dexie
      const { data: inserted, error: insertErr } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: userId }])
        .select()
        .single();

      if (!insertErr && inserted) {
        // Substitui o registro temporário local pelo definitivo do Supabase
        await db.tasks.delete(task.id!);
        await db.tasks.put(inserted);
      }
    }

    return { success: true, message: 'Sincronização concluída com sucesso!' };
  } catch (err: any) {
    console.error('Erro na sincronização:', err);
    return { success: false, message: err.message || 'Falha ao sincronizar.' };
  }
}
