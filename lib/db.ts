import Dexie, { Table } from 'dexie';

export interface Task {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  pillar: 'empresa' | 'pessoal' | 'saude';
  status: 'pending' | 'completed' | 'archived';
  reminder_type?: 'none' | 'time' | 'location';
  reminder_time?: string;
  lat?: number;
  lng?: number;
  radius_meters?: number;
  location_name?: string;
  notified?: boolean;
  updated_at?: string;
}

export class MyDatabase extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('NexusDB');
    this.version(2).stores({
      tasks: '++id, user_id, pillar, status, reminder_type, notified'
    });
  }
}

export const db = new MyDatabase();
