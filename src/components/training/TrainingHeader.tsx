import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeaderProfile } from '../HeaderProfile'

type TrainingHeaderProps = {
  progress: number
  introducedCount: number
  total: number
}

export function TrainingHeader({ progress, introducedCount, total }: TrainingHeaderProps) {
  return (
    <header className="relative z-20 px-4 pb-3 pt-4">
      <div className="training-header-inner">
        <Link
          to="/"
          aria-label="Back to structures"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#46a302] bg-[#58cc02] text-lg font-bold text-white shadow-[0_4px_0_#46a302] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_#46a302]"
        >
          ✕
        </Link>

        <div className="min-w-0 flex-1">
          <div className="h-4 overflow-hidden rounded-full border-2 border-[#afafaf] bg-[#e5e5e5] shadow-inner">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-[#58cc02] to-[#89e219]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(8, progress * 100)}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            />
          </div>
          <p className="mt-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-white/90 drop-shadow-sm">
            {introducedCount} / {total} unlocked
          </p>
        </div>

        <div className="shrink-0">
          <HeaderProfile onColor />
        </div>
      </div>
    </header>
  )
}
