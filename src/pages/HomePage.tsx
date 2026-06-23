import { useEffect, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { SentenceStructureCard } from '../components/SentenceStructureCard'
import { fetchAllSentenceStructures } from '../lib/sentenceStructures'
import type { SentenceStructure } from '../types/sentenceStructure'

export function HomePage() {
  const [structures, setStructures] = useState<SentenceStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchAllSentenceStructures()
      .then((rows) => {
        if (!cancelled) setStructures(rows)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load sentence structures.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-dvh bg-brand-bg">
      <AppHeader
        title="Sentence Structures"
        subtitle={loading ? 'Loading…' : `${structures.length} patterns from Pūrākau`}
      />

      <main className="app-container app-page-main">
        {loading ? (
          <div className="structures-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="structure-card h-36 animate-pulse border border-brand-border bg-brand-surface"
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : structures.length === 0 ? (
          <p className="text-sm text-brand-muted">No sentence structures yet.</p>
        ) : (
          <ul className="structures-list">
            {structures.map((structure) => (
              <li key={structure.id}>
                <SentenceStructureCard structure={structure} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
