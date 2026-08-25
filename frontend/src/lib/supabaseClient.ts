import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars — check your .env file");
}

// This client uses the anon key + RLS — every query is automatically
// scoped to the logged-in user's role via the policies in
// sl_immigration_supabase_schema.sql. Never use the service-role key here.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
