import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading, signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-brand-muted">Loading…</div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setPending(true)
    const { error: authError } = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password)
    setPending(false)
    if (authError) {
      setError(
        authError.message === 'Failed to fetch'
          ? 'Could not reach Supabase. Check your env keys and restart the dev server.'
          : authError.message,
      )
      return
    }
    navigate('/', { replace: true })
  }

  const fieldClass =
    'w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent'

  return (
    <div className="min-h-dvh bg-brand-bg">
      <header className="border-b border-brand-border bg-brand-surface">
        <div className="app-container app-header-inner items-center">
          <Link to="/" className="text-sm font-medium text-brand-muted hover:text-brand-text">
            ← Back
          </Link>
          <span className="text-sm font-semibold text-brand-primary">Te Reo</span>
        </div>
      </header>

      <main className="login-main flex flex-col">
        <div className="login-card border border-brand-border bg-brand-surface shadow-sm">
          <h1 className="text-2xl font-semibold text-brand-primary">Sign in</h1>
          <p className="mt-1 text-sm text-brand-muted">Use your Pūrākau account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-text">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-brand-text">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className={fieldClass}
              />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand-accent py-2.5 text-sm font-medium text-white hover:bg-brand-primary disabled:opacity-50"
            >
              {pending ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsSignUp((value) => !value)
              setError(null)
            }}
            className="mt-4 w-full text-center text-sm text-brand-muted hover:text-brand-text"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </main>
    </div>
  )
}
