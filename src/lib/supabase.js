import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDev = import.meta.env.MODE === 'development';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('PASTE_YOUR')) {
  console.error('Supabase configuration is missing or using placeholders. Check your .env.local file.');
} else {
  // Silent in production, but helpful in development to confirm the target
  if (isDev) {
    console.log(`[Supabase] Initializing in ${import.meta.env.MODE} mode`);
    console.log(`[Supabase] Target URL: ${supabaseUrl}`);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
