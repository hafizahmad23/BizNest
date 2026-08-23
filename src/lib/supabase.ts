import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey: string | undefined =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * True when real Supabase credentials are configured.
 * When false, the app must show "Database not configured" errors instead of
 * silently simulating data locally.
 */
export const isSupabaseConfigured: boolean = Boolean(supabaseUrl && supabaseKey);

export const DATABASE_NOT_CONFIGURED_ERROR =
  'Database not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';

// Create the client only when configured; otherwise create a harmless inert
// client so imports never crash the bundle. Every operation on the inert
// client is guarded by isSupabaseConfigured checks in supabaseDB/supabaseAuth.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
