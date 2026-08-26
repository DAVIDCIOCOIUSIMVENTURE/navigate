import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"

export interface ProgressCount {
  completed: number
  total: number
}

/**
 * A self-discovery question counts as completed as soon as the user has captured
 * at least one item against it, whether typed in or picked from the suggestions.
 */
export function getAnsweredQuestionUrls(items: SelfDiscoveryItem[]): Set<string> {
  return new Set(items.map((item) => item.questionUrl))
}

export function isQuestionComplete(items: SelfDiscoveryItem[], questionUrl: string): boolean {
  return items.some((item) => item.questionUrl === questionUrl)
}

/** Completed / total questions for one category. Unknown category urls report zero. */
export function getCategoryProgress(items: SelfDiscoveryItem[], categoryUrl: string): ProgressCount {
  const category = SELF_DISCOVERY_CATEGORIES.find((c) => c.url === categoryUrl)
  if (!category) return { completed: 0, total: 0 }
  const answered = getAnsweredQuestionUrls(items)
  return {
    completed: category.questions.filter((q) => answered.has(q.url)).length,
    total: category.questions.length,
  }
}

/**
 * Completed / total questions across every category. The "Other" section is left
 * out: it holds free-form items rather than questions, so it has nothing to complete.
 */
export function getSelfDiscoveryProgress(items: SelfDiscoveryItem[]): ProgressCount {
  const answered = getAnsweredQuestionUrls(items)
  const questions = SELF_DISCOVERY_CATEGORIES.flatMap((c) => c.questions)
  return {
    completed: questions.filter((q) => answered.has(q.url)).length,
    total: questions.length,
  }
}
