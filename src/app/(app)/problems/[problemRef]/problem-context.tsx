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
 * This provider is shared by both the "Explore the Problem" flow
 * (problems/[problemRef]/explore) and the "Problem Validation" flow
 * (problems/[problemRef]/validation). Each of those folders re-exports
 * ProblemProvider / useProblem from here and adds its own step list
 * (NAV_ITEMS) and getAdjacentSteps helper.
 *
 * Mirror: src/app/(app)/solutions/[solutionId]/validate/context.tsx.
 */

import { createContext, useContext, useCallback, useEffect, useMemo, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type {
  ExistingSolutionItem,
  JobsToBeDone,
  JobAnchor,
  ValidationStatus,
  ValidationMetric,
  ValidationAssessment,
} from "@/types/validation"
import { DEFAULT_JOBS_TO_BE_DONE, DEFAULT_VALIDATION_ASSESSMENT } from "@/types/validation"
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
  status: ValidationStatus
  setStatus: (val: ValidationStatus) => void
  jobsToBeDone: JobsToBeDone
  setJobsToBeDone: (val: JobsToBeDone) => void
  validationAssessment: ValidationAssessment
  setAnchorJob: (val: JobAnchor | null) => void
  setHowManyPeople: (patch: Partial<ValidationMetric>) => void
  setHowOften: (patch: Partial<ValidationMetric>) => void
  setWorthToThem: (patch: Partial<ValidationMetric>) => void
  setReachableShare: (val: number) => void
  setObtainableShare: (val: number) => void
  setCostOfSwitching: (patch: Partial<ValidationMetric>) => void
  setSolutionEffectiveness: (patch: Partial<ValidationMetric>) => void
  setCompetitorSize: (patch: Partial<ValidationMetric>) => void
  // Refinement workspace fields (shared with the Identify Solutions flow via
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
  // data is captured here and surfaces later when identifying solutions.
  useEffect(() => {
    if (!Number.isFinite(problemId)) return
    if (!workspace) {
      dispatch.solutionWorkspaces.ensureForProblem(problemId)
    }
  }, [problemId, workspace, dispatch])

  const segmentSize = problem?.segmentSize ?? null
  const customerDescription = problem?.customerDescription ?? ""
  const existingSolutions = problem?.existingSolutions ?? []
  const storedAssessment = problem?.validationAssessment
  const validationAssessment: ValidationAssessment = useMemo(() => ({
    ...DEFAULT_VALIDATION_ASSESSMENT,
    ...(storedAssessment ?? {}),
  }), [storedAssessment])
  const storedJobs = problem?.jobsToBeDone
  const jobsToBeDone: JobsToBeDone = useMemo(() => ({
    ...DEFAULT_JOBS_TO_BE_DONE,
    ...(storedJobs ?? {}),
  }), [storedJobs])
  const contextWhen = problem?.contextWhen ?? ""
  const status = problem?.validationStatus ?? "unvalidated"

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

  const setJobsToBeDone = useCallback(
    (val: JobsToBeDone) => {
      dispatch.problems.update({ id: problemId, patch: { jobsToBeDone: val } })
    },
    [dispatch, problemId]
  )

  const setAnchorJob = useCallback(
    (val: JobAnchor | null) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            anchorJob: val,
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
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

  const setReachableShare = useCallback(
    (val: number) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            reachableShare: val,
          },
        },
      })
    },
    [dispatch, problemId, validationAssessment]
  )

  const setObtainableShare = useCallback(
    (val: number) => {
      dispatch.problems.update({
        id: problemId,
        patch: {
          validationAssessment: {
            ...validationAssessment,
            obtainableShare: val,
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

  // Refinement workspace fields (shared with the Identify Solutions flow via solutionWorkspaces).
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
        status, setStatus,
        jobsToBeDone, setJobsToBeDone,
        validationAssessment,
        setAnchorJob,
        setHowManyPeople,
        setHowOften,
        setWorthToThem,
        setReachableShare,
        setObtainableShare,
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
