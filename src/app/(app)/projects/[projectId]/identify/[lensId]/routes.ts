import { getIdentifyLens, type Lens } from "@/data/reflectLenses"
import type { ReflectStep } from "@/store/reflect-sessions-model"
import { projectRoutes } from "@/lib/projects"

/**
 * URL layout for a guided-prompt tool. Each lens is a tool in its own right on
 * the project's Identify a Problem hub, so it sits directly under the hub
 * beside the Canvas Builder and Research. Every step is a real route so the
 * browser back button walks through the flow instead of leaving it:
 *
 *   /projects/<id>/identify/<lensId>                  resumes, or the first prompt
 *   /projects/<id>/identify/<lensId>/prompts/<n>      prompt n (1-based)
 *   /projects/<id>/identify/<lensId>/review           review and save
 */
export function lensRoot(projectId: number, lensId: string): string {
  return projectRoutes.lens(projectId, lensId)
}

export function lensPromptHref(projectId: number, lensId: string, promptIndex: number): string {
  return `${lensRoot(projectId, lensId)}/prompts/${promptIndex + 1}`
}

export function lensReviewHref(projectId: number, lensId: string): string {
  return projectRoutes.lensReview(projectId, lensId)
}

export function lensStepHref(projectId: number, step: ReflectStep, lensId: string, promptIndex = 0): string {
  if (step === "review") return lensReviewHref(projectId, lensId)
  return lensPromptHref(projectId, lensId, promptIndex)
}

/** The href builders bound to one project and lens, for pages that navigate within the flow. */
export function lensHrefs(projectId: number, lensId: string) {
  return {
    root: () => lensRoot(projectId, lensId),
    prompt: (promptIndex: number) => lensPromptHref(projectId, lensId, promptIndex),
    review: () => lensReviewHref(projectId, lensId),
    step: (step: ReflectStep, promptIndex = 0) => lensStepHref(projectId, step, lensId, promptIndex),
  }
}

export type LensRoute =
  /** The bare tool URL. The layout sends it on to the resumed position or the first prompt. */
  | { kind: "root"; lens: Lens }
  | { kind: "prompts"; lens: Lens; promptIndex: number }
  | { kind: "review"; lens: Lens }
  /** A URL under the hub that is not canonical; replace it with `href`. */
  | { kind: "redirect"; href: string }

function clampPromptIndex(lens: Lens, index: number): number {
  return Math.min(Math.max(index, 0), Math.max(lens.prompts.length - 1, 0))
}

const LENS_PATH = /^\/projects\/(\d+)\/identify\/([^/]+)(?:\/|$)/

export function parseLensPath(pathname: string): LensRoute {
  const match = pathname.match(LENS_PATH)
  if (!match) return { kind: "redirect", href: projectRoutes.identify(null) }
  const projectId = Number(match[1])
  const lens = getIdentifyLens(match[2])
  // A tool the hub does not offer (or another tool's folder) belongs to the hub, not here.
  if (!lens) return { kind: "redirect", href: projectRoutes.identify(projectId) }

  const root = lensRoot(projectId, lens.id)
  const rest = pathname.slice(root.length).split("/").filter(Boolean)
  if (rest.length === 0) return { kind: "root", lens }

  const [section, rawNumber] = rest

  if (section === "review") {
    if (rest.length === 1) return { kind: "review", lens }
    return { kind: "redirect", href: lensReviewHref(projectId, lens.id) }
  }

  if (section === "prompts") {
    const hasNumber = rest.length === 2 && /^\d+$/.test(rawNumber)
    const index = hasNumber ? Number(rawNumber) - 1 : 0
    const safeIndex = clampPromptIndex(lens, index)
    if (hasNumber && safeIndex === index) {
      return { kind: "prompts", lens, promptIndex: safeIndex }
    }
    return { kind: "redirect", href: lensPromptHref(projectId, lens.id, safeIndex) }
  }

  return { kind: "redirect", href: lensPromptHref(projectId, lens.id, 0) }
}

/**
 * Where the bare tool URL should land: back where an interrupted run of this
 * same tool stopped, or its first prompt. The stored position belongs to the
 * project rather than to one lens, so a position left in another tool is
 * ignored here.
 */
export function lensResumeHref(
  projectId: number,
  lens: Lens,
  storedLensId: string | null,
  storedStep: ReflectStep | null,
  storedPromptIndex: number,
): string {
  if (storedLensId !== lens.id || storedStep === null) return lensPromptHref(projectId, lens.id, 0)
  if (storedStep === "review") return lensReviewHref(projectId, lens.id)
  return lensPromptHref(projectId, lens.id, clampPromptIndex(lens, storedPromptIndex))
}
