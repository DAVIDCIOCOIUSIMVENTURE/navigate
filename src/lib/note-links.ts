/**
 * Pure helpers for the journal's "Linked to" dropdown: how a `NoteLink` is
 * written as a Select value and read back, what to call it, and which link a
 * note written on the current page should start with.
 */
import { GENERAL_LINK, SELF_DISCOVERY_LINK, isNoteInProject, type Note, type NoteLink } from "@/store/notes-model"
import { projectIdFromPathname } from "@/lib/projects"

export const SELF_DISCOVERY_HREF = "/self-discovery"

/**
 * The editor picks a link with two Selects: the project (or none), then the
 * section within it. Each Select needs a non-empty string per option; these
 * are the fixed ones. A project is its id as a string, and a solution section
 * is `solution:<id>`.
 */
export const NO_PROJECT_KEY = "none"
export const GENERAL_SECTION_KEY = "general"
export const SELF_DISCOVERY_SECTION_KEY = "self-discovery"
export const PROBLEM_SECTION_KEY = "problem"

export type NoteLinkParts = { project: string; section: string }

export function solutionSectionKey(solutionId: number): string {
  return `solution:${solutionId}`
}

/** The two Select values a link is shown as. Inverse of `noteLinkFromParts`. */
export function noteLinkParts(link: NoteLink): NoteLinkParts {
  switch (link.kind) {
    case "none":
      return { project: NO_PROJECT_KEY, section: GENERAL_SECTION_KEY }
    case "self-discovery":
      return { project: NO_PROJECT_KEY, section: SELF_DISCOVERY_SECTION_KEY }
    case "problem":
      return { project: String(link.projectId), section: PROBLEM_SECTION_KEY }
    case "solution":
      return { project: String(link.projectId), section: solutionSectionKey(link.solutionId) }
  }
}

/**
 * The link two Select values stand for. A section that does not belong to
 * the chosen project reads as that project's problem, and anything
 * unrecognised without a project reads as general, so changing the project
 * always lands on something the section Select offers.
 */
export function noteLinkFromParts({ project, section }: NoteLinkParts): NoteLink {
  if (project === NO_PROJECT_KEY || !/^\d+$/.test(project)) {
    return section === SELF_DISCOVERY_SECTION_KEY ? SELF_DISCOVERY_LINK : GENERAL_LINK
  }
  const projectId = Number(project)
  const solution = section.match(/^solution:(\d+)$/)
  if (solution) return { kind: "solution", projectId, solutionId: Number(solution[1]) }
  return { kind: "problem", projectId }
}

/** What the journal can link a note to: every project with its problem and each of its solutions. */
export type NoteLinkProject = {
  id: number
  label: string
  solutions: { id: number; title: string }[]
}

export const SELF_DISCOVERY_LABEL = "Self Discovery"
export const PROBLEM_AREA_LABEL = "Problem"

export function solutionAreaLabel(title: string): string {
  const trimmed = title.trim()
  return trimmed.length > 0 ? trimmed : "Untitled solution"
}

/**
 * The link as the list shows it: "Self Discovery", "<Project> · Problem" or
 * "<Project> · <Solution>". Null for a general note, and for a link to a
 * project or solution that no longer exists (it reads as general, which is
 * what it becomes as soon as the note is next saved).
 */
export function describeNoteLink(link: NoteLink, projects: readonly NoteLinkProject[]): string | null {
  if (link.kind === "none") return null
  if (link.kind === "self-discovery") return SELF_DISCOVERY_LABEL
  const project = projects.find((p) => p.id === link.projectId)
  if (!project) return null
  if (link.kind === "problem") return `${project.label} · ${PROBLEM_AREA_LABEL}`
  const solution = project.solutions.find((s) => s.id === link.solutionId)
  return solution ? `${project.label} · ${solutionAreaLabel(solution.title)}` : null
}

/** What the section Select offers for the chosen project: General or Self Discovery without one, else Problem and each solution. */
export function sectionOptions(project: string, projects: readonly NoteLinkProject[]): { value: string; label: string }[] {
  const owner = projects.find((p) => String(p.id) === project)
  if (!owner) {
    return [
      { value: GENERAL_SECTION_KEY, label: "General" },
      { value: SELF_DISCOVERY_SECTION_KEY, label: SELF_DISCOVERY_LABEL },
    ]
  }
  return [
    { value: PROBLEM_SECTION_KEY, label: PROBLEM_AREA_LABEL },
    ...owner.solutions.map((s) => ({ value: solutionSectionKey(s.id), label: `Solution: ${solutionAreaLabel(s.title)}` })),
  ]
}

/** Whether the dropdowns still offer this link, so a stale one can fall back to general. */
export function isNoteLinkAvailable(link: NoteLink, projects: readonly NoteLinkProject[]): boolean {
  return link.kind === "none" || link.kind === "self-discovery" || describeNoteLink(link, projects) !== null
}

/** The solution id in a `/projects/<id>/solutions/<solutionId>/...` pathname, or null elsewhere. */
export function solutionIdFromPathname(pathname: string): number | null {
  const match = pathname.match(/^\/projects\/\d+\/solutions\/(\d+)(?:\/|$)/)
  return match ? Number(match[1]) : null
}

/**
 * The area the user is in, which is where a note written there starts out
 * linked and what the "here" filter narrows to: a project (with the solution
 * when the page is about one), Self Discovery, or nothing.
 */
export type JournalScope =
  | { kind: "self-discovery" }
  | { kind: "project"; projectId: number; solutionId: number | null }
  | null

export function journalScopeFromPathname(pathname: string): JournalScope {
  if (pathname === SELF_DISCOVERY_HREF || pathname.startsWith(`${SELF_DISCOVERY_HREF}/`)) return { kind: "self-discovery" }
  const projectId = projectIdFromPathname(pathname)
  if (projectId === null) return null
  return { kind: "project", projectId, solutionId: solutionIdFromPathname(pathname) }
}

/** The link a new note should start with in `scope`, given what the dropdown offers. */
export function defaultNoteLink(scope: JournalScope, projects: readonly NoteLinkProject[]): NoteLink {
  if (scope === null) return GENERAL_LINK
  if (scope.kind === "self-discovery") return SELF_DISCOVERY_LINK
  const project = projects.find((p) => p.id === scope.projectId)
  if (!project) return GENERAL_LINK
  if (scope.solutionId !== null && project.solutions.some((s) => s.id === scope.solutionId)) {
    return { kind: "solution", projectId: project.id, solutionId: scope.solutionId }
  }
  return { kind: "problem", projectId: project.id }
}

/** Whether a note belongs to the "here" filter for `scope`. */
export function isNoteInScope(link: NoteLink, scope: JournalScope): boolean {
  if (scope === null) return true
  if (scope.kind === "self-discovery") return link.kind === "self-discovery"
  return (link.kind === "problem" || link.kind === "solution") && link.projectId === scope.projectId
}

/**
 * A project's notes split by the section they were written about: the ones
 * about one of its solutions, keyed by solution id, and the rest, which were
 * written about the problem or the project as a whole. The admin's view of a
 * portfolio places each solution's notes beside that solution and the rest in
 * its "Project notes" section.
 */
export type ProjectNotes = { project: Note[]; bySolution: Record<number, Note[]> }

export const EMPTY_PROJECT_NOTES: ProjectNotes = { project: [], bySolution: {} }

/**
 * Newest first, like the journal. A note about a solution that `solutionIds`
 * does not list (one that no longer exists) reads as a note about the
 * project, so it is still shown rather than dropped.
 */
export function projectNotesBySection(
  notes: readonly Note[],
  projectId: number,
  solutionIds: readonly number[],
): ProjectNotes {
  const known = new Set(solutionIds)
  const sorted = notes.filter((n) => isNoteInProject(n, projectId)).sort((a, b) => b.editedAt.localeCompare(a.editedAt))
  const result: ProjectNotes = { project: [], bySolution: {} }
  for (const note of sorted) {
    if (note.link.kind === "solution" && known.has(note.link.solutionId)) {
      ;(result.bySolution[note.link.solutionId] ??= []).push(note)
    } else {
      result.project.push(note)
    }
  }
  return result
}
