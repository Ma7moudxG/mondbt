// netlify/functions/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your Netlify site settings
// They will be available during Netlify Function execution.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set!");
  // In a production app, you might want to throw an error or handle this more gracefully.
  // For development, it will likely just lead to an error when createClient is called.
}

export const supabase: SupabaseClient = createClient(supabaseUrl as string, supabaseKey as string);