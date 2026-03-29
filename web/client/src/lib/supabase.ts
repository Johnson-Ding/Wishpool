import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://hfwqkeycrxbmeinyrkdh.supabase.co";
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3FrZXljcnhibWVpbnlya2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY2MTUsImV4cCI6MjA5MDE1MjYxNX0.G3ohFCS7gYVHjGxe-v4UkIXlFEsOcd5HTL0_dKRSNT0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ensure user is anonymously authenticated
export async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) console.error("Anonymous auth failed:", error);
  }
}
