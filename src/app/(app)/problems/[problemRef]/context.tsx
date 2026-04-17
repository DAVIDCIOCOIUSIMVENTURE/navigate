"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { ExistingSolutionItem, ValidationStatus, ValidationMetric, ValidationAssessment } from "@/types/idea"
import { DEFAULT_VALIDATION_ASSESSMENT } from "@/types/idea"

type ProblemValidationContextValue = {
  problemRef: string
  problemId: number
  segmentSize: number | null
  setSegmentSize: (val: number | null) => void
  customerDescription: string
  setCustomerDescription: (val: string) => void
  existingSolutions: ExistingSolutionItem[]
  setExistingSolutions: (val: ExistingSolutionItem[]) => void
  contextWhen: string
  setContextWhen: (val: string) => void
  emotionalImpact: string[]
  setEmotionalImpact: (val: string[]) => void
  status: ValidationStatus
  setStatus: (val: ValidationStatus) => void
  reason: string
  setReason: (val: string) => void
  validationAssessment: ValidationAssessment
  setHowManyPeople: (patch: Partial<ValidationMetric>) => void
  setHowOften: (patch: Partial<ValidationMetric>) => void
  setWorthToThem: (patch: Partial<ValidationMetric>) => void
  setCostOfSwitching: (patch: Partial<ValidationMetric>) => void
  setSolutionEffectiveness: (patch: Partial<ValidationMetric>) => void
  setCompetitorSize: (patch: Partial<ValidationMetric>) => void
}

const ProblemValidationContext = createContext<ProblemValidationContextValue | null>(null)

export function ProblemValidationProvider({
  problemRef,
  children,
}: {
  problemRef: string
  children: ReactNode
}) {
  const problemId = Number(problemRef)
  const dispatch = useDispatch<AppDispatch>()
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  const segmentSize = problem?.segmentSize ?? null
  const customerDescription = problem?.customerDescription ?? ""
  const existingSolutions = problem?.existingSolutions ?? []
  const emotionalImpact = problem?.emotionalImpact ?? []
  const validationAssessment = problem?.validationAssessment ?? DEFAULT_VALIDATION_ASSESSMENT
  const contextWhen = problem?.contextWhen ?? ""
  const status = problem?.validationStatus ?? "unvalidated"
  const reason = problem?.validationReason ?? ""

  const setSegmentSize = useCallback(
    (val: number | null) => {
      dispatch.problems.update({ id: problemId, patch: { segmentSize: val } })
    },
    [dispatch, problemId]
  )

  const setCustomerDescription = useCallback(
    (val: string) => {
      dispatch.problems.update({ id: problemId, patch: { customerDescription: val } })
    },
    [dispatch, problemId]
  )

  const setExistingSolutions = useCallback(
    (val: ExistingSolutionItem[]) => {
      dispatch.problems.update({ id: problemId, patch: { existingSolutions: val } })
    },
    [dispatch, problemId]
  )

  const setEmotionalImpact = useCallback(
    (val: string[]) => {
      dispatch.problems.update({ id: problemId, patch: { emotionalImpact: val } })
    },
    [dispatch, problemId]
  )

  const setContextWhen = useCallback(
    (val: string) => {
      dispatch.problems.update({ id: problemId, patch: { contextWhen: val } })
    },
    [dispatch, problemId]
  )

  const setStatus = useCallback(
    (val: ValidationStatus) => {
      dispatch.problems.update({ id: problemId, patch: { validationStatus: val } })
    },
    [dispatch, problemId]
  )

  const setReason = useCallback(
    (val: string) => {
      dispatch.problems.update({ id: problemId, patch: { validationReason: val } })
    },
    [dispatch, problemId]
  )

  const setHowManyPeople = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            howManyPeople: { ...validationAssessment.howManyPeople, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setHowOften = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            howOften: { ...validationAssessment.howOften, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setWorthToThem = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            worthToThem: { ...validationAssessment.worthToThem, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setCostOfSwitching = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            costOfSwitching: { ...validationAssessment.costOfSwitching, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setSolutionEffectiveness = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            solutionEffectiveness: { ...validationAssessment.solutionEffectiveness, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setCompetitorSize = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            competitorSize: { ...validationAssessment.competitorSize, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  return (
    <ProblemValidationContext.Provider
      value={{
        problemRef,
        problemId,
        segmentSize, setSegmentSize,
        customerDescription, setCustomerDescription,
        existingSolutions, setExistingSolutions,
        contextWhen, setContextWhen,
        emotionalImpact, setEmotionalImpact,
        status, setStatus,
        reason, setReason,
        validationAssessment,
        setHowManyPeople,
        setHowOften,
        setWorthToThem,
        setCostOfSwitching,
        setSolutionEffectiveness,
        setCompetitorSize,
      }}
    >
      {children}
    </ProblemValidationContext.Provider>
  )
}

export function useProblemValidation() {
  const ctx = useContext(ProblemValidationContext)
  if (!ctx) throw new Error("useProblemValidation must be used within ProblemValidationProvider")
  return ctx
}

export const NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "Define your customer", path: "customer" },
  { label: "Explore existing solutions & shortcomings", path: "existing-solutions" },
  { label: "Validate your problem", path: "validate" },
  { label: "Summary & Next Steps", path: "summary" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, problemRef: string) {
  const base = `/problems/${problemRef}`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as (typeof STEP_PATHS)[number])
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
