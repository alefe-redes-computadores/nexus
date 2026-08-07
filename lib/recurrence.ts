import { db, Task } from './db';
import { supabase } from './supabase';
import { syncPushTask } from './sync';

export async function processRecurrence(task: Task) {
  // Se a tarefa não tem recorrência ou se a recorrência for 'none', não faz nada
  if (!task.recurrence || task.recurrence === 'none') return;

  const originalTime = task.reminder_time ? new Date(task.reminder_time) : new Date();
  const nextTime = new Date(originalTime);

  // Calcula a data da próxima ocorrência com base na regra escolhida
  if (task.recurrence === 'daily') {
    nextTime.setDate(nextTime.getDate() + 1);
  } else if (task.recurrence === 'weekly') {
    nextTime.setDate(nextTime.getDate() + 7);
  } else if (task.recurrence === 'monthly') {
    nextTime.setMonth(nextTime.getMonth() + 1);
  } else {
    return;
  }

  // Cria a nova tarefa clonando a original, mas com o ID novo e a data atualizada
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(), // Novo ID único
    status: 'pending',       // Volta como pendente para aparecer na tela
    reminder_time: task.reminder_time ? nextTime.toISOString() : undefined,
    notified: false,         // Reseta o alarme para disparar na nova data
    updated_at: new Date().toISOString()
  };

  try {
    // Salva no banco local (Dexie) e sincroniza com a nuvem (Supabase)
    await db.tasks.put(newTask);
    await syncPushTask(newTask);
    console.log(`Recorrência processada: Nova tarefa gerada para ${nextTime.toLocaleDateString('pt-BR')}`);
  } catch (err) {
    console.error('Erro ao gerar tarefa recorrente:', err);
  }
}
