
"use client";

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Guard against environments where `process` is undefined in the browser
  const url = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) || ''
  const key = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || ''

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
