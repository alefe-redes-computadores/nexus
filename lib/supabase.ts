import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rnekatkvfhdkyiyvnfjo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWthdGt2Zmhka3lpeXZuZmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMjQ5MTIsImV4cCI6MjEwMTYwMDkxMn0.DpO9D2mPhJSZPbqHnVpDoZtLceCvm7yZy6mLOiDV8Yk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
