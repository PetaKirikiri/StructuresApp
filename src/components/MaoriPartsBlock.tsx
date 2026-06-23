import { motion } from 'framer-motion'
import type { MaoriVariant } from '../types/sentenceStructure'

type MaoriPartsBlockProps = {
  variant: MaoriVariant
  showDivider?: boolean
  animated?: boolean
}

export function MaoriPartsBlock({ variant, showDivider, animated = false }: MaoriPartsBlockProps) {
  return (
    <div className={showDivider ? 'border-t border-brand-border/60 pt-4' : undefined}>
      <div className="maori-parts-list">
        {variant.parts.map((line, index) => {
          const chip = (
            <span className="maori-chip inline-flex items-center border border-brand-accent/20 bg-linear-to-br from-white to-brand-bg font-semibold leading-snug text-brand-primary shadow-sm">
              {line}
            </span>
          )

          if (!animated) return <span key={index}>{chip}</span>

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 14, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 24,
                delay: 0.08 + index * 0.07,
              }}
            >
              {chip}
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}
