import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Server-side guard to restrict sensitive endpoints to superadmins.
 * - Allows local override via cookie `smartpdfx_superadmin=true` or env `ALLOW_EXPORT_LOCAL=1`.
 * - Uses Supabase auth to fetch current user and role from `profiles` table.
 */
export async function requireSuperadmin(req: Request): Promise<Response | null> {
  try {
    const cookieStore = cookies()
    const localOverride = (await cookieStore).get('smartpdfx_superadmin')?.value === 'true'
    if (process.env.ALLOW_EXPORT_LOCAL === '1' || localOverride) {
      return null
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile as any)?.role
    if (role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return null
  } catch (e) {
    // Fail closed if auth/DB not reachable
    return NextResponse.json({ error: 'Auth check failed' }, { status: 401 })
  }
}