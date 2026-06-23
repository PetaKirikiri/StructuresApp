import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAllSentenceStructures } from '../lib/sentenceStructures'
import { fetchStructureMastery } from '../lib/structureMastery'
import {
  getIntroducedStructures,
  masteryMapFromRows,
  UNLOCK_THRESHOLD,
  type StructureMasteryRow,
} from '../lib/trainingProgression'
import { getTrainableStructures } from '../lib/trainingQuiz'
import type { SentenceStructure } from '../types/sentenceStructure'

type ProfileSkillTreeProps = {
  userId: string | null
  active: boolean
}

type SkillNodeState = 'locked' | 'unlocked' | 'learning' | 'mastered'

const MASTERED_THRESHOLD = 0.9

function percent(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100)
}

function stateFor(mastery: number, unlocked: boolean): SkillNodeState {
  if (!unlocked) return 'locked'
  if (mastery >= MASTERED_THRESHOLD) return 'mastered'
  if (mastery > 0) return 'learning'
  return 'unlocked'
}

function nodeClass(state: SkillNodeState): string {
  if (state === 'mastered') return 'border-[#46a302] bg-[#58cc02] text-white shadow-[0_3px_0_#46a302]'
  if (state === 'learning') return 'border-[#1cb0f6] bg-[#ddf4ff] text-[#1899d6] shadow-[0_3px_0_#84d8ff]'
  if (state === 'unlocked') return 'border-brand-accent bg-white text-brand-accent shadow-[0_3px_0_#d8e2de]'
  return 'border-brand-border bg-[#f3f6f5] text-brand-muted'
}

function labelFor(state: SkillNodeState): string {
  if (state === 'mastered') return 'Mastered'
  if (state === 'learning') return 'Learning'
  if (state === 'unlocked') return 'Unlocked'
  return 'Locked'
}

export function ProfileSkillTree({ userId, active }: ProfileSkillTreeProps) {
  const [structures, setStructures] = useState<SentenceStructure[]>([])
  const [masteryRows, setMasteryRows] = useState<StructureMasteryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTree = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [allStructures, mastery] = await Promise.all([
        fetchAllSentenceStructures(),
        fetchStructureMastery(userId),
      ])
      setStructures(allStructures)
      setMasteryRows(mastery)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load progress.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!active) return
    const timeout = window.setTimeout(() => void loadTree(), 0)
    return () => window.clearTimeout(timeout)
  }, [active, loadTree])

  const tree = useMemo(() => {
    const trainable = getTrainableStructures(structures)
    const mastery = masteryMapFromRows(masteryRows)
    const unlockedIds = new Set(getIntroducedStructures(trainable, mastery).map((item) => item.id))
    const mastered = trainable.filter((item) => (mastery.get(item.id)?.mastery ?? 0) >= MASTERED_THRESHOLD)
    const learning = trainable.filter((item) => {
      const value = mastery.get(item.id)?.mastery ?? 0
      return value > 0 && value < MASTERED_THRESHOLD
    })

    return {
      trainable,
      mastery,
      unlockedIds,
      masteredCount: mastered.length,
      learningCount: learning.length,
      unlockedCount: unlockedIds.size,
    }
  }, [structures, masteryRows])

  const visibleNodes = tree.trainable.slice(0, 8)
  const hiddenCount = Math.max(0, tree.trainable.length - visibleNodes.length)
  const total = tree.trainable.length
  const masteredPct = total > 0 ? percent(tree.masteredCount / total) : 0
  const unlockedPct = total > 0 ? percent(tree.unlockedCount / total) : 0

  return (
    <section className="border-b border-brand-border px-3 py-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-brand-primary">Sentence skill tree</h2>
          <p className="mt-0.5 text-xs text-brand-muted">
            {tree.masteredCount} mastered · {tree.learningCount} learning
          </p>
        </div>
        <div className="rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-xs font-semibold text-brand-primary">
          {masteredPct}%
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg bg-brand-bg" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </p>
      ) : total === 0 ? (
        <p className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-xs text-brand-muted">
          No trainable sentence structures yet.
        </p>
      ) : (
        <>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-brand-bg">
            <div className="h-full rounded-full bg-brand-accent" style={{ width: `${unlockedPct}%` }} />
          </div>
          <ol className="space-y-2">
            {visibleNodes.map((structure, index) => {
              const row = tree.mastery.get(structure.id)
              const mastery = row?.mastery ?? 0
              const state = stateFor(mastery, tree.unlockedIds.has(structure.id))
              const label = structure.structure_label?.trim() || `Structure ${index + 1}`
              const isLast = index === visibleNodes.length - 1 && hiddenCount === 0

              return (
                <li key={structure.id} className="relative grid grid-cols-[2.5rem_1fr] gap-2">
                  {!isLast ? (
                    <span className="absolute left-5 top-9 h-[calc(100%-1rem)] w-px bg-brand-border" />
                  ) : null}
                  <span
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-extrabold ${nodeClass(
                      state,
                    )}`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 rounded-lg bg-brand-bg px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-brand-text">{label}</p>
                      <span className="shrink-0 text-[10px] font-bold uppercase text-brand-muted">
                        {labelFor(state)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#58cc02]"
                        style={{ width: `${state === 'locked' ? 0 : percent(Math.max(mastery, UNLOCK_THRESHOLD / 2))}%` }}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
          {hiddenCount > 0 ? (
            <p className="mt-2 text-center text-xs font-medium text-brand-muted">
              + {hiddenCount} more structures ahead
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}
