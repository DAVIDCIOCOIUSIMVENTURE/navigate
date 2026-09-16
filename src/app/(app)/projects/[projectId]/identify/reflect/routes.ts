import { getReflectLens, type Lens } from "@/data/reflectLenses"
import type { ReflectStep } from "@/store/reflect-sessions-model"
import { projectRoutes } from "@/lib/projects"

/**
 * URL layout for the Reflect identify flow, which lives inside a project.
 * Every step is a real route so the browser back button walks through the
 * flow instead of leaving it:
 *
 *   /projects/<id>/identify/reflect                          pick a method
 *   /projects/<id>/identify/reflect/<lensId>/prompts/<n>     prompt n (1-based)
 *   /projects/<id>/identify/reflect/<lensId>/review          review and save
 */
export function reflectRoot(projectId: number): string {
  return projectRoutes.reflect(projectId)
}

export function reflectPickHref(projectId: number): string {
  return reflectRoot(projectId)
}

export function reflectPromptHref(projectId: number, lensId: string, promptIndex: number): string {
  return `${reflectRoot(projectId)}/${lensId}/prompts/${promptIndex + 1}`
}

export function reflectReviewHref(projectId: number, lensId: string): string {
  return `${reflectRoot(projectId)}/${lensId}/review`
}

export function reflectStepHref(projectId: number, step: ReflectStep, lensId: string, promptIndex = 0): string {
  if (step === "pick") return reflectPickHref(projectId)
  if (step === "review") return reflectReviewHref(projectId, lensId)
  return reflectPromptHref(projectId, lensId, promptIndex)
}

/** The href builders bound to one project, for pages that navigate within the flow. */
export function reflectHrefs(projectId: number) {
  return {
    pick: () => reflectPickHref(projectId),
    prompt: (lensId: string, promptIndex: number) => reflectPromptHref(projectId, lensId, promptIndex),
    review: (lensId: string) => reflectReviewHref(projectId, lensId),
    step: (step: ReflectStep, lensId: string, promptIndex = 0) => reflectStepHref(projectId, step, lensId, promptIndex),
  }
}

export type ReflectRoute =
  | { kind: "pick" }
  | { kind: "prompts"; lens: Lens; promptIndex: number }
  | { kind: "review"; lens: Lens }
  /** A URL under the reflect root that is not canonical; replace it with `href`. */
  | { kind: "redirect"; href: string }

function clampPromptIndex(lens: Lens, index: number): number {
  return Math.min(Math.max(index, 0), Math.max(lens.prompts.length - 1, 0))
}

const REFLECT_PATH = /^\/projects\/(\d+)\/identify\/reflect(?:\/|$)/

export function parseReflectPath(pathname: string): ReflectRoute {
  const match = pathname.match(REFLECT_PATH)
  if (!match) return { kind: "pick" }
  const projectId = Number(match[1])
  const root = reflectRoot(projectId)
  const rest = pathname.slice(root.length).split("/").filter(Boolean)
  if (rest.length === 0) return { kind: "pick" }

  const [lensId, section, rawNumber] = rest
  const lens = getReflectLens(lensId)
  if (!lens) return { kind: "redirect", href: reflectPickHref(projectId) }

  if (section === "review") {
    if (rest.length === 2) return { kind: "review", lens }
    return { kind: "redirect", href: reflectReviewHref(projectId, lens.id) }
  }

  if (section === "prompts") {
    const hasNumber = rest.length === 3 && /^\d+$/.test(rawNumber)
    const index = hasNumber ? Number(rawNumber) - 1 : 0
    const safeIndex = clampPromptIndex(lens, index)
    if (hasNumber && safeIndex === index) {
      return { kind: "prompts", lens, promptIndex: safeIndex }
    }
    return { kind: "redirect", href: reflectPromptHref(projectId, lens.id, safeIndex) }
  }

  return { kind: "redirect", href: reflectPromptHref(projectId, lens.id, 0) }
}

/**
 * Where an interrupted session should pick up when the user re-enters the
 * flow at the root. Returns null when there is nothing to resume.
 */
export function reflectResumeHref(
  projectId: number,
  lensId: string | null,
  step: ReflectStep | null,
  promptIndex: number,
): string | null {
  const lens = lensId ? getReflectLens(lensId) : undefined
  if (!lens) return null
  if (step === "pick") return null
  if (step === "review") return reflectReviewHref(projectId, lens.id)
  return reflectPromptHref(projectId, lens.id, clampPromptIndex(lens, promptIndex))
}
