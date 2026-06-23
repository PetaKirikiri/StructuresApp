export type MaoriVariant = { parts: string[] }

export type SentenceStructure = {
  id: number
  structure_label: string | null
  english_meaning: string | null
  maori_variants: MaoriVariant[]
  sort_order: number
  sentence_text: string
}
