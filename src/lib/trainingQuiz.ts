import type { MaoriVariant, SentenceStructure } from '../types/sentenceStructure'

export type TrainingQuestion = {
  structureId: number
  label: string
  maori: MaoriVariant
  correctAnswer: string
  choices: [string, string]
}

function maoriVariantFor(structure: SentenceStructure): MaoriVariant {
  if (structure.maori_variants.length > 0) {
    const index = Math.floor(Math.random() * structure.maori_variants.length)
    return structure.maori_variants[index]!
  }
  return { parts: [structure.sentence_text] }
}

function pickNearbyDistractor(
  structures: SentenceStructure[],
  index: number,
  correctAnswer: string,
): string | null {
  for (let step = 1; step < structures.length; step += 1) {
    for (const offset of [step, -step]) {
      const neighborIndex = index + offset
      if (neighborIndex < 0 || neighborIndex >= structures.length) continue
      const candidate = structures[neighborIndex]?.english_meaning?.trim()
      if (candidate && candidate !== correctAnswer) return candidate
    }
  }
  return null
}

function shufflePair(correct: string, wrong: string): [string, string] {
  return Math.random() < 0.5 ? [correct, wrong] : [wrong, correct]
}

export function getTrainableStructures(structures: SentenceStructure[]): SentenceStructure[] {
  return structures.filter(
    (structure) =>
      Boolean(structure.english_meaning?.trim()) &&
      (structure.maori_variants.length > 0 || structure.sentence_text.trim()),
  )
}

export function buildTrainingQuestionForStructure(
  structures: SentenceStructure[],
  structureId: number,
): TrainingQuestion | null {
  const trainable = getTrainableStructures(structures)
  const structure = trainable.find((row) => row.id === structureId)
  if (!structure) return null

  const correctAnswer = structure.english_meaning!.trim()
  const trainableIndex = trainable.findIndex((row) => row.id === structure.id)
  const wrongAnswer = pickNearbyDistractor(trainable, trainableIndex, correctAnswer)
  if (!wrongAnswer) return null

  return {
    structureId: structure.id,
    label: structure.structure_label?.trim() || 'Structure',
    maori: maoriVariantFor(structure),
    correctAnswer,
    choices: shufflePair(correctAnswer, wrongAnswer),
  }
}

export function buildTrainingQuestion(
  structures: SentenceStructure[],
  index: number,
): TrainingQuestion | null {
  const trainable = getTrainableStructures(structures)
  const structure = trainable[index]
  if (!structure) return null
  return buildTrainingQuestionForStructure(structures, structure.id)
}

export function nextTrainableIndex(current: number, total: number): number {
  if (total <= 0) return 0
  return (current + 1) % total
}
