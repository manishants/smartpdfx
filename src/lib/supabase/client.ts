
"use client";

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Gracefully handle missing envs during build or preview
  if (!url || !key) {
    // Minimal mock client for auth flows used in UI
    const mockAuth = {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => {},
    } as const

    return {
      auth: mockAuth,
    } as any
  }

  return createBrowserClient(url, key)
}
