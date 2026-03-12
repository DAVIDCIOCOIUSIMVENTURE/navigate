"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { useIdeas } from "@/store/ideas-hooks"
import type { AlternativeItem, ImpactItem, ValidationStatus, DecisionLevel } from "@/types/idea"

export type { AlternativeItem, ImpactItem, ValidationStatus, DecisionLevel }

type ProblemValidationContextValue = {
  ideaId: number
  selectedProblemId: number | null
  setSelectedProblemId: (id: number | null) => void
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
  timeLevel: DecisionLevel
  setTimeLevel: (val: DecisionLevel) => void
  costLevel: DecisionLevel
  setCostLevel: (val: DecisionLevel) => void
  returnLevel: DecisionLevel
  setReturnLevel: (val: DecisionLevel) => void
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
  const [alternatives, setAlternatives] = useState<AlternativeItem[]>([])
  const [contextWhen, setContextWhen] = useState("")
  const [emotionalImpact, setEmotionalImpact] = useState("")
  const [impacts, setImpacts] = useState<ImpactItem[]>([])
  const [status, setStatus] = useState<ValidationStatus>("unvalidated")
  const [reason, setReason] = useState("")
  const [timeLevel, setTimeLevel] = useState<DecisionLevel>("")
  const [costLevel, setCostLevel] = useState<DecisionLevel>("")
  const [returnLevel, setReturnLevel] = useState<DecisionLevel>("")

  // Used to skip auto-save on the render immediately after loading a problem's data
  const justLoaded = useRef(false)
  // Keep stable refs to the latest save function and selected problem id for the auto-save effect
  const saveCurrentValidationRef = useRef<((id: number, statusOverride?: ValidationStatus) => void) | null>(null)
  const selectedProblemIdRef = useRef<number | null>(null)
  selectedProblemIdRef.current = selectedProblemId

  const loadValidation = useCallback(
    (problemId: number) => {
      justLoaded.current = true
      const idea = getIdea(ideaId)
      const problem = idea?.jobs.flatMap((j) => j.problems).find((p) => p.id === problemId)
      if (problem) {
        setAlternatives(problem.alternatives)
        setContextWhen(problem.contextWhen)
        setEmotionalImpact(problem.emotionalImpact)
        setImpacts(problem.impacts)
        setStatus(problem.validationStatus)
        setReason(problem.reason)
        setTimeLevel(problem.timeLevel ?? "")
        setCostLevel(problem.costLevel ?? "")
        setReturnLevel(problem.returnLevel ?? "")
      } else {
        setAlternatives([])
        setContextWhen("")
        setEmotionalImpact("")
        setImpacts([])
        setStatus("unvalidated")
        setReason("")
        setTimeLevel("")
        setCostLevel("")
        setReturnLevel("")
      }
    },
    [ideaId, getIdea]
  )

  useEffect(() => {
    const idea = getIdea(ideaId)
    if (idea?.selectedProblemId != null) {
      setSelectedProblemIdRaw(idea.selectedProblemId)
      loadValidation(idea.selectedProblemId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId])

  const saveCurrentValidation = useCallback(
    (problemId: number, statusOverride?: ValidationStatus) => {
      const idea = getIdea(ideaId)
      if (!idea) return
      const updatedJobs = idea.jobs.map((j) => ({
        ...j,
        problems: j.problems.map((p) =>
          p.id === problemId
            ? {
                ...p,
                validationStatus: statusOverride ?? status,
                alternatives,
                contextWhen,
                emotionalImpact,
                impacts,
                reason,
                timeLevel,
                costLevel,
                returnLevel,
              }
            : p
        ),
      }))
      updateIdea(ideaId, { jobs: updatedJobs, selectedProblemId: problemId })
    },
    [ideaId, getIdea, updateIdea, alternatives, contextWhen, emotionalImpact, impacts, status, reason, timeLevel, costLevel, returnLevel]
  )

  // Keep the ref current so the auto-save effect always calls the latest version
  saveCurrentValidationRef.current = saveCurrentValidation

  // Auto-save to localStorage whenever any validation field changes (skips the initial load)
  useEffect(() => {
    if (justLoaded.current) {
      justLoaded.current = false
      return
    }
    const problemId = selectedProblemIdRef.current
    if (problemId === null) return
    saveCurrentValidationRef.current?.(problemId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alternatives, contextWhen, emotionalImpact, impacts, status, reason, timeLevel, costLevel, returnLevel])

  const setSelectedProblemId = useCallback(
    (id: number | null) => {
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
        emotionalImpact, setEmotionalImpact,
        impacts, setImpacts,
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
  { label: "Pick a Problem", path: "pick-a-problem" },
  { label: "Alternatives", path: "alternatives" },
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
