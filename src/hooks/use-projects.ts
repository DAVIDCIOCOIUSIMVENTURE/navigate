"use client"

import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { Problem } from "@/store/problems-model"
import type { Project } from "@/store/projects-model"
import { HOME_HREF, projectForProblem, projectHref } from "@/lib/projects"

/** The project holding `problemId`, if any. */
export function useProjectForProblem(problemId: number | null | undefined): Project | undefined {
  return useSelector((state: RootState) => projectForProblem(state.projects.projects, problemId))
}

/** The id of the project holding `problemId`, for building routes; null when there is none. */
export function useProjectIdForProblem(problemId: number | null | undefined): number | null {
  return useProjectForProblem(problemId)?.id ?? null
}

/** The id of the project a solution belongs to (through its problem); null when unknown. */
export function useProjectIdForSolution(solutionId: number | null | undefined): number | null {
  return useSelector((state: RootState) => {
    if (solutionId === null || solutionId === undefined) return null
    const solution = state.solutions.solutions.find((s) => s.id === solutionId)
    return projectForProblem(state.projects.projects, solution?.problemId)?.id ?? null
  })
}

/** The page of the project holding `problemId`, or home when there is none. */
export function useProjectHrefForProblem(problemId: number | null | undefined): string {
  const project = useProjectForProblem(problemId)
  return project ? projectHref(project.id) : HOME_HREF
}

export type ProjectScope = {
  /** The `[projectId]` route segment as a number (NaN outside a project route). */
  projectId: number
  /** True once the projects store has loaded, so a missing project means "not found" rather than "not yet". */
  hydrated: boolean
  project: Project | undefined
  /** The project's problem, once it has one. */
  problem: Problem | undefined
}

/**
 * The project a page under `/projects/[projectId]/...` belongs to, with its
 * problem. Every layout and page inside a project reads its scope from here
 * rather than from a problem or solution id in the URL.
 */
export function useProjectScope(): ProjectScope {
  const params = useParams<{ projectId?: string }>()
  const projectId = Number(params?.projectId)
  const hydrated = useSelector((state: RootState) => state.projects.hydrated)
  const project = useSelector((state: RootState) => state.projects.projects.find((p) => p.id === projectId))
  const problem = useSelector((state: RootState) =>
    project?.problemId == null ? undefined : state.problems.problems.find((p) => p.id === project.problemId),
  )
  return { projectId, hydrated, project, problem }
}
