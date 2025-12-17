import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env file.");
}

/**
 * Supabase client instance
 * Configured with project URL and anonymous key from environment variables
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
