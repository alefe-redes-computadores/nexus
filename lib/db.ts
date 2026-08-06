import Dexie, { Table } from 'dexie';

export interface CheckItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Category {
  id?: string;
  name: string;
  icon: string;
  user_id?: string;
}

export interface Task {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  category: string; 
  status: 'pending' | 'completed' | 'archived';
  is_important?: boolean;
  checklist?: CheckItem[];
  tags?: string[]; // NOVO: Propriedade de tags dinâmicas
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder_type?: 'none' | 'time' | 'location';
  reminder_time?: string;
  location_name?: string;
  lat?: number;
  lng?: number;
  radius_meters?: number;
  notified?: boolean;
  updated_at?: string;
}

export class MyDatabase extends Dexie {
  tasks!: Table<Task>;
  categories!: Table<Category>;

  constructor() {
    super('NexusDB');
    // Índices otimizados para busca instantânea mesmo com milhares de registros
    this.version(5).stores({
      tasks: 'id, user_id, category, status, is_important, reminder_type',
      categories: 'id, name'
    });
  }
}

export const db = new MyDatabase();
