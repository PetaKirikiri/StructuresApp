import { MaoriPartsBlock } from './MaoriPartsBlock'
import type { SentenceStructure } from '../types/sentenceStructure'

type SentenceStructureCardProps = {
  structure: SentenceStructure
}

export function SentenceStructureCard({ structure }: SentenceStructureCardProps) {
  const label = structure.structure_label?.trim() || 'Untitled structure'
  const meaning = structure.english_meaning?.trim()
  const variants =
    structure.maori_variants.length > 0
      ? structure.maori_variants
      : [{ parts: [structure.sentence_text] }]

  return (
    <article className="structure-card border border-brand-border bg-brand-surface shadow-sm">
      <div className="structure-card-grid">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-brand-primary">{label}</h2>
          {meaning ? (
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">{meaning}</p>
          ) : null}
        </div>
        <div className="structure-variants space-y-3">
          {variants.map((variant, index) => (
            <MaoriPartsBlock key={index} variant={variant} showDivider={index > 0} />
          ))}
        </div>
      </div>
    </article>
  )
}
