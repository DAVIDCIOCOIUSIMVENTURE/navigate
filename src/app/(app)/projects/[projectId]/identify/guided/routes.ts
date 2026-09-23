import type { ReflectStep } from "@/store/reflect-sessions-model"
import { projectRoutes } from "@/lib/projects"

/**
 * URL layout for Guided discovery. Like the guided prompt tools it sits
 * directly under the project's hub, and every step is a real route so the
 * browser back button walks through the flow instead of leaving it:
 *
 *   /projects/<id>/identify/guided                 resumes, or the first question
 *   /projects/<id>/identify/guided/questions/<n>   question n (1-based) on the run's path
 *   /projects/<id>/identify/guided/review          review and save
 *
 * How many questions there are depends on the answers, so the parser only
 * checks the shape of the number; the layout clamps it against the path.
 */
export function guidedRoot(projectId: number): string {
  return projectRoutes.guided(projectId)
}

export function guidedQuestionHref(projectId: number, questionIndex: number): string {
  return `${guidedRoot(projectId)}/questions/${questionIndex + 1}`
}

export function guidedReviewHref(projectId: number): string {
  return projectRoutes.guidedReview(projectId)
}

export function guidedStepHref(projectId: number, step: ReflectStep, questionIndex = 0): string {
  if (step === "review") return guidedReviewHref(projectId)
  return guidedQuestionHref(projectId, questionIndex)
}

/** The href builders bound to one project, for pages that navigate within the flow. */
export function guidedHrefs(projectId: number) {
  return {
    root: () => guidedRoot(projectId),
    question: (questionIndex: number) => guidedQuestionHref(projectId, questionIndex),
    review: () => guidedReviewHref(projectId),
    step: (step: ReflectStep, questionIndex = 0) => guidedStepHref(projectId, step, questionIndex),
  }
}

export type GuidedRoute =
  /** The bare tool URL. The layout sends it on to the resumed position or the first question. */
  | { kind: "root"; projectId: number }
  | { kind: "questions"; projectId: number; questionIndex: number }
  | { kind: "review"; projectId: number }
  /** A URL under the tool that is not canonical; replace it with `href`. */
  | { kind: "redirect"; href: string }

const GUIDED_PATH = /^\/projects\/(\d+)\/identify\/guided(?:\/|$)/

export function parseGuidedPath(pathname: string): GuidedRoute {
  const match = pathname.match(GUIDED_PATH)
  if (!match) return { kind: "redirect", href: projectRoutes.identify(null) }
  const projectId = Number(match[1])

  const root = guidedRoot(projectId)
  const rest = pathname.slice(root.length).split("/").filter(Boolean)
  if (rest.length === 0) return { kind: "root", projectId }

  const [section, rawNumber] = rest

  if (section === "review") {
    if (rest.length === 1) return { kind: "review", projectId }
    return { kind: "redirect", href: guidedReviewHref(projectId) }
  }

  if (section === "questions") {
    if (rest.length === 2 && /^\d+$/.test(rawNumber) && Number(rawNumber) >= 1) {
      return { kind: "questions", projectId, questionIndex: Number(rawNumber) - 1 }
    }
    return { kind: "redirect", href: guidedQuestionHref(projectId, 0) }
  }

  return { kind: "redirect", href: guidedQuestionHref(projectId, 0) }
}

/**
 * Where the bare tool URL should land: back where an interrupted run stopped,
 * or the first question. The stored position belongs to the project and may
 * name a lens instead, in which case it is ignored here.
 */
export function guidedResumeHref(
  projectId: number,
  storedToolId: string | null,
  toolId: string,
  storedStep: ReflectStep | null,
  storedQuestionIndex: number,
  pathLength: number,
): string {
  if (storedToolId !== toolId || storedStep === null) return guidedQuestionHref(projectId, 0)
  if (storedStep === "review") return guidedReviewHref(projectId)
  return guidedQuestionHref(projectId, clampQuestionIndex(storedQuestionIndex, pathLength))
}

/** The nearest question that exists on a path of `pathLength` questions. */
export function clampQuestionIndex(index: number, pathLength: number): number {
  return Math.min(Math.max(index, 0), Math.max(pathLength - 1, 0))
}
