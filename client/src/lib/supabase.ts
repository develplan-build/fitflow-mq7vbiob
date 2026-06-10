import { createClient } from '@supabase/supabase-js'

const url = (import.meta as any).env?.VITE_SUPABASE_URL
const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseConfigured = !!supabase

export async function signInWithGoogle() {
  if (!supabase) {
    alert('Login Google non configurato: aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY')
    return
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/app' }
  })
  if (error) alert('Errore login Google: ' + error.message)
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}
