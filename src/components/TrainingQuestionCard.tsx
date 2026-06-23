import { motion } from 'framer-motion'
import { TrainingMaoriBubble } from './training/TrainingMaoriBubble'
import type { TrainingQuestion } from '../lib/trainingQuiz'

type TrainingQuestionCardProps = {
  question: TrainingQuestion
  picked: string | null
  onPick: (answer: string) => void
}

function DuoChoiceButton({
  choice,
  index,
  answered,
  isCorrect,
  isPicked,
  onPick,
}: {
  choice: string
  index: number
  answered: boolean
  isCorrect: boolean
  isPicked: boolean
  onPick: () => void
}) {
  let face = 'border-[#afafaf] bg-white text-[#4b4b4b] shadow-[0_4px_0_#afafaf] hover:bg-[#f7f7f7]'
  let badge = 'bg-[#1cb0f6] shadow-[0_3px_0_#1899d6]'

  if (answered && isCorrect) {
    face = 'border-[#58cc02] bg-[#d7ffb8] text-[#2b6b00] shadow-[0_4px_0_#58cc02]'
    badge = 'bg-[#58cc02] shadow-[0_3px_0_#46a302]'
  } else if (answered && isPicked) {
    face = 'border-[#ff4b4b] bg-[#ffdfe0] text-[#8b0012] shadow-[0_4px_0_#ff4b4b]'
    badge = 'bg-[#ff4b4b] shadow-[0_3px_0_#ea2b2b]'
  } else if (answered) {
    face = 'border-[#e5e5e5] bg-[#fafafa] text-[#afafaf] shadow-none opacity-60'
    badge = 'bg-[#afafaf] shadow-none'
  }

  return (
    <motion.button
      type="button"
      disabled={answered}
      onClick={onPick}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={answered ? undefined : { y: -2 }}
      whileTap={answered ? undefined : { y: 2, boxShadow: '0 2px 0 #afafaf' }}
      transition={{ type: 'spring', stiffness: 420, damping: 26, delay: 0.25 + index * 0.1 }}
      className={`training-choice-button flex w-full items-center gap-3 border-2 text-left font-bold leading-snug transition-colors disabled:cursor-default ${face}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white ${badge}`}
      >
        {index + 1}
      </span>
      <span>{choice}</span>
    </motion.button>
  )
}

export function TrainingQuestionCard({ question, picked, onPick }: TrainingQuestionCardProps) {
  const answered = picked !== null
  const wrongPick = answered && picked !== question.correctAnswer

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="training-question flex flex-col"
    >
      <div className="text-center">
        <span className="inline-block rounded-full border-2 border-[#ffc800] bg-[#fff4cc] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-[#a66c00] shadow-[0_3px_0_#ffc800]">
          {question.label}
        </span>
      </div>

      <TrainingMaoriBubble variant={question.maori} shake={wrongPick} />

      <div className="training-choice-list mx-auto flex w-full flex-col pt-2">
        {question.choices.map((choice, index) => (
          <DuoChoiceButton
            key={choice}
            choice={choice}
            index={index}
            answered={answered}
            isCorrect={choice === question.correctAnswer}
            isPicked={picked === choice}
            onPick={() => onPick(choice)}
          />
        ))}
      </div>
    </motion.article>
  )
}
