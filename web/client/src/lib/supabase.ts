import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://hfwqkeycrxbmeinyrkdh.supabase.co";
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3FrZXljcnhibWVpbnlya2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjM0NjgsImV4cCI6MjA1MjUzOTQ2OH0.s2q2P0eZ0Y9CJTr6Xx6cFfF8eAo6uPnwhEsKdBLjOGs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
