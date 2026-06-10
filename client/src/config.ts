// Config centralizzata: API_URL dinamico in base all'ambiente.
// Priorità: VITE_API_URL (env) → window.location → localhost dev.

function resolveApiUrl(): string {
  // 1. Variabile d'ambiente Vite
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl && envUrl.trim()) return envUrl.replace(/\/$/, '')

  // 2. Browser: stesso host del frontend, porta 3001
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    // Dev locale
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001`
    }
    // Produzione: assume stesso dominio (proxy) oppure subdominio api
    return `${protocol}//${hostname.replace(/^www\./, '')}`
  }

  // 3. Fallback
  return 'http://localhost:3001'
}

export const API_URL = resolveApiUrl()

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || ''
export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

export const STRIPE_PUBLIC_KEY =
  (import.meta.env.VITE_STRIPE_PUBLIC_KEY as string) || ''