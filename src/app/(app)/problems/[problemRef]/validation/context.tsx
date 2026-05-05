"use client"

/**
 * <ProblemProvider> + useProblem(): the active problem scope.
 *
 * The state itself lives in Redux. This context exists for one reason: it
 * carries the current `problemRef` (route param) down the tree and bundles
 * the redux state + dispatch wrappers into a single typed hook so:
 *
 *   - strategy components like <CustomerStrategy /> stay zero-prop and
 *     don't have to know how the id was obtained (URL params on the step
 *     pages, useState on the dialog open from a solution flow, etc.).
 *   - call sites get named setters (`setSegmentSize(5)`) instead of
 *     spelling out `dispatch.problems.update({ id, patch: { ... } })` at
 *     each one.
 *
 * No local state lives here - every read is a useSelector and every write
 * is a dispatch. Two providers wrapping the same problemId would stay
 * perfectly in sync because Redux is the single source of truth.
 *
 * Mirror: src/app/(app)/solutions/[solutionId]/validate/context.tsx.
 */

import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { ExistingSolutionItem, ValidationStatus, ValidationMetric, ValidationAssessment } from "@/types/validation"
import { DEFAULT_VALIDATION_ASSESSMENT } from "@/types/validation"
import type { Problem } from "@/store/problems-model"
import type {
  AnalysisToolType,
  RootCause,
  FiveWhyChain,
  AffectedGroup,
} from "@/types/solution"

type ProblemContextValue = {
  problemRef: string
  problemId: number
  problem: Problem | undefined
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
  // Refinement workspace fields (shared with the solution discovery flow via
  // the per-problem solution workspace).
  analysisToolType: AnalysisToolType
  setAnalysisToolType: (val: AnalysisToolType) => void
  rootCauses: RootCause[]
  setRootCauses: (val: RootCause[]) => void
  rootCauseNotes: string
  setRootCauseNotes: (val: string) => void
  fiveWhyChains: FiveWhyChain[]
  setFiveWhyChains: (val: FiveWhyChain[]) => void
  affectedGroups: AffectedGroup[]
  setAffectedGroups: (val: AffectedGroup[]) => void
}

const ProblemContext = createContext<ProblemContextValue | null>(null)

export function ProblemProvider({
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
  const workspace = useSelector((state: RootState) =>
    state.solutionWorkspaces.workspaces.find((w) => w.problemId === problemId)
  )

  // Lazily ensure a solution workspace exists for this problem so refinement
  // data is captured here and surfaces later in solution discovery.
  useEffect(() => {
    if (!Number.isFinite(problemId)) return
    if (!workspace) {
      dispatch.solutionWorkspaces.ensureForProblem(problemId)
    }
  }, [problemId, workspace, dispatch])

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

  // Refinement workspace fields (shared with solution discovery via solutionWorkspaces).
  const analysisToolType: AnalysisToolType = workspace?.analysisToolType ?? ""
  const rootCauses = workspace?.rootCauses ?? []
  const rootCauseNotes = workspace?.rootCauseNotes ?? ""
  const fiveWhyChains = workspace?.fiveWhyChains ?? []
  const affectedGroups = workspace?.affectedGroups ?? []

  const workspaceId = workspace?.id ?? null

  const setAnalysisToolType = useCallback(
    (val: AnalysisToolType) => {
      if (workspaceId == null) return
      dispatch.solutionWorkspaces.update({ id: workspaceId, patch: { analysisToolType: val } })
    },
    [workspaceId, dispatch]
  )

  const setRootCauses = useCallback(
    (val: RootCause[]) => {
      if (workspaceId == null) return
      dispatch.solutionWorkspaces.update({ id: workspaceId, patch: { rootCauses: val } })
    },
    [workspaceId, dispatch]
  )

  const setRootCauseNotes = useCallback(
    (val: string) => {
      if (workspaceId == null) return
      dispatch.solutionWorkspaces.update({ id: workspaceId, patch: { rootCauseNotes: val } })
    },
    [workspaceId, dispatch]
  )

  const setFiveWhyChains = useCallback(
    (val: FiveWhyChain[]) => {
      if (workspaceId == null) return
      dispatch.solutionWorkspaces.update({ id: workspaceId, patch: { fiveWhyChains: val } })
    },
    [workspaceId, dispatch]
  )

  const setAffectedGroups = useCallback(
    (val: AffectedGroup[]) => {
      if (workspaceId == null) return
      dispatch.solutionWorkspaces.update({ id: workspaceId, patch: { affectedGroups: val } })
    },
    [workspaceId, dispatch]
  )

  return (
    <ProblemContext.Provider
      value={{
        problemRef,
        problemId,
        problem,
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
        analysisToolType, setAnalysisToolType,
        rootCauses, setRootCauses,
        rootCauseNotes, setRootCauseNotes,
        fiveWhyChains, setFiveWhyChains,
        affectedGroups, setAffectedGroups,
      }}
    >
      {children}
    </ProblemContext.Provider>
  )
}

export function useProblem() {
  const ctx = useContext(ProblemContext)
  if (!ctx) throw new Error("useProblem must be used within ProblemProvider")
  return ctx
}

export const NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "Define your customer", path: "customer" },
  { label: "Choose your refinement method", path: "choose-refinement" },
  { label: "Refine your problem", path: "refine" },
  { label: "Explore existing solutions & shortcomings", path: "existing-solutions" },
  { label: "Validate your problem", path: "validate" },
  { label: "Summary & Next Steps", path: "summary" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, problemRef: string) {
  const base = `/problems/${problemRef}/validation`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as (typeof STEP_PATHS)[number])
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
