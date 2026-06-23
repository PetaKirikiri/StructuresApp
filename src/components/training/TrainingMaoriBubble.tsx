import { motion } from 'framer-motion'
import type { MaoriVariant } from '../../types/sentenceStructure'

type TrainingMaoriBubbleProps = {
  variant: MaoriVariant
  shake?: boolean
}

export function TrainingMaoriBubble({ variant, shake = false }: TrainingMaoriBubbleProps) {
  return (
    <motion.div
      animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className="training-bubble relative mx-auto"
    >
      <div className="training-bubble-card relative border-2 border-[#e5e5e5] bg-white shadow-[0_8px_0_#e5e5e5]">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-[#afafaf]">
          What does this mean?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {variant.parts.map((line, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 22,
                delay: 0.1 + index * 0.08,
              }}
              className="maori-chip inline-flex items-center border-2 border-[#84d8ff] bg-[#ddf4ff] font-extrabold text-[#1899d6]"
            >
              {line}
            </motion.span>
          ))}
        </div>
      </div>
      <div
        aria-hidden
        className="mx-auto h-0 w-0 border-x-[14px] border-t-[16px] border-x-transparent border-t-[#e5e5e5]"
      />
      <div
        aria-hidden
        className="relative -top-px mx-auto h-0 w-0 border-x-[12px] border-t-[14px] border-x-transparent border-t-white"
      />
    </motion.div>
  )
}
