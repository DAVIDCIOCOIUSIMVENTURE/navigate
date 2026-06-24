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

export { ProblemProvider, useProblem } from "../problem-context"

export const NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "Define your customer", path: "customer" },
  { label: "Choose your refinement method", path: "choose-refinement" },
  { label: "Refine your problem", path: "refine" },
  { label: "Explore existing solutions & shortcomings", path: "existing-solutions" },
  { label: "Jobs your customer is trying to get done", path: "jobs-to-be-done" },
  { label: "Summary", path: "summary" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, problemRef: string) {
  const base = `/problems/${problemRef}/explore`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as (typeof STEP_PATHS)[number])
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
