import { getReflectLens, type Lens } from "@/data/reflectLenses"
import type { ReflectStep } from "@/store/reflect-sessions-model"

/**
 * URL layout for the Reflect identify flow. Every step is a real route so the
 * browser back button walks through the flow instead of leaving it:
 *
 *   /problems/identify/reflect                          pick a method
 *   /problems/identify/reflect/<lensId>/prompts/<n>     prompt n (1-based)
 *   /problems/identify/reflect/<lensId>/review          review and save
 */
export const REFLECT_ROOT = "/problems/identify/reflect"

export function reflectPickHref(): string {
  return REFLECT_ROOT
}

export function reflectPromptHref(lensId: string, promptIndex: number): string {
  return `${REFLECT_ROOT}/${lensId}/prompts/${promptIndex + 1}`
}

export function reflectReviewHref(lensId: string): string {
  return `${REFLECT_ROOT}/${lensId}/review`
}

export function reflectStepHref(step: ReflectStep, lensId: string, promptIndex = 0): string {
  if (step === "pick") return reflectPickHref()
  if (step === "review") return reflectReviewHref(lensId)
  return reflectPromptHref(lensId, promptIndex)
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

export function parseReflectPath(pathname: string): ReflectRoute {
  const rest = pathname.startsWith(REFLECT_ROOT)
    ? pathname.slice(REFLECT_ROOT.length).split("/").filter(Boolean)
    : []
  if (rest.length === 0) return { kind: "pick" }

  const [lensId, section, rawNumber] = rest
  const lens = getReflectLens(lensId)
  if (!lens) return { kind: "redirect", href: reflectPickHref() }

  if (section === "review") {
    if (rest.length === 2) return { kind: "review", lens }
    return { kind: "redirect", href: reflectReviewHref(lens.id) }
  }

  if (section === "prompts") {
    const hasNumber = rest.length === 3 && /^\d+$/.test(rawNumber)
    const index = hasNumber ? Number(rawNumber) - 1 : 0
    const safeIndex = clampPromptIndex(lens, index)
    if (hasNumber && safeIndex === index) {
      return { kind: "prompts", lens, promptIndex: safeIndex }
    }
    return { kind: "redirect", href: reflectPromptHref(lens.id, safeIndex) }
  }

  return { kind: "redirect", href: reflectPromptHref(lens.id, 0) }
}

/**
 * Where an interrupted session should pick up when the user re-enters the
 * flow at the root. Returns null when there is nothing to resume.
 */
export function reflectResumeHref(
  lensId: string | null,
  step: ReflectStep | null,
  promptIndex: number,
): string | null {
  const lens = lensId ? getReflectLens(lensId) : undefined
  if (!lens) return null
  if (step === "pick") return null
  if (step === "review") return reflectReviewHref(lens.id)
  return reflectPromptHref(lens.id, clampPromptIndex(lens, promptIndex))
}
