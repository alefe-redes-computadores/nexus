// lib/db.ts
import Dexie, { Table } from 'dexie';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  updatedAt: number;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  pillar: 'empresa' | 'pessoal' | 'saude';
  completed: boolean;
  dueDate?: string; // Data e horário do lembrete
  reminderType?: 'time' | 'location'; // Tipo de lembrete
  locationData?: {
    latitude: number;
    longitude: number;
    radius: number; // em metros
    addressName: string;
  };
  priority: 'low' | 'medium' | 'high';
  attachmentUrl?: string;
  synced: number;
  updatedAt: number;
}

export class AppDatabase extends Dexie {
  tasks!: Table<Task, string>;
  profile!: Table<UserProfile, string>;

  constructor() {
    super('NexusDB');
    this.version(1).stores({
      tasks: 'id, pillar, completed, synced, updatedAt, reminderType',
      profile: 'id'
    });
  }
}

export const db = new AppDatabase();
