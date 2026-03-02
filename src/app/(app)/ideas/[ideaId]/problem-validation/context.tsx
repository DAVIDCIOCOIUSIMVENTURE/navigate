"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useIdeas } from "@/store/ideas-hooks"
import type { ImpactItem, ProblemValidation, ValidationStatus } from "@/types/idea"

export type { ImpactItem, ProblemValidation, ValidationStatus }

type ProblemValidationContextValue = {
  ideaId: number
  selectedProblemId: number | null
  setSelectedProblemId: (id: number | null) => void
  alternatives: string[]
  setAlternatives: (val: string[]) => void
  contextWhen: string
  setContextWhen: (val: string) => void
  shortcomings: string
  setShortcomings: (val: string) => void
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

const ProblemValidationContext = createContext<ProblemValidationContextValue | null>(null)

export function ProblemValidationProvider({
  ideaId,
  children,
}: {
  ideaId: number
  children: ReactNode
}) {
  const { getIdea, updateIdea } = useIdeas()

  const [selectedProblemId, setSelectedProblemIdRaw] = useState<number | null>(null)
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [contextWhen, setContextWhen] = useState("")
  const [shortcomings, setShortcomings] = useState("")
  const [emotionalImpact, setEmotionalImpact] = useState("")
  const [impacts, setImpacts] = useState<ImpactItem[]>([])
  const [status, setStatus] = useState<ValidationStatus>("unvalidated")
  const [reason, setReason] = useState("")

  const loadValidation = useCallback(
    (problemId: number) => {
      const idea = getIdea(ideaId)
      const existing = idea?.validations.find((v) => v.problemId === problemId)
      if (existing) {
        setAlternatives(existing.alternatives)
        setContextWhen(existing.contextWhen)
        setShortcomings(existing.shortcomings)
        setEmotionalImpact(existing.emotionalImpact)
        setImpacts(existing.impacts)
        setStatus(existing.status)
        setReason(existing.reason)
      } else {
        setAlternatives([])
        setContextWhen("")
        setShortcomings("")
        setEmotionalImpact("")
        setImpacts([])
        setStatus("unvalidated")
        setReason("")
      }
    },
    [ideaId, getIdea]
  )

  const saveCurrentValidation = useCallback(
    (problemId: number, statusOverride?: ValidationStatus) => {
      const idea = getIdea(ideaId)
      if (!idea) return
      const existing = idea.validations.find((v) => v.problemId === problemId)
      const updated: ProblemValidation = {
        id: existing?.id ?? Date.now(),
        problemId,
        alternatives,
        contextWhen,
        shortcomings,
        emotionalImpact,
        impacts,
        status: statusOverride ?? status,
        reason,
      }
      const next = existing
        ? idea.validations.map((v) => (v.problemId === problemId ? updated : v))
        : [...idea.validations, updated]
      updateIdea(ideaId, { validations: next, selectedProblemId: problemId })
    },
    [ideaId, getIdea, updateIdea, alternatives, contextWhen, shortcomings, emotionalImpact, impacts, status, reason]
  )

  const setSelectedProblemId = useCallback(
    (id: number | null) => {
      // Auto-save current before switching
      if (selectedProblemId !== null) {
        saveCurrentValidation(selectedProblemId)
      }
      setSelectedProblemIdRaw(id)
      if (id !== null) {
        loadValidation(id)
      }
    },
    [selectedProblemId, saveCurrentValidation, loadValidation]
  )

  const saveValidation = useCallback(
    (statusOverride?: ValidationStatus) => {
      if (selectedProblemId === null) return
      saveCurrentValidation(selectedProblemId, statusOverride)
      if (statusOverride) setStatus(statusOverride)
    },
    [selectedProblemId, saveCurrentValidation]
  )

  return (
    <ProblemValidationContext.Provider
      value={{
        ideaId,
        selectedProblemId, setSelectedProblemId,
        alternatives, setAlternatives,
        contextWhen, setContextWhen,
        shortcomings, setShortcomings,
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
  { label: "Pick a Problem", path: "pick-a-problem" },
  { label: "Alternatives", path: "alternatives" },
  { label: "Context", path: "context-step" },
  { label: "Alternatives Shortcomings", path: "shortcomings" },
  { label: "Emotional Impact", path: "emotional-impact" },
  { label: "Quantifiable Impact", path: "quantifiable-impact" },
  { label: "Verdict", path: "verdict" },
  { label: "Problem Statement", path: "problem-statement" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, ideaId: number) {
  const base = `/ideas/${ideaId}/problem-validation`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as (typeof STEP_PATHS)[number])
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
