"use client"

/**
 * <SolutionProvider> + useSolution(): the active solution scope.
 *
 * The state itself lives in Redux. This context exists for one reason: it
 * carries the current `solutionId` (route param or dialog state) down the
 * tree and bundles the redux state + dispatch wrappers into a single typed
 * hook so:
 *
 *   - strategy components like <MetricStrategy /> stay zero-prop and don't
 *     have to know how the id was obtained (URL params on the step pages,
 *     useState on the dialog opened from a problem flow, etc.).
 *   - call sites get named setters (`setFeasibility(3)`) instead of
 *     spelling out `dispatch.solutions.update({ id, patch: { ... } })` at
 *     each one.
 *
 * No local state lives here - every read is a useSelector and every write
 * is a dispatch. Two providers wrapping the same solutionId would stay
 * perfectly in sync because Redux is the single source of truth.
 *
 * Mirror: src/app/(app)/problems/[problemRef]/validation/context.tsx.
 */

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Solution } from "@/types/solution"
import type { ValidationStatus } from "@/types/validation"
import type { Problem } from "@/store/problems-model"

type SolutionContextValue = {
  solutionId: number
  solution: Solution | undefined
  problem: Problem | undefined
  feasibility: number | null
  setFeasibility: (val: number | null) => void
  impact: number | null
  setImpact: (val: number | null) => void
  cost: number | null
  setCost: (val: number | null) => void
  timeToImplement: number | null
  setTimeToImplement: (val: number | null) => void
  validationStatus: ValidationStatus
  setValidationStatus: (val: ValidationStatus) => void
}

const SolutionContext = createContext<SolutionContextValue | null>(null)

export function SolutionProvider({
  solutionId,
  children,
}: {
  solutionId: number
  children: ReactNode
}) {
  const dispatch = useDispatch<AppDispatch>()
  const solution = useSelector((state: RootState) =>
    state.solutions.solutions.find((s) => s.id === solutionId)
  )
  const problem = useSelector((state: RootState) =>
    solution ? state.problems.problems.find((p) => p.id === solution.problemId) : undefined
  )

  const feasibility = solution?.feasibility ?? null
  const impact = solution?.impact ?? null
  const cost = solution?.cost ?? null
  const timeToImplement = solution?.timeToImplement ?? null
  const validationStatus = solution?.validationStatus ?? "unvalidated"

  const patch = useCallback(
    <K extends keyof Solution>(key: K, value: Solution[K]) => {
      dispatch.solutions.update({ id: solutionId, patch: { [key]: value } })
    },
    [solutionId, dispatch]
  )

  const setFeasibility = useCallback((val: number | null) => patch("feasibility", val), [patch])
  const setImpact = useCallback((val: number | null) => patch("impact", val), [patch])
  const setCost = useCallback((val: number | null) => patch("cost", val), [patch])
  const setTimeToImplement = useCallback((val: number | null) => patch("timeToImplement", val), [patch])
  const setValidationStatus = useCallback((val: ValidationStatus) => patch("validationStatus", val), [patch])

  return (
    <SolutionContext.Provider
      value={{
        solutionId, solution, problem,
        feasibility, setFeasibility,
        impact, setImpact,
        cost, setCost,
        timeToImplement, setTimeToImplement,
        validationStatus, setValidationStatus,
      }}
    >
      {children}
    </SolutionContext.Provider>
  )
}

export function useSolution() {
  const ctx = useContext(SolutionContext)
  if (!ctx) throw new Error("useSolution must be used within SolutionProvider")
  return ctx
}

export type NavItem = { label: string; path: string; section: string | null }

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Introduction", path: "introduction", section: null },
  { label: "Feasibility", path: "feasibility", section: "Metrics" },
  { label: "Impact", path: "impact", section: null },
  { label: "Cost", path: "cost", section: null },
  { label: "Time to Implement", path: "time-to-implement", section: null },
  { label: "Verdict", path: "verdict", section: "Decide" },
  { label: "Summary", path: "summary", section: null },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, solutionId: number) {
  const base = `/solutions/${solutionId}/validate`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment)
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx >= 0 && idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
