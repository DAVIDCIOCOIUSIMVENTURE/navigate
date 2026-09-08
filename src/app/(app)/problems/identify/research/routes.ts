import { getResearchMethod, type ResearchMethod } from "@/data/researchMethods"
import type { ResearchStep } from "@/store/research-sessions-model"

/**
 * URL layout for the Research identify flow. Every step is a real route so the
 * browser back button walks through the flow instead of leaving it:
 *
 *   /problems/identify/research                            pick a method
 *   /problems/identify/research/<methodId>/tool            pick a tool
 *   /problems/identify/research/<methodId>/capture/<n>     capture prompt n (1-based)
 *   /problems/identify/research/<methodId>/review          review and save
 */
export const RESEARCH_ROOT = "/problems/identify/research"

export function researchPickHref(): string {
  return RESEARCH_ROOT
}

export function researchToolHref(methodId: string): string {
  return `${RESEARCH_ROOT}/${methodId}/tool`
}

export function researchCaptureHref(methodId: string, promptIndex: number): string {
  return `${RESEARCH_ROOT}/${methodId}/capture/${promptIndex + 1}`
}

export function researchReviewHref(methodId: string): string {
  return `${RESEARCH_ROOT}/${methodId}/review`
}

export function researchStepHref(step: ResearchStep, methodId: string, promptIndex = 0): string {
  if (step === "pick") return researchPickHref()
  if (step === "tool") return researchToolHref(methodId)
  if (step === "review") return researchReviewHref(methodId)
  return researchCaptureHref(methodId, promptIndex)
}

export type ResearchRoute =
  | { kind: "pick" }
  | { kind: "tool"; method: ResearchMethod }
  | { kind: "capture"; method: ResearchMethod; promptIndex: number }
  | { kind: "review"; method: ResearchMethod }
  /** A URL under the research root that is not canonical; replace it with `href`. */
  | { kind: "redirect"; href: string }

function clampPromptIndex(method: ResearchMethod, index: number): number {
  return Math.min(Math.max(index, 0), Math.max(method.prompts.length - 1, 0))
}

export function parseResearchPath(pathname: string): ResearchRoute {
  const rest = pathname.startsWith(RESEARCH_ROOT)
    ? pathname.slice(RESEARCH_ROOT.length).split("/").filter(Boolean)
    : []
  if (rest.length === 0) return { kind: "pick" }

  const [methodId, section, rawNumber] = rest
  const method = getResearchMethod(methodId)
  if (!method) return { kind: "redirect", href: researchPickHref() }

  if (section === "tool") {
    if (rest.length === 2) return { kind: "tool", method }
    return { kind: "redirect", href: researchToolHref(method.id) }
  }

  if (section === "review") {
    if (rest.length === 2) return { kind: "review", method }
    return { kind: "redirect", href: researchReviewHref(method.id) }
  }

  if (section === "capture") {
    const hasNumber = rest.length === 3 && /^\d+$/.test(rawNumber)
    const index = hasNumber ? Number(rawNumber) - 1 : 0
    const safeIndex = clampPromptIndex(method, index)
    if (hasNumber && safeIndex === index) {
      return { kind: "capture", method, promptIndex: safeIndex }
    }
    return { kind: "redirect", href: researchCaptureHref(method.id, safeIndex) }
  }

  return { kind: "redirect", href: researchToolHref(method.id) }
}

/**
 * Where an interrupted session should pick up when the user re-enters the
 * flow at the root. Returns null when there is nothing to resume.
 */
export function researchResumeHref(
  methodId: string | null,
  step: ResearchStep | null,
  promptIndex: number,
): string | null {
  const method = methodId ? getResearchMethod(methodId) : undefined
  if (!method) return null
  if (step === "pick") return null
  if (step === "review") return researchReviewHref(method.id)
  if (step === "capture") return researchCaptureHref(method.id, clampPromptIndex(method, promptIndex))
  return researchToolHref(method.id)
}
