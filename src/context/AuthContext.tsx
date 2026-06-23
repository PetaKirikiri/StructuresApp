import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { AuthContext, type AppUserRow } from './auth'

function coerceInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function parseAuthSnapshot(data: unknown): AppUserRow | null {
  const raw =
    typeof data === 'string'
      ? (() => {
          try {
            return JSON.parse(data) as unknown
          } catch {
            return null
          }
        })()
      : data

  if (raw == null || typeof raw !== 'object') return null
  const user = (raw as { app_user?: Record<string, unknown> }).app_user
  if (!user) return null

  const id = coerceInt(user.id)
  if (id == null) return null

  return {
    id,
    email: String(user.email ?? ''),
    display_name: user.display_name == null ? null : String(user.display_name),
    role: String(user.role ?? 'user'),
  }
}

async function loadAppUser(authUser: User): Promise<AppUserRow | null> {
  await supabase.rpc('claim_app_user_by_email')
  await supabase.rpc('portal_ensure_app_user_for_auth')

  const snap = await supabase.rpc('portal_get_auth_snapshot')
  if (!snap.error) {
    const parsed = parseAuthSnapshot(snap.data)
    if (parsed) return parsed
  }

  const { data: au } = await supabase
    .from('app_users')
    .select('id, email, display_name, role')
    .eq('auth_user_id', authUser.id)
    .maybeSingle()

  if (!au) return null

  return {
    id: au.id as number,
    email: au.email as string,
    display_name: (au.display_name as string | null) ?? null,
    role: (au.role as string) ?? 'user',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUserRow | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const syncProfile = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setAppUser(null)
      setProfileLoading(false)
      return
    }
    setProfileLoading(true)
    try {
      setAppUser(await loadAppUser(authUser))
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        return syncProfile(session?.user ?? null)
      })
      .finally(() => setSessionReady(true))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      void syncProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [syncProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setAppUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: !sessionReady || (user !== null && profileLoading),
        appUser,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
