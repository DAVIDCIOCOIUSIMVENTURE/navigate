"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { AlternativeItem, ImpactItem, ValidationStatus } from "@/types/idea"

export type ValidationRecord = {
  alternatives: AlternativeItem[]
  contextWhen: string
  emotionalImpact: string
  impacts: ImpactItem[]
  status: ValidationStatus
  reason: string
}

type ProblemValidationContextValue = {
  problemRef: string
  problemId: number
  alternatives: AlternativeItem[]
  setAlternatives: (val: AlternativeItem[]) => void
  contextWhen: string
  setContextWhen: (val: string) => void
  emotionalImpact: string
  setEmotionalImpact: (val: string) => void
  impacts: ImpactItem[]
  setImpacts: (val: ImpactItem[]) => void
  status: ValidationStatus
  setStatus: (val: ValidationStatus) => void
  reason: string
  setReason: (val: string) => void
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
  alternatives: [],
  contextWhen: "",
  emotionalImpact: "",
  impacts: [],
  status: "unvalidated",
  reason: "",
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

  const [alternatives, setAlternatives] = useState<AlternativeItem[]>([])
  const [contextWhen, setContextWhen] = useState("")
  const [emotionalImpact, setEmotionalImpact] = useState("")
  const [impacts, setImpacts] = useState<ImpactItem[]>([])
  const [status, setStatus] = useState<ValidationStatus>("unvalidated")
  const [reason, setReason] = useState("")

  useEffect(() => {
    const record = loadRecord(problemRef)
    setAlternatives(record.alternatives)
    setContextWhen(record.contextWhen)
    setEmotionalImpact(record.emotionalImpact)
    setImpacts(record.impacts)
    setStatus(record.status)
    setReason(record.reason)
  }, [problemRef])

  const saveValidation = useCallback(
    (statusOverride?: ValidationStatus) => {
      const effectiveStatus = statusOverride ?? status
      saveRecord(problemRef, {
        alternatives,
        contextWhen,
        emotionalImpact,
        impacts,
        status: effectiveStatus,
        reason,
      })
      if (statusOverride) setStatus(statusOverride)
    },
    [problemRef, alternatives, contextWhen, emotionalImpact, impacts, status, reason]
  )

  return (
    <ProblemValidationContext.Provider
      value={{
        problemRef,
        problemId,
        alternatives, setAlternatives,
        contextWhen, setContextWhen,
        emotionalImpact, setEmotionalImpact,
        impacts, setImpacts,
        status, setStatus,
        reason, setReason,
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
  { label: "Alternatives", path: "alternatives" },
  { label: "Alternatives Shortcomings", path: "shortcomings" },
  { label: "Emotional Impact", path: "emotional-impact" },
  { label: "Quantifiable Impact", path: "quantifiable-impact" },
  { label: "Verdict", path: "verdict" },
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
