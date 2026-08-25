/**
 * supabaseAdmin.ts
 *
 * Service-role Supabase client — bypasses RLS entirely. This must NEVER
 * be imported into frontend code or have its key exposed to the browser.
 * Used only by backend routes that need privileged operations RLS is
 * deliberately designed to block from the client (creating auth users,
 * writing border_logs with a computed decision, sending email on the
 * department's behalf).
 *
 * Required environment variables (server-side only, never prefixed with
 * VITE_ or otherwise bundled into frontend code):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check your backend .env file"
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
