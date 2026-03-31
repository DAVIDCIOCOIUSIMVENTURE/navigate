"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type {
  AnalysisToolType,
  DiscoveryToolType,
  RootCause,
  FiveWhyChain,
  AffectedGroup,
  SolutionCandidate,
  ScamperResponses,
  SolutionStatus,
  SolutionVerdict,
} from "@/types/solution"
import { DEFAULT_SCAMPER } from "@/types/solution"
import type { Problem } from "@/store/problems-model"

type SolutionContextValue = {
  solutionRef: string
  solutionId: number
  problemId: number
  problem: Problem | undefined
  analysisToolType: AnalysisToolType
  setAnalysisToolType: (val: AnalysisToolType) => void
  discoveryToolType: DiscoveryToolType
  setDiscoveryToolType: (val: DiscoveryToolType) => void
  // Step 1: Root Cause Analysis
  rootCauses: RootCause[]
  setRootCauses: (val: RootCause[]) => void
  fiveWhyChains: FiveWhyChain[]
  setFiveWhyChains: (val: FiveWhyChain[]) => void
  affectedGroups: AffectedGroup[]
  setAffectedGroups: (val: AffectedGroup[]) => void
  rootCauseNotes: string
  setRootCauseNotes: (val: string) => void
  // Step 2: Solution Discovery
  scamperResponses: ScamperResponses
  setScamperResponses: (val: ScamperResponses) => void
  reverseBrainstorm: string
  setReverseBrainstorm: (val: string) => void
  reverseInversion: string
  setReverseInversion: (val: string) => void
  analogyDomain: string
  setAnalogyDomain: (val: string) => void
  analogyInsight: string
  setAnalogyInsight: (val: string) => void
  candidates: SolutionCandidate[]
  setCandidates: (val: SolutionCandidate[]) => void
  // Step 3: Solution Analysis
  selectedCandidateId: number | null
  setSelectedCandidateId: (val: number | null) => void
  analysisNotes: string
  setAnalysisNotes: (val: string) => void
  verdict: SolutionVerdict
  setVerdict: (val: SolutionVerdict) => void
  status: SolutionStatus
  setStatus: (val: SolutionStatus) => void
}

const SolutionContext = createContext<SolutionContextValue | null>(null)

export function SolutionProvider({
  solutionRef,
  children,
}: {
  solutionRef: string
  children: ReactNode
}) {
  const solutionId = Number(solutionRef)
  const dispatch = useDispatch<AppDispatch>()

  const solution = useSelector((state: RootState) =>
    state.solutions.solutions.find((s) => s.id === solutionId)
  )
  const problemId = solution?.problemId ?? 0
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  const analysisToolType = solution?.analysisToolType ?? ""
  const discoveryToolType = solution?.discoveryToolType ?? ""

  const rootCauses = solution?.rootCauses ?? []
  const fiveWhyChains = solution?.fiveWhyChains ?? []
  const affectedGroups = solution?.affectedGroups ?? []
  const rootCauseNotes = solution?.rootCauseNotes ?? ""
  const scamperResponses = solution?.scamperResponses ?? DEFAULT_SCAMPER
  const reverseBrainstorm = solution?.reverseBrainstorm ?? ""
  const reverseInversion = solution?.reverseInversion ?? ""
  const analogyDomain = solution?.analogyDomain ?? ""
  const analogyInsight = solution?.analogyInsight ?? ""
  const candidates = solution?.candidates ?? []
  const selectedCandidateId = solution?.selectedCandidateId ?? null
  const analysisNotes = solution?.analysisNotes ?? ""
  const verdict = solution?.verdict ?? "none"
  const status = solution?.status ?? "not_started"

  const setAnalysisToolType = useCallback(
    (val: AnalysisToolType) => { dispatch.solutions.update({ id: solutionId, patch: { analysisToolType: val } }) },
    [dispatch, solutionId]
  )
  const setDiscoveryToolType = useCallback(
    (val: DiscoveryToolType) => { dispatch.solutions.update({ id: solutionId, patch: { discoveryToolType: val } }) },
    [dispatch, solutionId]
  )
  const setRootCauses = useCallback(
    (val: RootCause[]) => { dispatch.solutions.update({ id: solutionId, patch: { rootCauses: val } }) },
    [dispatch, solutionId]
  )
  const setFiveWhyChains = useCallback(
    (val: FiveWhyChain[]) => { dispatch.solutions.update({ id: solutionId, patch: { fiveWhyChains: val } }) },
    [dispatch, solutionId]
  )
  const setAffectedGroups = useCallback(
    (val: AffectedGroup[]) => { dispatch.solutions.update({ id: solutionId, patch: { affectedGroups: val } }) },
    [dispatch, solutionId]
  )
  const setRootCauseNotes = useCallback(
    (val: string) => { dispatch.solutions.update({ id: solutionId, patch: { rootCauseNotes: val } }) },
    [dispatch, solutionId]
  )
  const setScamperResponses = useCallback(
    (val: ScamperResponses) => { dispatch.solutions.update({ id: solutionId, patch: { scamperResponses: val } }) },
    [dispatch, solutionId]
  )
  const setReverseBrainstorm = useCallback(
    (val: string) => { dispatch.solutions.update({ id: solutionId, patch: { reverseBrainstorm: val } }) },
    [dispatch, solutionId]
  )
  const setReverseInversion = useCallback(
    (val: string) => { dispatch.solutions.update({ id: solutionId, patch: { reverseInversion: val } }) },
    [dispatch, solutionId]
  )
  const setAnalogyDomain = useCallback(
    (val: string) => { dispatch.solutions.update({ id: solutionId, patch: { analogyDomain: val } }) },
    [dispatch, solutionId]
  )
  const setAnalogyInsight = useCallback(
    (val: string) => { dispatch.solutions.update({ id: solutionId, patch: { analogyInsight: val } }) },
    [dispatch, solutionId]
  )
  const setCandidates = useCallback(
    (val: SolutionCandidate[]) => { dispatch.solutions.update({ id: solutionId, patch: { candidates: val } }) },
    [dispatch, solutionId]
  )
  const setSelectedCandidateId = useCallback(
    (val: number | null) => { dispatch.solutions.update({ id: solutionId, patch: { selectedCandidateId: val } }) },
    [dispatch, solutionId]
  )
  const setAnalysisNotes = useCallback(
    (val: string) => { dispatch.solutions.update({ id: solutionId, patch: { analysisNotes: val } }) },
    [dispatch, solutionId]
  )
  const setVerdict = useCallback(
    (val: SolutionVerdict) => { dispatch.solutions.update({ id: solutionId, patch: { verdict: val } }) },
    [dispatch, solutionId]
  )
  const setStatus = useCallback(
    (val: SolutionStatus) => { dispatch.solutions.update({ id: solutionId, patch: { status: val } }) },
    [dispatch, solutionId]
  )

  return (
    <SolutionContext.Provider
      value={{
        solutionRef,
        solutionId,
        problemId,
        problem,
        analysisToolType, setAnalysisToolType,
        discoveryToolType, setDiscoveryToolType,
        rootCauses, setRootCauses,
        fiveWhyChains, setFiveWhyChains,
        affectedGroups, setAffectedGroups,
        rootCauseNotes, setRootCauseNotes,
        scamperResponses, setScamperResponses,
        reverseBrainstorm, setReverseBrainstorm,
        reverseInversion, setReverseInversion,
        analogyDomain, setAnalogyDomain,
        analogyInsight, setAnalogyInsight,
        candidates, setCandidates,
        selectedCandidateId, setSelectedCandidateId,
        analysisNotes, setAnalysisNotes,
        verdict, setVerdict,
        status, setStatus,
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
  { label: "Choose Your Analysis", path: "choose-analysis", section: "Analyse" },
  { label: "Analyse", path: "analyse", section: null },
  { label: "Choose Your Solution Discovery", path: "choose-discovery", section: "Discover" },
  { label: "Discover", path: "discover", section: null },
  { label: "Score & Compare", path: "analysis", section: "Evaluate" },
  { label: "Summary & Verdict", path: "summary", section: null },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, solutionRef: string) {
  const base = `/solutions/${solutionRef}`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment)
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
