"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Problem } from "@/store/problems-model"
import type { ProjectScope } from "@/hooks/use-projects"
import { PROJECTS_HREF, projectRoutes } from "@/lib/projects"

/**
 * Guards a page that is about a project but not about a problem it may not
 * have yet: the Identify a problem hub and its tools. Nothing renders while
 * the store is loading, because those pages save into the project named in
 * the URL and must not act on a project that has not loaded (or, after a
 * deleted project's link is followed, does not exist).
 */
export function ProjectGate({ scope, children }: { scope: ProjectScope; children: ReactNode }) {
  const router = useRouter()
  const { hydrated, project } = scope

  useEffect(() => {
    if (hydrated && !project) router.replace(PROJECTS_HREF)
  }, [hydrated, project, router])

  if (!hydrated || !project) return null
  return <>{children}</>
}

/**
 * Guards a page that is about a project's problem (its edit page, Explore,
 * Validation). While the store is loading nothing is rendered; once it has
 * loaded, a project that does not exist sends the user to the projects list and a project
 * with no problem yet sends them to the project page to identify one. With
 * a problem in hand the page renders through `children`.
 */
export function ProjectProblemGate({
  scope,
  children,
}: {
  scope: ProjectScope
  children: (problem: Problem) => ReactNode
}) {
  const router = useRouter()
  const { projectId, hydrated, project, problem } = scope

  useEffect(() => {
    if (!hydrated) return
    if (!project) router.replace(PROJECTS_HREF)
    else if (!problem) router.replace(projectRoutes.page(projectId))
  }, [hydrated, project, problem, projectId, router])

  if (!hydrated || !project || !problem) return null
  return <>{children(problem)}</>
}
