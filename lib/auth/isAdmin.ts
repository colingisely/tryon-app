/**
 * Admin email allowlist — SERVER-SIDE ONLY.
 *
 * Reads `ADMIN_EMAILS` env (comma-separated). In production, if the env
 * is unset or empty the function returns `[]` — no admin access.
 * That's intentional: fail-closed.
 *
 * In dev (`NODE_ENV !== 'production'`), if the env is empty we fall
 * back to a known list so local workflows keep working. Remove the
 * dev fallback once `ADMIN_EMAILS` is consistently set in every env.
 *
 * Client-side code MUST NOT import this directly. Use the
 * `GET /api/admin/check` endpoint instead — it runs `isAdminEmail`
 * server-side and returns `{ isAdmin }`.
 */

const DEV_FALLBACK_ADMIN_EMAILS = [
  'gcdigitaldesigner@gmail.com',
  'gisely@reflexy.co',
  'colin@reflexy.co',
  'admin@reflexy.co',
]

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? ''
  const envEmails = raw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (envEmails.length > 0) return envEmails

  // Dev bootstrap only. Production without env → [] (fail-closed).
  if (process.env.NODE_ENV !== 'production') {
    return DEV_FALLBACK_ADMIN_EMAILS.map(e => e.toLowerCase())
  }

  return []
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}
