"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type {
  AnalysisToolType,
  DiscoveryToolType,
  RootCause,
  FiveWhyChain,
  AffectedGroup,
  ImprovementItem,
  ImprovementResponses,
  SolutionWorkspace,
  InspirationSource,
  Solution,
} from "@/types/solution"
type ScamperIdeasMap = Record<string, ImprovementItem[]>
import { DEFAULT_IMPROVEMENT } from "@/types/solution"
import type { Problem } from "@/store/problems-model"

const ACTIVE_PROBLEM_KEY = "navigate-active-discovery-problem"

type DiscoveryContextValue = {
  problemId: number | null
  setProblemId: (id: number | null) => void
  problem: Problem | undefined
  workspace: SolutionWorkspace | undefined
  analysisToolType: AnalysisToolType
  setAnalysisToolType: (val: AnalysisToolType) => void
  discoveryToolType: DiscoveryToolType
  setDiscoveryToolType: (val: DiscoveryToolType) => void
  rootCauses: RootCause[]
  setRootCauses: (val: RootCause[]) => void
  fiveWhyChains: FiveWhyChain[]
  setFiveWhyChains: (val: FiveWhyChain[]) => void
  affectedGroups: AffectedGroup[]
  setAffectedGroups: (val: AffectedGroup[]) => void
  rootCauseNotes: string
  setRootCauseNotes: (val: string) => void
  reverseBrainstorm: ImprovementItem[]
  setReverseBrainstorm: (val: ImprovementItem[]) => void
  reverseInversion: ImprovementItem[]
  setReverseInversion: (val: ImprovementItem[]) => void
  analogyDomain: string
  setAnalogyDomain: (val: string) => void
  analogyInsight: string
  setAnalogyInsight: (val: string) => void
  improvementResponses: ImprovementResponses
  setImprovementResponses: (val: ImprovementResponses) => void
  scamperIdeas: ScamperIdeasMap
  setScamperIdeas: (val: ScamperIdeasMap) => void
  // Solution bank entries scoped to this workspace
  candidates: Solution[]
  addCandidate: (input: { title: string; inspirationSource: InspirationSource; inspirationDetail: string }) => Solution | null
  updateCandidate: (id: number, patch: { title?: string; description?: string }) => void
  removeCandidate: (id: number) => void
}

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null)

function loadActiveProblemId(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ACTIVE_PROBLEM_KEY)
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

function saveActiveProblemId(id: number | null) {
  if (typeof window === "undefined") return
  try {
    if (id === null) localStorage.removeItem(ACTIVE_PROBLEM_KEY)
    else localStorage.setItem(ACTIVE_PROBLEM_KEY, String(id))
  } catch {
    // ignore storage errors
  }
}

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const [problemId, setProblemIdState] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProblemIdState(loadActiveProblemId())
    setHydrated(true)
  }, [])

  const workspaces = useSelector((state: RootState) => state.solutionWorkspaces.workspaces)
  const allSolutions = useSelector((state: RootState) => state.solutions.solutions)
  const problem = useSelector((state: RootState) =>
    problemId != null ? state.problems.problems.find((p) => p.id === problemId) : undefined
  )
  const workspace = problemId != null ? workspaces.find((w) => w.problemId === problemId) : undefined

  // Lazily ensure a workspace exists once a problem is selected.
  useEffect(() => {
    if (!hydrated) return
    if (problemId == null) return
    if (!workspace) {
      dispatch.solutionWorkspaces.ensureForProblem(problemId)
    }
  }, [hydrated, problemId, workspace, dispatch])

  const setProblemId = useCallback((id: number | null) => {
    setProblemIdState(id)
    saveActiveProblemId(id)
    if (id != null) dispatch.solutionWorkspaces.ensureForProblem(id)
  }, [dispatch])

  const workspaceId = workspace?.id ?? null

  const patch = useCallback(
    <K extends keyof SolutionWorkspace>(key: K, value: SolutionWorkspace[K]) => {
      if (workspaceId == null) return
      dispatch.solutionWorkspaces.update({ id: workspaceId, patch: { [key]: value } })
    },
    [workspaceId, dispatch]
  )

  const analysisToolType = workspace?.analysisToolType ?? ""
  const discoveryToolType = workspace?.discoveryToolType ?? ""
  const rootCauses = workspace?.rootCauses ?? []
  const fiveWhyChains = workspace?.fiveWhyChains ?? []
  const affectedGroups = workspace?.affectedGroups ?? []
  const rootCauseNotes = workspace?.rootCauseNotes ?? ""
  const reverseBrainstorm = workspace?.reverseBrainstorm ?? []
  const reverseInversion = workspace?.reverseInversion ?? []
  const analogyDomain = workspace?.analogyDomain ?? ""
  const analogyInsight = workspace?.analogyInsight ?? ""
  const improvementResponses = workspace?.improvementResponses ?? DEFAULT_IMPROVEMENT
  const scamperIdeas = (workspace?.scamperIdeas ?? {}) as ScamperIdeasMap

  const setAnalysisToolType = useCallback((val: AnalysisToolType) => patch("analysisToolType", val), [patch])
  const setDiscoveryToolType = useCallback((val: DiscoveryToolType) => patch("discoveryToolType", val), [patch])
  const setRootCauses = useCallback((val: RootCause[]) => patch("rootCauses", val), [patch])
  const setFiveWhyChains = useCallback((val: FiveWhyChain[]) => patch("fiveWhyChains", val), [patch])
  const setAffectedGroups = useCallback((val: AffectedGroup[]) => patch("affectedGroups", val), [patch])
  const setRootCauseNotes = useCallback((val: string) => patch("rootCauseNotes", val), [patch])
  const setReverseBrainstorm = useCallback((val: ImprovementItem[]) => patch("reverseBrainstorm", val), [patch])
  const setReverseInversion = useCallback((val: ImprovementItem[]) => patch("reverseInversion", val), [patch])
  const setAnalogyDomain = useCallback((val: string) => patch("analogyDomain", val), [patch])
  const setAnalogyInsight = useCallback((val: string) => patch("analogyInsight", val), [patch])
  const setImprovementResponses = useCallback((val: ImprovementResponses) => patch("improvementResponses", val), [patch])
  const setScamperIdeas = useCallback((val: ScamperIdeasMap) => patch("scamperIdeas", val), [patch])

  const candidates = workspaceId != null
    ? allSolutions.filter((s) => s.workspaceId === workspaceId)
    : []

  const addCandidate = useCallback(
    (input: { title: string; inspirationSource: InspirationSource; inspirationDetail: string }): Solution | null => {
      if (problemId == null || workspaceId == null) return null
      const title = input.title.trim()
      if (!title) return null
      return dispatch.solutions.create({
        problemId,
        workspaceId,
        title,
        inspirationSource: input.inspirationSource,
        inspirationDetail: input.inspirationDetail,
      })
    },
    [problemId, workspaceId, dispatch]
  )

  const updateCandidate = useCallback(
    (id: number, p: { title?: string; description?: string }) => {
      dispatch.solutions.update({ id, patch: p })
    },
    [dispatch]
  )

  const removeCandidate = useCallback(
    (id: number) => {
      dispatch.solutions.delete(id)
    },
    [dispatch]
  )

  return (
    <DiscoveryContext.Provider
      value={{
        problemId, setProblemId, problem, workspace,
        analysisToolType, setAnalysisToolType,
        discoveryToolType, setDiscoveryToolType,
        rootCauses, setRootCauses,
        fiveWhyChains, setFiveWhyChains,
        affectedGroups, setAffectedGroups,
        rootCauseNotes, setRootCauseNotes,
        reverseBrainstorm, setReverseBrainstorm,
        reverseInversion, setReverseInversion,
        analogyDomain, setAnalogyDomain,
        analogyInsight, setAnalogyInsight,
        improvementResponses, setImprovementResponses,
        scamperIdeas, setScamperIdeas,
        candidates, addCandidate, updateCandidate, removeCandidate,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  )
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext)
  if (!ctx) throw new Error("useDiscovery must be used within DiscoveryProvider")
  return ctx
}

export type NavItem = { label: string; path: string }

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Select a Problem", path: "select-problem" },
  { label: "Choose Discovery Method", path: "choose-discovery" },
  { label: "Discover", path: "discover" },
  { label: "Review", path: "summary" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string) {
  const base = "/solutions/discover"
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment)
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx >= 0 && idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}

export const STEPS_REQUIRING_PROBLEM = new Set([
  "choose-discovery",
  "discover",
  "summary",
])
