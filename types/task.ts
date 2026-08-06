export type Task = {
  id?: string;
  title: string;
  description?: string;
  pillar: 'empresa' | 'pessoal' | 'saude';
  status: 'pending' | 'completed' | 'archived';
  reminder_time?: string;
};
