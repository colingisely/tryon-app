import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Retorna um cliente mock ou nulo para evitar erro de build
    // No navegador, essas variáveis devem estar presentes
    return {} as any
  }

  return createBrowserClient(url, key)
}
