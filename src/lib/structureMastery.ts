import { supabase } from './supabaseClient'
import type { StructureMasteryRow } from './trainingProgression'

const LOCAL_KEY = 'te-reo-structure-mastery'

function readLocalMastery(): StructureMasteryRow[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StructureMasteryRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalMastery(rows: StructureMasteryRow[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(rows))
}

export async function fetchStructureMastery(userId: string | null): Promise<StructureMasteryRow[]> {
  if (!userId) return readLocalMastery()

  const { data, error } = await supabase
    .from('te_reo_structure_mastery')
    .select('structure_id, mastery, next_review_at')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    structure_id: Number(row.structure_id),
    mastery: Number(row.mastery),
    next_review_at: String(row.next_review_at),
  }))
}

export async function saveStructureMastery(
  userId: string | null,
  row: StructureMasteryRow,
): Promise<StructureMasteryRow[]> {
  if (!userId) {
    const existing = readLocalMastery()
    const next = existing.filter((item) => item.structure_id !== row.structure_id).concat(row)
    writeLocalMastery(next)
    return next
  }

  const now = new Date().toISOString()
  const { error } = await supabase.from('te_reo_structure_mastery').upsert(
    {
      user_id: userId,
      structure_id: row.structure_id,
      mastery: row.mastery,
      next_review_at: row.next_review_at,
      updated_at: now,
    },
    { onConflict: 'user_id,structure_id' },
  )

  if (error) throw new Error(error.message)
  return fetchStructureMastery(userId)
}
