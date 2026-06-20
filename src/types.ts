export type Question = {
  category: string
  prompt: string
  options: [string, string, string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3 | 4 | 5
}

export type Explanation = {
  title: string
  explanation: string
  examples: string[]
}

export type ExplanationsMap = Record<string, Explanation>

export function isQuestion(x: unknown): x is Question {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.category !== 'string') return false
  if (typeof o.prompt !== 'string') return false
  if (!Array.isArray(o.options) || o.options.length !== 6) return false
  if (!o.options.every((s) => typeof s === 'string')) return false
  const ci = o.correctIndex
  if (ci !== 0 && ci !== 1 && ci !== 2 && ci !== 3 && ci !== 4 && ci !== 5) return false
  return true
}
