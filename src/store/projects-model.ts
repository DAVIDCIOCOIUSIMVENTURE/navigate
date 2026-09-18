import { createModel } from "@rematch/core"
import type { RootModel } from "."
import { uniqueProjectName } from "@/lib/projects"

const STORAGE_KEY = "navigate-projects"

/**
 * Somebody the project is shared with. There is no user account system yet,
 * so a member is only the name and email typed into the project settings
 * dialog; `id` exists so the list can be edited and rendered.
 */
export type ProjectMember = {
  id: string
  name: string
  email: string
}

/**
 * Who may read a project's preview page. `private` is the default and keeps
 * the preview to the people working on the project; `public` opens it to
 * anyone holding the link, with no account and no licence needed.
 */
export type ProjectVisibility = "private" | "public"

/**
 * A project is the unit of work in Navigate: one problem and the solutions
 * found for it. `problemId` is null while the project has not identified its
 * problem yet (a freshly created project). Solutions are not listed here;
 * they belong to the project through `Solution.problemId`. `members` is the
 * team the project is shared with, and `visibility` says whether its preview
 * page is open to anyone. Everything else the user does inside a project
 * (drafts, comparison weights) is kept by the feature's own model under the
 * project id.
 */
export type Project = {
  id: number
  name: string
  problemId: number | null
  members: ProjectMember[]
  visibility: ProjectVisibility
  createdAt: string
  editedAt: string
}

export type ProjectPatch = Partial<Pick<Project, "name" | "problemId" | "members" | "visibility">>

/** What is persisted. */
interface StoredProjects {
  projects: Project[]
  nextId: number
}

interface ProjectsState extends StoredProjects {
  /** True once localStorage has been read, so pages can tell "no such project" from "not loaded yet". */
  hydrated: boolean
}

const defaultStored: StoredProjects = {
  projects: [],
  nextId: 1,
}

const defaultState: ProjectsState = { ...defaultStored, hydrated: false }

function saveToStorage(state: StoredProjects) {
  if (typeof window === "undefined") return
  try {
    const stored: StoredProjects = { projects: state.projects, nextId: state.nextId }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // ignore storage errors
  }
}

/** Drop anything stored under `members` that is not a usable member, rather than trusting it. */
function parseMembers(value: unknown): ProjectMember[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return []
    const { id, name, email } = entry as Partial<ProjectMember>
    if (typeof id !== "string" || id.length === 0) return []
    return [{ id, name: typeof name === "string" ? name : "", email: typeof email === "string" ? email : "" }]
  })
}

/** A stored visibility is only trusted when it is one of the two we know. */
function parseVisibility(value: unknown): ProjectVisibility {
  return value === "public" ? "public" : "private"
}

function loadFromStorage(): StoredProjects | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredProjects>
    const projects = (parsed.projects ?? []).map((p) => ({
      ...p,
      name: p.name ?? "",
      problemId: typeof p.problemId === "number" ? p.problemId : null,
      members: parseMembers(p.members),
      visibility: parseVisibility(p.visibility),
    }))
    // Never mint an id a stored project already holds, whatever `nextId` says.
    const afterLast = projects.reduce((max, p) => Math.max(max, p.id), 0) + 1
    return {
      projects,
      nextId: Math.max(parsed.nextId ?? 1, afterLast),
    }
  } catch {
    return null
  }
}

/** The name a project is created with when it is made for a problem rather than by the user. */
export function defaultProjectName(problemTitle: string, projectNumber: number): string {
  const trimmed = problemTitle.trim()
  return trimmed.length > 0 ? trimmed : `Project ${projectNumber}`
}

export const projects = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addProject(state, project: Project) {
      return { ...state, projects: [...state.projects, project], nextId: state.nextId + 1 }
    },

    removeProject(state, id: number) {
      return { ...state, projects: state.projects.filter((p) => p.id !== id) }
    },

    updateProject(state, { id, patch }: { id: number; patch: ProjectPatch & { editedAt: string } }) {
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }
    },

    setAll(_, loaded: StoredProjects): ProjectsState {
      return { ...loaded, hydrated: true }
    },
  },

  effects: (dispatch) => ({
    init() {
      dispatch.projects.setAll(loadFromStorage() ?? defaultStored)
    },

    /**
     * Give every problem a project. Problems saved before projects existed
     * each get one named after their title. Call after the problems model
     * has hydrated.
     */
    ensureForProblems(_: void, rootState) {
      const owned = new Set(rootState.projects.projects.map((p) => p.problemId))
      for (const problem of rootState.problems.problems) {
        if (owned.has(problem.id)) continue
        dispatch.projects.create({ name: problem.title, problemId: problem.id })
      }
    },

    create(
      payload: {
        name: string
        problemId?: number | null
        members?: ProjectMember[]
        visibility?: ProjectVisibility
        /** Set when the name may already be in use (an import), to number the copy rather than repeat it. */
        uniqueName?: boolean
      },
      rootState,
    ): Project {
      const state = rootState.projects
      const now = new Date().toISOString()
      const wanted = payload.uniqueName
        ? uniqueProjectName(state.projects.map((p) => p.name), payload.name)
        : payload.name
      const project: Project = {
        id: state.nextId,
        name: defaultProjectName(wanted, state.nextId),
        problemId: payload.problemId ?? null,
        members: payload.members ?? [],
        // A new project is private until its owner decides otherwise.
        visibility: payload.visibility ?? "private",
        createdAt: now,
        editedAt: now,
      }
      dispatch.projects.addProject(project)
      saveToStorage({ projects: [...state.projects, project], nextId: state.nextId + 1 })
      return project
    },

    update({ id, patch }: { id: number; patch: ProjectPatch }, rootState) {
      const editedAt = new Date().toISOString()
      dispatch.projects.updateProject({ id, patch: { ...patch, editedAt } })
      saveToStorage({
        ...rootState.projects,
        projects: rootState.projects.projects.map((p) => (p.id === id ? { ...p, ...patch, editedAt } : p)),
      })
    },

    /**
     * Called whenever a problem is created. The project it was identified
     * for takes the problem if it has none yet; a problem without a project
     * (an import, a copy) or for a project that is already full gets a
     * project of its own, so every problem always belongs to exactly one.
     */
    adoptProblem(problem: { id: number; title: string; projectId?: number | null }, rootState) {
      const list = rootState.projects.projects
      if (list.some((p) => p.problemId === problem.id)) return
      const target = list.find((p) => p.id === problem.projectId)
      if (target && target.problemId === null) {
        dispatch.projects.update({ id: target.id, patch: { problemId: problem.id } })
        return
      }
      dispatch.projects.create({ name: problem.title, problemId: problem.id })
    },

    /** Called whenever a problem is deleted: its project stays, empty and ready for a new problem. */
    detachProblem(problemId: number, rootState) {
      const owner = rootState.projects.projects.find((p) => p.problemId === problemId)
      if (owner) dispatch.projects.update({ id: owner.id, patch: { problemId: null } })
    },

    /** Delete a project together with its problem, every solution found for it and its drafts. */
    delete(id: number, rootState) {
      const project = rootState.projects.projects.find((p) => p.id === id)
      if (!project) return
      // The problem takes its solutions and workspace with it; the project owns only the drafts below.
      if (project.problemId !== null) dispatch.problems.delete(project.problemId)
      dispatch.reflectSessions.clearProject(id)
      dispatch.researchSessions.clearProject(id)
      dispatch.canvasDrafts.clearProject(id)
      dispatch.solutionComparison.clearProject(id)
      dispatch.projects.removeProject(id)
      saveToStorage({
        projects: rootState.projects.projects.filter((p) => p.id !== id),
        nextId: rootState.projects.nextId,
      })
    },
  }),
})
