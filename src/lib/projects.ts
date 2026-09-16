/**
 * Pure helpers for projects: finding the project a problem or solution
 * belongs to, and every route that lives under a project. All of the app's
 * work happens inside `/projects/<id>/...`, so build hrefs here rather than
 * spelling paths out at call sites. The React hooks over these live in
 * `src/hooks/use-projects.ts`.
 */
import type { Project } from "@/store/projects-model"

export const HOME_HREF = "/"

/** A project id, or nothing yet (a page still hydrating). Builders fall back to home for nothing. */
export type ProjectRef = number | null | undefined

function root(projectId: ProjectRef): string | null {
  return projectId === null || projectId === undefined || !Number.isFinite(projectId) ? null : `/projects/${projectId}`
}

function under(projectId: ProjectRef, suffix: string): string {
  const base = root(projectId)
  return base === null ? HOME_HREF : `${base}${suffix}`
}

export function projectHref(projectId: ProjectRef): string {
  return under(projectId, "")
}

/** Every route under a project. Flow steps default to their first step. */
export const projectRoutes = {
  page: (projectId: ProjectRef) => under(projectId, ""),
  identify: (projectId: ProjectRef) => under(projectId, "/identify"),
  canvasBuilder: (projectId: ProjectRef) => under(projectId, "/identify/canvas-builder"),
  reflect: (projectId: ProjectRef) => under(projectId, "/identify/reflect"),
  research: (projectId: ProjectRef) => under(projectId, "/identify/research"),
  problemEdit: (projectId: ProjectRef) => under(projectId, "/problem/edit"),
  exploreBase: (projectId: ProjectRef) => under(projectId, "/problem/explore"),
  explore: (projectId: ProjectRef, step = "introduction") => under(projectId, `/problem/explore/${step}`),
  validationBase: (projectId: ProjectRef) => under(projectId, "/problem/validation"),
  validation: (projectId: ProjectRef, step = "introduction") => under(projectId, `/problem/validation/${step}`),
  identifySolutionsBase: (projectId: ProjectRef) => under(projectId, "/solutions/identify"),
  identifySolutions: (projectId: ProjectRef, step = "pick-method") => under(projectId, `/solutions/identify/${step}`),
  compareBase: (projectId: ProjectRef) => under(projectId, "/solutions/compare"),
  compare: (projectId: ProjectRef, step = "introduction") => under(projectId, `/solutions/compare/${step}`),
  solution: (projectId: ProjectRef, solutionId: number) => under(projectId, `/solutions/${solutionId}`),
  solutionEdit: (projectId: ProjectRef, solutionId: number) => under(projectId, `/solutions/${solutionId}/edit`),
  solutionValidateBase: (projectId: ProjectRef, solutionId: number) => under(projectId, `/solutions/${solutionId}/validate`),
  solutionValidate: (projectId: ProjectRef, solutionId: number, step = "introduction") =>
    under(projectId, `/solutions/${solutionId}/validate/${step}`),
}

/** The project id in a `/projects/<id>/...` pathname, or null elsewhere. */
export function projectIdFromPathname(pathname: string): number | null {
  const match = pathname.match(/^\/projects\/(\d+)(?:\/|$)/)
  return match ? Number(match[1]) : null
}

export function projectForProblem(projects: readonly Project[], problemId: number | null | undefined): Project | undefined {
  if (problemId === null || problemId === undefined) return undefined
  return projects.find((p) => p.problemId === problemId)
}

/** The page of the project holding `problemId`, or home when the problem has no project. */
export function projectHrefForProblem(projects: readonly Project[], problemId: number | null | undefined): string {
  const project = projectForProblem(projects, problemId)
  return project ? projectHref(project.id) : HOME_HREF
}

/** The problem a project holds, or undefined while it has none. */
export function problemOfProject<T extends { id: number }>(
  project: Project | undefined,
  problems: readonly T[],
): T | undefined {
  if (!project || project.problemId === null) return undefined
  return problems.find((p) => p.id === project.problemId)
}

/** What to call a project in the UI: its own name, then its problem's title, then a numbered fallback. */
export function projectDisplayName(project: Project, problemTitle?: string | null): string {
  const name = project.name.trim()
  if (name.length > 0) return name
  const title = problemTitle?.trim() ?? ""
  return title.length > 0 ? title : `Project ${project.id}`
}

/**
 * What to call a project when only the problems list is to hand. The one
 * place that pairs a project with its problem's title, so the header, the
 * home table and the project page all read the same.
 */
export function projectLabel<T extends { id: number; title: string }>(
  project: Project,
  problems: readonly T[],
): string {
  return projectDisplayName(project, problemOfProject(project, problems)?.title)
}
