/** Spaced-repetition helpers (aligned with maumahara binary mastery). */

export const MASTERY_KNEW_DELTA = 0.18
export const MASTERY_DIDNT_PENALTY = 0.3

export function applyKnewMastery(mastery: number): number {
  return Math.min(1, Math.max(0, mastery + MASTERY_KNEW_DELTA))
}

export function applyDidntMastery(mastery: number): number {
  return Math.max(0, Math.min(1, mastery - MASTERY_DIDNT_PENALTY))
}

const MS_PER_MIN = 60_000
const MS_PER_DAY = 86_400_000

export function nextReviewAfterDidnt(from: Date): Date {
  return new Date(from.getTime() + 2 * MS_PER_MIN)
}

export function nextReviewAfterKnew(mastery: number, from: Date): Date {
  const days = 0.12 * 2 ** (mastery * 8)
  const capped = Math.min(30, days)
  return new Date(from.getTime() + capped * MS_PER_DAY)
}
