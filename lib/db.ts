import Dexie, { Table } from 'dexie';

export interface Task {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  pillar: 'empresa' | 'pessoal' | 'saude';
  status: 'pending' | 'completed' | 'archived';
  updated_at?: string;
}

export class MyDatabase extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('NexusDB');
    this.version(1).stores({
      tasks: '++id, user_id, pillar, status' // Índices para busca rápida
    });
  }
}

export const db = new MyDatabase();
