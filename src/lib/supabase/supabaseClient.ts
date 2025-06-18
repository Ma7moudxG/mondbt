// src/lib/supabase/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Make sure this ENV var is set in Netlify!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key are not set!");
}
if (!supabaseServiceRoleKey) {
  console.warn("Supabase Service Role Key is not set. Functions requiring elevated privileges might fail.");
}

export const supabase: SupabaseClient = createClient(supabaseUrl as string, supabaseAnonKey as string);

// export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl as string, supabaseServiceRoleKey as string, {
//     auth: {
//         persistSession: false, // Important for server-side
//     },
// });