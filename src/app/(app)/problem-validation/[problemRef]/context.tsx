"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { AlternativeItem, ImpactItem, ValidationStatus, DecisionLevel } from "@/types/idea"

export type ValidationRecord = {
  contextWhen: string
  status: ValidationStatus
  reason: string
  timeLevel: DecisionLevel
  costLevel: DecisionLevel
  returnLevel: DecisionLevel
}

type ProblemValidationContextValue = {
  problemRef: string
  problemId: number
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
  timeLevel: DecisionLevel
  setTimeLevel: (val: DecisionLevel) => void
  costLevel: DecisionLevel
  setCostLevel: (val: DecisionLevel) => void
  returnLevel: DecisionLevel
  setReturnLevel: (val: DecisionLevel) => void
  saveValidation: (statusOverride?: ValidationStatus) => void
}

const STORAGE_KEY = "navigate-standalone-validation"

function loadRecord(problemRef: string): ValidationRecord {
  if (typeof window === "undefined") return EMPTY_RECORD
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_RECORD
    const all = JSON.parse(raw) as Record<string, ValidationRecord>
    return all[problemRef] ?? EMPTY_RECORD
  } catch {
    return EMPTY_RECORD
  }
}

function saveRecord(problemRef: string, record: ValidationRecord) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all: Record<string, ValidationRecord> = raw ? JSON.parse(raw) : {}
    all[problemRef] = record
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

const EMPTY_RECORD: ValidationRecord = {
  contextWhen: "",
  status: "unvalidated",
  reason: "",
  timeLevel: "",
  costLevel: "",
  returnLevel: "",
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
  const problems = useSelector((state: RootState) => state.problems.problems)
  const problem = problems.find((p) => p.id === problemId)
  const alternatives = problem?.alternatives ?? []
  const emotionalImpact = problem?.emotionalImpact ?? []
  const quantifiableImpacts = problem?.quantifiableImpacts ?? []

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

  const [contextWhen, setContextWhen] = useState("")
  const [status, setStatus] = useState<ValidationStatus>("unvalidated")
  const [reason, setReason] = useState("")
  const [timeLevel, setTimeLevel] = useState<DecisionLevel>("")
  const [costLevel, setCostLevel] = useState<DecisionLevel>("")
  const [returnLevel, setReturnLevel] = useState<DecisionLevel>("")

  useEffect(() => {
    const record = loadRecord(problemRef)
    setContextWhen(record.contextWhen)
    setStatus(record.status)
    setReason(record.reason)
    setTimeLevel(record.timeLevel ?? "")
    setCostLevel(record.costLevel ?? "")
    setReturnLevel(record.returnLevel ?? "")
  }, [problemRef])

  const saveValidation = useCallback(
    (statusOverride?: ValidationStatus) => {
      const effectiveStatus = statusOverride ?? status
      saveRecord(problemRef, {
        contextWhen,
        status: effectiveStatus,
        reason,
        timeLevel,
        costLevel,
        returnLevel,
      })
      if (statusOverride) setStatus(statusOverride)
    },
    [problemRef, contextWhen, status, reason, timeLevel, costLevel, returnLevel]
  )

  return (
    <ProblemValidationContext.Provider
      value={{
        problemRef,
        problemId,
        alternatives, setAlternatives,
        contextWhen, setContextWhen,
        emotionalImpact, setEmotionalImpact,
        quantifiableImpacts, setQuantifiableImpacts,
        status, setStatus,
        reason, setReason,
        timeLevel, setTimeLevel,
        costLevel, setCostLevel,
        returnLevel, setReturnLevel,
        saveValidation,
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
  { label: "Alternatives & Shortcomings", path: "alternatives" },
  { label: "Quantifiable Impact", path: "quantifiable-impact" },
  { label: "Emotional Impact", path: "emotional-impact" },
  { label: "Validate", path: "validate" },
  { label: "Problem Statement", path: "problem-statement" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, problemRef: string) {
  const base = `/problem-validation/${problemRef}`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as (typeof STEP_PATHS)[number])
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
