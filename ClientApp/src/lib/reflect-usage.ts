import type { Problem } from "@/store/problems-model"
import { getReflectLens, type LensId } from "@/data/reflectLenses"

/**
 * Count how many times each anchor title has been used by a given lens, based
 * on `Problem.reflection`. The anchor title is the user's answer to the lens's
 * `contextOnly` prompt (e.g. "Running a small bakery" for the Own Problems
 * lens). Returns a map keyed by lowercased anchor title.
 */
export function countAnchorUsage(
  problems: Problem[],
  lensId: LensId
): Map<string, number> {
  const counts = new Map<string, number>()
  const lens = getReflectLens(lensId)
  if (!lens) return counts
  const anchorPromptId = lens.prompts.find((p) => p.contextOnly)?.id
  if (!anchorPromptId) return counts

  for (const problem of problems) {
    const reflection = problem.reflection
    if (!reflection || reflection.lensId !== lensId) continue
    const anchorPrompt = reflection.prompts.find((p) => p.promptId === anchorPromptId)
    if (!anchorPrompt) continue
    for (const answer of anchorPrompt.answers) {
      const key = answer.trim().toLowerCase()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return counts
}
