import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { roleLabel, useAuth } from '../context/auth'

export function HeaderProfile({ onColor = false }: { onColor?: boolean }) {
  const navigate = useNavigate()
  const { user, appUser, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  if (loading) {
    return <span className={`text-sm ${onColor ? 'text-white/80' : 'text-brand-muted'}`}>…</span>
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className={
          onColor
            ? 'rounded-xl border-2 border-white/50 bg-white/15 px-3 py-1.5 text-sm font-bold text-white shadow-[0_3px_0_rgba(0,0,0,0.15)]'
            : 'rounded-full border border-brand-border bg-brand-surface px-4 py-1.5 text-sm font-medium text-brand-primary hover:bg-brand-bg'
        }
      >
        Sign in
      </Link>
    )
  }

  const displayName = appUser?.display_name?.trim() || user.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase() || 'U'
  const label = roleLabel(appUser?.role)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          onColor
            ? 'flex items-center gap-2 rounded-xl border-2 border-white/50 bg-white/15 py-1 pl-1 pr-2 shadow-[0_3px_0_rgba(0,0,0,0.15)]'
            : 'flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface py-1 pl-1 pr-3 hover:bg-brand-bg'
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${
            onColor ? 'bg-[#1cb0f6]' : 'bg-brand-primary'
          }`}
        >
          {initial}
        </span>
        <span className="hidden min-w-0 flex-col text-left leading-tight sm:flex">
          <span className={`max-w-[8rem] truncate text-xs font-semibold ${onColor ? 'text-white' : 'text-brand-text'}`}>
            {displayName}
          </span>
          <span className={`text-[10px] ${onColor ? 'text-white/75' : 'text-brand-muted'}`}>{label}</span>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-brand-border bg-brand-surface py-1 shadow-lg"
        >
          <div className="border-b border-brand-border px-3 py-2 sm:hidden">
            <p className="truncate text-sm font-medium text-brand-text">{displayName}</p>
            <p className="text-xs text-brand-muted">{label}</p>
          </div>
          <p className="hidden truncate px-3 py-2 text-xs text-brand-muted sm:block">
            {user.email}
          </p>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-bg"
            onClick={() => {
              setOpen(false)
              void signOut().then(() => navigate('/'))
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
