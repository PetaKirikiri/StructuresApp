import { Link, useLocation } from 'react-router-dom'
import { DumbbellIcon } from './DumbbellIcon'

export function TrainingButton() {
  const { pathname } = useLocation()
  const active = pathname.startsWith('/training')

  return (
    <Link
      to="/training"
      aria-label="Training"
      title="Training"
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        active
          ? 'border-brand-accent bg-brand-accent text-white'
          : 'border-brand-border bg-brand-surface text-brand-primary hover:bg-brand-bg'
      }`}
    >
      <DumbbellIcon className="h-5 w-5" />
    </Link>
  )
}
