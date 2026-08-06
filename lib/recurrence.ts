import { Task } from './db';
import { syncPushTask } from './sync';

export async function processRecurrence(task: Task) {
  if (task.recurrence === 'none' || !task.recurrence) return;

  const nextDate = new Date();
  if (task.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
  if (task.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
  if (task.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(), // Nova ID para a nova ocorrência
    status: 'pending',
    reminder_time: nextDate.toISOString(),
    notified: false, // Resetar notificação para a nova tarefa
    updated_at: new Date().toISOString()
  };

  await syncPushTask(newTask);
}
