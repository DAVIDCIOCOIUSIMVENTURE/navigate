import type { ResearchCapture } from "@/types/research"

/**
 * The research captured while identifying a problem is kept beside the
 * problem under one localStorage key per problem, so the Research tool can
 * pre-fill from it when the problem is revisited.
 */
export function researchCaptureKey(problemId: number): string {
  return `navigate-problem-research-${problemId}`
}

export function loadResearchCapture(problemId: number): ResearchCapture | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(researchCaptureKey(problemId))
    return raw ? (JSON.parse(raw) as ResearchCapture) : null
  } catch {
    return null
  }
}

export function saveResearchCapture(problemId: number, capture: ResearchCapture) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(researchCaptureKey(problemId), JSON.stringify(capture))
  } catch {
    // ignore storage errors
  }
}

/** Called when the problem is deleted, so its research does not outlive it. */
export function clearResearchCapture(problemId: number) {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(researchCaptureKey(problemId))
  } catch {
    // ignore storage errors
  }
}
