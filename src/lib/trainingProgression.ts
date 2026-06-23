/** Unlock + queue selection for sentence structure training. */

import {
  applyDidntMastery,
  applyKnewMastery,
  nextReviewAfterDidnt,
  nextReviewAfterKnew,
} from './srsMastery'
import type { SentenceStructure } from '../types/sentenceStructure'

export type StructureMasteryRow = {
  structure_id: number
  mastery: number
  next_review_at: string
}

/** Mastery needed on the previous structure before the next one unlocks. */
export const UNLOCK_THRESHOLD = 0.65

/** When both review and learning items exist, prefer due reviews this often. */
export const REVIEW_MIX = 0.75

export function masteryMapFromRows(rows: StructureMasteryRow[]): Map<number, StructureMasteryRow> {
  return new Map(rows.map((row) => [row.structure_id, row]))
}

/** Sequential unlock: structure N+1 opens once N reaches UNLOCK_THRESHOLD. */
export function getIntroducedStructures(
  trainable: SentenceStructure[],
  mastery: Map<number, StructureMasteryRow>,
): SentenceStructure[] {
  const introduced: SentenceStructure[] = []
  for (let index = 0; index < trainable.length; index += 1) {
    if (index === 0) {
      introduced.push(trainable[index]!)
      continue
    }
    const previous = trainable[index - 1]!
    const previousMastery = mastery.get(previous.id)?.mastery ?? 0
    if (previousMastery >= UNLOCK_THRESHOLD) {
      introduced.push(trainable[index]!)
    } else {
      break
    }
  }
  return introduced
}

function compareDueOrder(
  a: SentenceStructure,
  b: SentenceStructure,
  mastery: Map<number, StructureMasteryRow>,
): number {
  const nextA = mastery.get(a.id)?.next_review_at ?? '1970-01-01T00:00:00.000Z'
  const nextB = mastery.get(b.id)?.next_review_at ?? '1970-01-01T00:00:00.000Z'
  const diff = Date.parse(nextA) - Date.parse(nextB)
  if (diff !== 0) return diff
  return a.sort_order - b.sort_order || a.id - b.id
}

function isDue(structure: SentenceStructure, mastery: Map<number, StructureMasteryRow>, nowMs: number): boolean {
  const row = mastery.get(structure.id)
  if (!row) return true
  return Date.parse(row.next_review_at) <= nowMs
}

/** Pick the next structure id: due reviews first, then weak learning items, with review interleaving. */
export function pickNextStructureId(
  trainable: SentenceStructure[],
  masteryRows: StructureMasteryRow[],
  now: Date = new Date(),
): number | null {
  if (trainable.length === 0) return null

  const mastery = masteryMapFromRows(masteryRows)
  const introduced = getIntroducedStructures(trainable, mastery)
  if (introduced.length === 0) return trainable[0]?.id ?? null

  const nowMs = now.getTime()
  const due = introduced.filter((structure) => isDue(structure, mastery, nowMs))
  const learning = introduced.filter(
    (structure) => (mastery.get(structure.id)?.mastery ?? 0) < UNLOCK_THRESHOLD,
  )

  if (due.length > 0 && (learning.length === 0 || Math.random() < REVIEW_MIX)) {
    const sortedDue = [...due].sort((a, b) => compareDueOrder(a, b, mastery))
    return sortedDue[0]!.id
  }

  if (learning.length > 0) {
    const sortedLearning = [...learning].sort(
      (a, b) => (mastery.get(a.id)?.mastery ?? 0) - (mastery.get(b.id)?.mastery ?? 0),
    )
    return sortedLearning[0]!.id
  }

  const sortedIntroduced = [...introduced].sort((a, b) => compareDueOrder(a, b, mastery))
  return sortedIntroduced[0]!.id
}

export function countIntroduced(
  trainable: SentenceStructure[],
  masteryRows: StructureMasteryRow[],
): number {
  return getIntroducedStructures(trainable, masteryMapFromRows(masteryRows)).length
}

export function applyAnswerToMastery(
  structureId: number,
  row: StructureMasteryRow | undefined,
  correct: boolean,
  now: Date = new Date(),
): StructureMasteryRow {
  const previous = row?.mastery ?? 0
  const mastery = correct ? applyKnewMastery(previous) : applyDidntMastery(previous)
  const next_review_at = (
    correct ? nextReviewAfterKnew(mastery, now) : nextReviewAfterDidnt(now)
  ).toISOString()

  return { structure_id: structureId, mastery, next_review_at }
}
