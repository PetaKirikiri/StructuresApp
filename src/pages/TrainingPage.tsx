import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrainingHeader } from '../components/training/TrainingHeader'
import { TrainingQuestionCard } from '../components/TrainingQuestionCard'
import { useAuth } from '../context/auth'
import { fetchAllSentenceStructures } from '../lib/sentenceStructures'
import { fetchStructureMastery, saveStructureMastery } from '../lib/structureMastery'
import {
  applyAnswerToMastery,
  countIntroduced,
  pickNextStructureId,
  type StructureMasteryRow,
} from '../lib/trainingProgression'
import { buildTrainingQuestionForStructure, getTrainableStructures } from '../lib/trainingQuiz'
import type { SentenceStructure } from '../types/sentenceStructure'

const SCENES = {
  idle: {
    bg: 'linear-gradient(180deg, #58cc02 0%, #46a302 28%, #ddf4ff 28%, #ffffff 100%)',
  },
  correct: {
    bg: 'linear-gradient(180deg, #89e219 0%, #58cc02 35%, #d7ffb8 35%, #efffe0 100%)',
  },
  wrong: {
    bg: 'linear-gradient(180deg, #ff4b4b 0%, #ea2b2b 30%, #ffdfe0 30%, #fff5f5 100%)',
  },
} as const

function FeedbackBurst({ kind }: { kind: 'correct' | 'wrong' }) {
  const color = kind === 'correct' ? '#58cc02' : '#ff4b4b'
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0.9, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 1.6,
            x: Math.cos((index / 8) * Math.PI * 2) * 90,
            y: Math.sin((index / 8) * Math.PI * 2) * 90,
          }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="pointer-events-none absolute left-1/2 top-1/3 h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </>
  )
}

export function TrainingPage() {
  const { user, loading: authLoading } = useAuth()
  const [structures, setStructures] = useState<SentenceStructure[]>([])
  const [masteryRows, setMasteryRows] = useState<StructureMasteryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [structureId, setStructureId] = useState<number | null>(null)
  const [questionKey, setQuestionKey] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const userId = user?.id ?? null

  const trainable = useMemo(() => getTrainableStructures(structures), [structures])
  const introducedCount = useMemo(
    () => countIntroduced(trainable, masteryRows),
    [trainable, masteryRows],
  )
  const progress = trainable.length > 0 ? introducedCount / trainable.length : 0

  const question =
    structureId == null ? null : buildTrainingQuestionForStructure(structures, structureId)

  const loadSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchAllSentenceStructures()
      const trainableRows = getTrainableStructures(rows)
      const mastery = await fetchStructureMastery(userId)
      const nextId = pickNextStructureId(trainableRows, mastery)
      setStructures(rows)
      setMasteryRows(mastery)
      setStructureId(nextId)
      setQuestionKey((current) => current + 1)
      setPicked(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load training data.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (authLoading) return
    const timeout = window.setTimeout(() => void loadSession(), 0)
    return () => window.clearTimeout(timeout)
  }, [authLoading, loadSession])

  const scheduleNext = useCallback(
    (rows: StructureMasteryRow[]) => {
      window.setTimeout(() => {
        const trainableRows = getTrainableStructures(structures)
        const nextId = pickNextStructureId(trainableRows, rows)
        setStructureId(nextId)
        setQuestionKey((current) => current + 1)
        setPicked(null)
      }, 1100)
    },
    [structures],
  )

  const handlePick = useCallback(
    async (answer: string) => {
      if (!question || picked) return
      setPicked(answer)

      const correct = answer === question.correctAnswer
      const existing = masteryRows.find((row) => row.structure_id === question.structureId)
      const updated = applyAnswerToMastery(question.structureId, existing, correct)

      try {
        const nextRows = await saveStructureMastery(userId, updated)
        setMasteryRows(nextRows)
        scheduleNext(nextRows)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to save progress.')
      }
    },
    [question, picked, masteryRows, userId, scheduleNext],
  )

  useEffect(() => {
    if (!question || picked) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '1') {
        event.preventDefault()
        void handlePick(question.choices[0])
      } else if (event.key === '2') {
        event.preventDefault()
        void handlePick(question.choices[1])
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, picked, handlePick])

  const feedback =
    picked && question ? (picked === question.correctAnswer ? 'correct' : 'wrong') : 'idle'

  return (
    <motion.div
      className="relative min-h-dvh overflow-hidden"
      animate={{ background: SCENES[feedback].bg }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <TrainingHeader
        progress={progress}
        introducedCount={introducedCount}
        total={trainable.length}
      />

      <main className="training-main">
        {!user && !authLoading ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl border-2 border-[#84d8ff] bg-[#ddf4ff] px-4 py-3 text-sm font-semibold text-[#1899d6] shadow-[0_4px_0_#1cb0f6]"
          >
            Progress saves on this device.{' '}
            <Link to="/login" className="underline decoration-2 underline-offset-2">
              Sign in
            </Link>{' '}
            to sync.
          </motion.div>
        ) : null}

        {loading || authLoading ? (
          <div className="space-y-5 pt-6">
            <div className="mx-auto h-40 max-w-md animate-pulse rounded-3xl bg-white/70" />
            <div className="mx-auto h-16 max-w-md animate-pulse rounded-2xl bg-white/70" />
            <div className="mx-auto h-16 max-w-md animate-pulse rounded-2xl bg-white/70" />
          </div>
        ) : error ? (
          <p className="rounded-2xl border-2 border-[#ff4b4b] bg-[#ffdfe0] px-4 py-3 text-sm font-bold text-[#8b0012] shadow-[0_4px_0_#ff4b4b]">
            {error}
          </p>
        ) : trainable.length < 2 ? (
          <p className="font-bold text-[#1899d6]">Need at least two structures to train.</p>
        ) : question ? (
          <div className="relative">
            <AnimatePresence>
              {feedback !== 'idle' ? <FeedbackBurst key={questionKey} kind={feedback} /> : null}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <TrainingQuestionCard
                key={questionKey}
                question={question}
                picked={picked}
                onPick={(answer) => void handlePick(answer)}
              />
            </AnimatePresence>
          </div>
        ) : null}
      </main>
    </motion.div>
  )
}
