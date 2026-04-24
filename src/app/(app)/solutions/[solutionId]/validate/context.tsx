"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Solution } from "@/types/solution"
import type { ValidationStatus } from "@/types/idea"
import type { Problem } from "@/store/problems-model"

type SolutionValidationContextValue = {
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
  validationNotes: string
  setValidationNotes: (val: string) => void
  validationStatus: ValidationStatus
  setValidationStatus: (val: ValidationStatus) => void
  validationReason: string
  setValidationReason: (val: string) => void
}

const SolutionValidationContext = createContext<SolutionValidationContextValue | null>(null)

export function SolutionValidationProvider({
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
  const validationNotes = solution?.validationNotes ?? ""
  const validationStatus = solution?.validationStatus ?? "unvalidated"
  const validationReason = solution?.validationReason ?? ""

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
  const setValidationNotes = useCallback((val: string) => patch("validationNotes", val), [patch])
  const setValidationStatus = useCallback((val: ValidationStatus) => patch("validationStatus", val), [patch])
  const setValidationReason = useCallback((val: string) => patch("validationReason", val), [patch])

  return (
    <SolutionValidationContext.Provider
      value={{
        solutionId, solution, problem,
        feasibility, setFeasibility,
        impact, setImpact,
        cost, setCost,
        timeToImplement, setTimeToImplement,
        validationNotes, setValidationNotes,
        validationStatus, setValidationStatus,
        validationReason, setValidationReason,
      }}
    >
      {children}
    </SolutionValidationContext.Provider>
  )
}

export function useSolutionValidation() {
  const ctx = useContext(SolutionValidationContext)
  if (!ctx) throw new Error("useSolutionValidation must be used within SolutionValidationProvider")
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
