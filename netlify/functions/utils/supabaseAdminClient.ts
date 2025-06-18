import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These should be available in the Netlify Functions environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL; // Use NEXT_PUBLIC for consistency if also available, or just SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase URL or Service Role Key are not set for Admin client!");
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
    },
});