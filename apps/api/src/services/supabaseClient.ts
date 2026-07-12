import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// Server-side Supabase client using the service role key. This key bypasses
// Row Level Security and must NEVER be exposed to the frontend - it lives
// only in this backend's environment variables (see .env.example).
export const supabase = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }
  return supabase;
}
