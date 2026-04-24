import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/isAdmin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/check
 *
 * Returns `{ isAdmin, email }` for the currently authenticated Supabase
 * user. Checks email against the server-side `ADMIN_EMAILS` allowlist
 * (see `lib/auth/isAdmin.ts`). Used by `/admin` and `/backoffice` pages
 * to gate access.
 *
 * Security notes:
 *  - Runs server-side so the allowlist is never shipped in the JS bundle.
 *  - Fail-closed: any error returns `{ isAdmin: false }`.
 *  - Always returns 200 (no information leak about auth state).
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin = isAdminEmail(user?.email)
    return NextResponse.json({ isAdmin, email: user?.email ?? null })
  } catch (err) {
    console.error('[/api/admin/check] error:', err)
    return NextResponse.json({ isAdmin: false, email: null })
  }
}
