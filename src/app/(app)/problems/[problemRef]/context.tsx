"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { AlternativeItem, ImpactItem, ValidationStatus, ValidationMetric, ValidationAssessment } from "@/types/idea"
import { DEFAULT_VALIDATION_ASSESSMENT } from "@/types/idea"

type ProblemValidationContextValue = {
  problemRef: string
  problemId: number
  segmentSize: number | null
  setSegmentSize: (val: number | null) => void
  alternatives: AlternativeItem[]
  setAlternatives: (val: AlternativeItem[]) => void
  contextWhen: string
  setContextWhen: (val: string) => void
  emotionalImpact: string[]
  setEmotionalImpact: (val: string[]) => void
  quantifiableImpacts: ImpactItem[]
  setQuantifiableImpacts: (val: ImpactItem[]) => void
  status: ValidationStatus
  setStatus: (val: ValidationStatus) => void
  reason: string
  setReason: (val: string) => void
  validationAssessment: ValidationAssessment
  setTimeToSolve: (patch: Partial<ValidationMetric>) => void
  setCostToSolve: (patch: Partial<ValidationMetric>) => void
  setExpectedReturn: (patch: Partial<ValidationMetric>) => void
  setMarketSize: (patch: Partial<ValidationMetric>) => void
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
  const alternatives = problem?.alternatives ?? []
  const emotionalImpact = problem?.emotionalImpact ?? []
  const quantifiableImpacts = problem?.quantifiableImpacts ?? []
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

  const setAlternatives = useCallback(
    (val: AlternativeItem[]) => {
      dispatch.problems.update({ id: problemId, patch: { alternatives: val } })
    },
    [dispatch, problemId]
  )

  const setEmotionalImpact = useCallback(
    (val: string[]) => {
      dispatch.problems.update({ id: problemId, patch: { emotionalImpact: val } })
    },
    [dispatch, problemId]
  )

  const setQuantifiableImpacts = useCallback(
    (val: ImpactItem[]) => {
      dispatch.problems.update({ id: problemId, patch: { quantifiableImpacts: val } })
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

  const setTimeToSolve = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            timeToSolve: { ...validationAssessment.timeToSolve, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setCostToSolve = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            costToSolve: { ...validationAssessment.costToSolve, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setExpectedReturn = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            expectedReturn: { ...validationAssessment.expectedReturn, ...patch },
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setMarketSize = useCallback(
    (patch: Partial<ValidationMetric>) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            marketSize: { ...validationAssessment.marketSize, ...patch },
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
        alternatives, setAlternatives,
        contextWhen, setContextWhen,
        emotionalImpact, setEmotionalImpact,
        quantifiableImpacts, setQuantifiableImpacts,
        status, setStatus,
        reason, setReason,
        validationAssessment,
        setTimeToSolve,
        setCostToSolve,
        setExpectedReturn,
        setMarketSize,
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
  { label: "Customer Segment", path: "customer-segment" },
  { label: "Existing Solutions", path: "existing-solutions" },
  { label: "Quantifiable Impact", path: "quantifiable-impact" },
  { label: "Emotional Impact", path: "emotional-impact" },
  { label: "Validate", path: "validate" },
  { label: "Problem Statement", path: "problem-statement" },
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
