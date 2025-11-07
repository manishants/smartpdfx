
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If envs are missing (e.g., during static build), return a tolerant mock
  if (!url || !key) {
    const mockSelectResult = { data: [], error: null } as const
    const mockMutationError = { data: null as any, error: new Error('Supabase not configured') }

    // Minimal chainable Postgrest builder that is Thenable
    const makeBuilder = () => {
      const builder: any = {
        select: (_fields?: string) => builder,
        eq: (_column: string, _value: any) => builder,
        order: (_column: string, _opts?: any) => builder,
        single: () => builder,
        then: (resolve: (value: any) => any) => resolve(mockSelectResult),
        catch: (_reject: (reason?: any) => any) => ({ data: [], error: null }),
        finally: (_onFinally: () => void) => undefined,
      }
      return builder
    }

    const mockStorage = {
      upload: async () => mockMutationError,
      getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } } as any),
    }

    return {
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
      from: (_table: string) => ({
        select: (_fields?: string) => makeBuilder(),
        eq: (_column: string, _value: any) => makeBuilder(),
        order: (_column: string, _opts?: any) => makeBuilder(),
        single: () => makeBuilder(),
        insert: (_rows: any[]) => ({ then: (resolve: (value: any) => any) => resolve(mockMutationError) }),
        update: (_values: any) => ({ then: (resolve: (value: any) => any) => resolve(mockMutationError) }),
        delete: () => ({ eq: (_column: string, _value: any) => ({ then: (resolve: (value: any) => any) => resolve(mockMutationError) }) }),
      }),
      storage: { from: (_bucket: string) => mockStorage },
    }
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
