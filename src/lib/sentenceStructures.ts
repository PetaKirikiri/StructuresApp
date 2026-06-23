import { z } from 'zod'
import { missingSupabaseConfigMessage, supabase } from './supabaseClient'
import type { MaoriVariant, SentenceStructure } from '../types/sentenceStructure'

const maoriVariantSchema = z.object({
  parts: z.array(z.string()),
})

const rowSchema = z.object({
  id: z.number(),
  structure_label: z.string().nullable(),
  english_meaning: z.string().nullable(),
  maori_variants: z.array(maoriVariantSchema).nullable(),
  sort_order: z.number(),
  sentence_text: z.string(),
})

function parseMaoriVariants(raw: unknown): MaoriVariant[] {
  const parsed = z.array(maoriVariantSchema).safeParse(raw)
  return parsed.success ? parsed.data : []
}

export async function fetchAllSentenceStructures(): Promise<SentenceStructure[]> {
  if (!supabase) throw new Error(missingSupabaseConfigMessage)

  const { data, error } = await supabase
    .from('course_sentence_structures')
    .select('id, structure_label, english_meaning, maori_variants, sort_order, sentence_text')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const parsed = rowSchema.parse(row)
    return {
      id: parsed.id,
      structure_label: parsed.structure_label,
      english_meaning: parsed.english_meaning,
      maori_variants: parseMaoriVariants(parsed.maori_variants),
      sort_order: parsed.sort_order,
      sentence_text: parsed.sentence_text,
    }
  })
}
