import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

export type AppUserRow = {
  id: number
  email: string
  display_name: string | null
  role: string
}

export type AuthContextValue = {
  user: User | null
  loading: boolean
  appUser: AppUserRow | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function roleLabel(role: string | undefined): string {
  if (role === 'super_admin') return 'Admin'
  if (role === 'coordinator') return 'Teacher'
  if (role === 'hr_admin') return 'Coordinator'
  return 'Student'
}
