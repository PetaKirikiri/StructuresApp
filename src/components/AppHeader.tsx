import { Link } from 'react-router-dom'
import { HeaderProfile } from '../components/HeaderProfile'
import { TrainingButton } from '../components/TrainingButton'

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-brand-border bg-brand-surface/95 backdrop-blur-sm">
      <div className="app-container app-header-inner">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-brand-muted">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TrainingButton />
          <HeaderProfile />
        </div>
      </div>
    </header>
  )
}

export function AppHeaderBack({ title }: { title: string }) {
  return (
    <header className="border-b border-brand-border bg-brand-surface">
      <div className="app-container app-header-inner items-center">
        <Link to="/" className="text-sm font-medium text-brand-muted hover:text-brand-text">
          ← Structures
        </Link>
        <h1 className="text-sm font-semibold text-brand-primary">{title}</h1>
        <div className="flex items-center gap-2">
          <TrainingButton />
          <HeaderProfile />
        </div>
      </div>
    </header>
  )
}
