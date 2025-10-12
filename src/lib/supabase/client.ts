
"use client";

import { createBrowserClient } from '@supabase/ssr'

// NOTE: This file is not used in the login page anymore, 
// but might be used by other client components in the future.
// The login page now gets its credentials from a server action.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
