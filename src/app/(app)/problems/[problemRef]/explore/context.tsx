"use client"

/**
 * "Explore the Problem" step list.
 *
 * The intermediate flow between identifying a problem and validating it: a
 * deeper dive that explores and defines the problem before any market sizing
 * happens. The active-problem state (ProblemProvider / useProblem) is shared
 * with the validation flow and lives in ../problem-context; this module
 * re-exports it and adds the explore-specific step list (NAV_ITEMS) and the
 * getAdjacentSteps helper used by the step pages and the layout.
 *
 * The work captured here (customer, refinement, existing solutions, jobs to
 * be done) feeds the validation steps via the shared Problem record.
 */

import { SHOW_REFINEMENT_STEPS } from "@/lib/feature-flags"

export { ProblemProvider, useProblem } from "../problem-context"

/** Steps that only appear while the refinement feature switch is on. */
const REFINEMENT_STEP_PATHS = ["choose-refinement", "refine"] as const

const ALL_NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "Define your customer", path: "customer" },
  { label: "Choose your refinement method", path: "choose-refinement" },
  { label: "Refine your problem", path: "refine" },
  { label: "Explore existing solutions & shortcomings", path: "existing-solutions" },
  { label: "Jobs your customer is trying to get done", path: "jobs-to-be-done" },
  { label: "Review", path: "review" },
] as const

export type ExploreStepPath = (typeof ALL_NAV_ITEMS)[number]["path"]

function isRefinementStep(path: string): boolean {
  return (REFINEMENT_STEP_PATHS as readonly string[]).includes(path)
}

/**
 * The steps shown in the stepper. The refinement pair is dropped when the
 * feature switch is off, so prev / next navigation skips straight from the
 * customer step to existing solutions.
 */
export const NAV_ITEMS: readonly (typeof ALL_NAV_ITEMS)[number][] = SHOW_REFINEMENT_STEPS
  ? ALL_NAV_ITEMS
  : ALL_NAV_ITEMS.filter((item) => !isRefinementStep(item.path))

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, problemRef: string) {
  const base = `/problems/${problemRef}/explore`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as ExploreStepPath)
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
