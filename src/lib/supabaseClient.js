import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Safely initialize the client only if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn(
    "BooklyPro: Supabase credentials (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are not set. " +
    "Running in offline mode utilizing the high-fidelity LocalStorage Mock Engine."
  );
}
