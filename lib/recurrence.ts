// lib/recurrence.ts
import { Task } from './db';
import { syncPushTask } from './sync';

export async function processRecurrence(task: Task) {
  if (!task.recurrence || task.recurrence === 'none') return;

  // Define a base de tempo para a próxima ocorrência
  const baseDate = task.reminder_time ? new Date(task.reminder_time) : new Date();
  
  if (task.recurrence === 'daily') {
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (task.recurrence === 'weekly') {
    baseDate.setDate(baseDate.getDate() + 7);
  } else if (task.recurrence === 'monthly') {
    baseDate.setMonth(baseDate.getMonth() + 1);
  }

  const nextTask: Task = {
    ...task,
    id: crypto.randomUUID(), // Novo ID único para a nova ocorrência
    status: 'pending',
    reminder_time: task.reminder_time ? baseDate.toISOString() : undefined,
    notified: false, // Reseta o gatilho de notificação para o novo dia
    updated_at: new Date().toISOString()
  };

  // Salva e sincroniza automaticamente local e nuvem
  await syncPushTask(nextTask);
}
