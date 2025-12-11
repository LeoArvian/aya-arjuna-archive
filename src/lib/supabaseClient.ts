import { createClient } from '@supabase/supabase-js';

// Mengambil variabel environment (nanti kita buat file .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL atau Key belum disetting di .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);