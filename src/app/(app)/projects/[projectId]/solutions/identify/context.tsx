"use client"

import { createContext, useContext, useEffect, useCallback, type ReactNode } from "react"
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
import { DEFAULT_IMPROVEMENT, DEFAULT_WORKSPACE_FIELDS } from "@/types/solution"

type CandidateExtras = {
  description?: string
  analogyDomain?: string
  analogyInsight?: string
  scamperIdeas?: Record<string, string>
  improveIdeas?: Record<string, string>
  reverseWorseIdeas?: string[]
  reverseInversions?: string[]
}
import type { Problem } from "@/store/problems-model"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"

type IdentifySolutionsContextValue = {
  /** The project the flow runs in; every step route is built from it. */
  projectId: number
  /** The project's problem, which the solutions are found for. */
  problemId: number | null
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
  reverseIdeation: ImprovementItem[]
  setReverseIdeation: (val: ImprovementItem[]) => void
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
  // Solutions scoped to this workspace
  candidates: Solution[]
  addCandidate: (
    input: { title: string; inspirationSource: InspirationSource; inspirationDetail: string } & CandidateExtras
  ) => Solution | null
  updateCandidate: (id: number, patch: { title?: string; description?: string }) => void
  removeCandidate: (id: number) => void
  // Wipe the discovery scratch for the active tool so the user can start fresh
  // after saving a solution. Saved candidates are preserved.
  wipeDiscoveryScratch: () => void
  // Reset the entire workspace (tool choices, root-cause work, all idea fields)
  // back to defaults. Saved candidate solutions are preserved.
  resetWorkspace: () => void
}

const IdentifySolutionsContext = createContext<IdentifySolutionsContextValue | null>(null)

export function IdentifySolutionsProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  // The flow runs inside a project, so the problem is the project's own.
  const { projectId, hydrated, problem } = useProjectScope()
  const problemId = problem?.id ?? null

  const workspaces = useSelector((state: RootState) => state.solutionWorkspaces.workspaces)
  const allSolutions = useSelector((state: RootState) => state.solutions.solutions)
  const workspace = problemId != null ? workspaces.find((w) => w.problemId === problemId) : undefined

  // Lazily ensure a workspace exists for the project's problem.
  useEffect(() => {
    if (!hydrated) return
    if (problemId == null) return
    if (!workspace) {
      dispatch.solutionWorkspaces.ensureForProblem(problemId)
    }
  }, [hydrated, problemId, workspace, dispatch])

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
  const reverseIdeation = workspace?.reverseIdeation ?? []
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
  const setReverseIdeation = useCallback((val: ImprovementItem[]) => patch("reverseIdeation", val), [patch])
  const setReverseInversion = useCallback((val: ImprovementItem[]) => patch("reverseInversion", val), [patch])
  const setAnalogyDomain = useCallback((val: string) => patch("analogyDomain", val), [patch])
  const setAnalogyInsight = useCallback((val: string) => patch("analogyInsight", val), [patch])
  const setImprovementResponses = useCallback((val: ImprovementResponses) => patch("improvementResponses", val), [patch])
  const setScamperIdeas = useCallback((val: ScamperIdeasMap) => patch("scamperIdeas", val), [patch])

  const candidates = workspaceId != null
    ? allSolutions.filter((s) => s.workspaceId === workspaceId)
    : []

  const addCandidate = useCallback(
    (
      input: { title: string; inspirationSource: InspirationSource; inspirationDetail: string } & CandidateExtras
    ): Solution | null => {
      if (problemId == null || workspaceId == null) return null
      const title = input.title.trim()
      if (!title) return null
      return dispatch.solutions.create({
        problemId,
        workspaceId,
        title,
        description: input.description,
        inspirationSource: input.inspirationSource,
        inspirationDetail: input.inspirationDetail,
        analogyDomain: input.analogyDomain,
        analogyInsight: input.analogyInsight,
        scamperIdeas: input.scamperIdeas,
        improveIdeas: input.improveIdeas,
        reverseWorseIdeas: input.reverseWorseIdeas,
        reverseInversions: input.reverseInversions,
      })
    },
    [problemId, workspaceId, dispatch]
  )

  const wipeDiscoveryScratch = useCallback(() => {
    if (workspaceId == null) return
    dispatch.solutionWorkspaces.update({
      id: workspaceId,
      patch: {
        scamperIdeas: {},
        improvementResponses: DEFAULT_IMPROVEMENT,
        reverseIdeation: [],
        reverseInversion: [],
        analogyDomain: "",
        analogyInsight: "",
      },
    })
  }, [workspaceId, dispatch])

  const resetWorkspace = useCallback(() => {
    if (workspaceId == null) return
    dispatch.solutionWorkspaces.update({
      id: workspaceId,
      patch: { ...DEFAULT_WORKSPACE_FIELDS },
    })
  }, [workspaceId, dispatch])

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
    <IdentifySolutionsContext.Provider
      value={{
        projectId, problemId, problem, workspace,
        analysisToolType, setAnalysisToolType,
        discoveryToolType, setDiscoveryToolType,
        rootCauses, setRootCauses,
        fiveWhyChains, setFiveWhyChains,
        affectedGroups, setAffectedGroups,
        rootCauseNotes, setRootCauseNotes,
        reverseIdeation, setReverseIdeation,
        reverseInversion, setReverseInversion,
        analogyDomain, setAnalogyDomain,
        analogyInsight, setAnalogyInsight,
        improvementResponses, setImprovementResponses,
        scamperIdeas, setScamperIdeas,
        candidates, addCandidate, updateCandidate, removeCandidate,
        wipeDiscoveryScratch,
        resetWorkspace,
      }}
    >
      {children}
    </IdentifySolutionsContext.Provider>
  )
}

export function useIdentifySolutions() {
  const ctx = useContext(IdentifySolutionsContext)
  if (!ctx) throw new Error("useIdentifySolutions must be used within IdentifySolutionsProvider")
  return ctx
}

export type NavItem = { label: string; path: string }

/**
 * The steps of the flow. Solutions are always found for the problem of the
 * project the user came from (saved as the active discovery problem before
 * the flow opens), so there is no step for choosing one.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Pick a method", path: "pick-method" },
  { label: "Discover", path: "discover" },
  { label: "Review", path: "review" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, projectId: number) {
  const base = projectRoutes.identifySolutionsBase(projectId)
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment)
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx >= 0 && idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}

export const STEPS_REQUIRING_PROBLEM = new Set([
  "pick-method",
  "discover",
  "review",
])
