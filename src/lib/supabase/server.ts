
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If envs are missing (e.g., during static build), return a tolerant mock
  if (!url || !key) {
    const mockQuery = async () => ({ data: [], error: null })
    const mockStorage = {
      upload: async () => ({ data: null as any, error: new Error('Supabase not configured') }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } } as any),
    }

    return {
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
      from: (_table: string) => ({ select: mockQuery, eq: (_: string, __: any) => ({ select: mockQuery, single: mockQuery }) } as any),
      storage: { from: (_bucket: string) => mockStorage } as any,
    } as any
  }

  const cookieStore = cookies()
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, '', options)
        } catch {}
      },
    },
  })
}
