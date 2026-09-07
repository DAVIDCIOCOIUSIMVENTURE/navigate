"use client"

/**
 * Problem validation step list.
 *
 * The active-problem state (ProblemProvider / useProblem) is shared with the
 * "Explore the Problem" flow and lives in ../problem-context. This module
 * re-exports it and adds the validation-specific step list (NAV_ITEMS) and
 * the getAdjacentSteps helper used by the step pages and the layout.
 *
 * The customer, refinement, existing-solutions, and jobs-to-be-done steps
 * moved to the Explore the Problem flow (../explore). The data they capture
 * still feeds the validation steps below via the shared Problem record.
 */

export { ProblemProvider, useProblem } from "../problem-context"

export const NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "What they would pay to solve it", path: "worth" },
  { label: "Size the market", path: "market" },
  { label: "Assess the competition", path: "competition" },
  { label: "Record your verdict", path: "verdict" },
  { label: "Review & Next Steps", path: "review" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, problemRef: string) {
  const base = `/problems/${problemRef}/validation`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as (typeof STEP_PATHS)[number])
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
