import { getResearchMethod, type ResearchMethod } from "@/data/researchMethods"
import type { ResearchStep } from "@/store/research-sessions-model"
import { projectRoutes } from "@/lib/projects"

/**
 * URL layout for the Research identify flow, which lives inside a project.
 * Every step is a real route so the browser back button walks through the
 * flow instead of leaving it:
 *
 *   /projects/<id>/identify/research                            pick a method
 *   /projects/<id>/identify/research/<methodId>/tool            pick a tool
 *   /projects/<id>/identify/research/<methodId>/capture/<n>     capture prompt n (1-based)
 *   /projects/<id>/identify/research/<methodId>/review          review and save
 */
export function researchRoot(projectId: number): string {
  return projectRoutes.research(projectId)
}

export function researchPickHref(projectId: number): string {
  return researchRoot(projectId)
}

export function researchToolHref(projectId: number, methodId: string): string {
  return `${researchRoot(projectId)}/${methodId}/tool`
}

export function researchCaptureHref(projectId: number, methodId: string, promptIndex: number): string {
  return `${researchRoot(projectId)}/${methodId}/capture/${promptIndex + 1}`
}

export function researchReviewHref(projectId: number, methodId: string): string {
  return `${researchRoot(projectId)}/${methodId}/review`
}

export function researchStepHref(projectId: number, step: ResearchStep, methodId: string, promptIndex = 0): string {
  if (step === "pick") return researchPickHref(projectId)
  if (step === "tool") return researchToolHref(projectId, methodId)
  if (step === "review") return researchReviewHref(projectId, methodId)
  return researchCaptureHref(projectId, methodId, promptIndex)
}

/** The href builders bound to one project, for pages that navigate within the flow. */
export function researchHrefs(projectId: number) {
  return {
    pick: () => researchPickHref(projectId),
    tool: (methodId: string) => researchToolHref(projectId, methodId),
    capture: (methodId: string, promptIndex: number) => researchCaptureHref(projectId, methodId, promptIndex),
    review: (methodId: string) => researchReviewHref(projectId, methodId),
    step: (step: ResearchStep, methodId: string, promptIndex = 0) => researchStepHref(projectId, step, methodId, promptIndex),
  }
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

const RESEARCH_PATH = /^\/projects\/(\d+)\/identify\/research(?:\/|$)/

export function parseResearchPath(pathname: string): ResearchRoute {
  const match = pathname.match(RESEARCH_PATH)
  if (!match) return { kind: "pick" }
  const projectId = Number(match[1])
  const root = researchRoot(projectId)
  const rest = pathname.slice(root.length).split("/").filter(Boolean)
  if (rest.length === 0) return { kind: "pick" }

  const [methodId, section, rawNumber] = rest
  const method = getResearchMethod(methodId)
  if (!method) return { kind: "redirect", href: researchPickHref(projectId) }

  if (section === "tool") {
    if (rest.length === 2) return { kind: "tool", method }
    return { kind: "redirect", href: researchToolHref(projectId, method.id) }
  }

  if (section === "review") {
    if (rest.length === 2) return { kind: "review", method }
    return { kind: "redirect", href: researchReviewHref(projectId, method.id) }
  }

  if (section === "capture") {
    const hasNumber = rest.length === 3 && /^\d+$/.test(rawNumber)
    const index = hasNumber ? Number(rawNumber) - 1 : 0
    const safeIndex = clampPromptIndex(method, index)
    if (hasNumber && safeIndex === index) {
      return { kind: "capture", method, promptIndex: safeIndex }
    }
    return { kind: "redirect", href: researchCaptureHref(projectId, method.id, safeIndex) }
  }

  return { kind: "redirect", href: researchToolHref(projectId, method.id) }
}

/**
 * Where an interrupted session should pick up when the user re-enters the
 * flow at the root. Returns null when there is nothing to resume.
 */
export function researchResumeHref(
  projectId: number,
  methodId: string | null,
  step: ResearchStep | null,
  promptIndex: number,
): string | null {
  const method = methodId ? getResearchMethod(methodId) : undefined
  if (!method) return null
  if (step === "pick") return null
  if (step === "review") return researchReviewHref(projectId, method.id)
  if (step === "capture") return researchCaptureHref(projectId, method.id, clampPromptIndex(method, promptIndex))
  return researchToolHref(projectId, method.id)
}
