import Dexie, { Table } from 'dexie';

export interface CheckItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  category: string; // Ex: 'saude', 'pessoal', 'vencimentos', etc.
  pillar: 'empresa' | 'pessoal' | 'saude';
  status: 'pending' | 'completed' | 'archived';
  is_important?: boolean;
  checklist?: CheckItem[];
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder_type?: 'none' | 'time' | 'location';
  reminder_time?: string;
  location_name?: string;
  lat?: number;
  lng?: number;
  radius_meters?: number;
  attachment_url?: string; // Foto ou arquivo anexo
  notified?: boolean;
  updated_at?: string;
}

export class MyDatabase extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('NexusDB');
    this.version(3).stores({
      tasks: '++id, user_id, category, pillar, status, is_important, reminder_type'
    });
  }
}

export const db = new MyDatabase();
