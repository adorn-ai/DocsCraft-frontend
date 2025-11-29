import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON //commenting out anonkey to bypass rls
// const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// db types
export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  is_subscribed: boolean
}

// Expose supabase client to browser console
if (typeof window !== "undefined") {
  // @ts-ignore
  window.supabase = supabase;
}