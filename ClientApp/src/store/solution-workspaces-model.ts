import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { SolutionWorkspace } from "@/types/solution"
import { DEFAULT_WORKSPACE_FIELDS } from "@/types/solution"

const STORAGE_KEY = "navigate-solution-workspaces"

export type WorkspacePatch = Partial<
  Pick<
    SolutionWorkspace,
    | "analysisToolType"
    | "discoveryToolType"
    | "rootCauses"
    | "fiveWhyChains"
    | "affectedGroups"
    | "rootCauseNotes"
    | "reverseIdeation"
    | "reverseInversion"
    | "analogyDomain"
    | "analogyInsight"
    | "improvementResponses"
    | "scamperIdeas"
  >
>

interface WorkspacesState {
  workspaces: SolutionWorkspace[]
  nextId: number
}

const defaultState: WorkspacesState = {
  workspaces: [],
  nextId: 1,
}

function saveToStorage(state: WorkspacesState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): WorkspacesState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WorkspacesState
  } catch {
    return null
  }
}

export const solutionWorkspaces = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addWorkspace(state, workspace: SolutionWorkspace) {
      return { ...state, workspaces: [...state.workspaces, workspace], nextId: state.nextId + 1 }
    },

    removeWorkspace(state, id: number) {
      return { ...state, workspaces: state.workspaces.filter((w) => w.id !== id) }
    },

    updateWorkspace(state, { id, patch }: { id: number; patch: WorkspacePatch & { editedAt: string } }) {
      return {
        ...state,
        workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...patch } : w)),
      }
    },

    setAll(_, loaded: WorkspacesState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.solutionWorkspaces.setAll(stored)
      }
    },

    update({ id, patch }: { id: number; patch: WorkspacePatch }, rootState) {
      const editedAt = new Date().toISOString()
      dispatch.solutionWorkspaces.updateWorkspace({ id, patch: { ...patch, editedAt } })
      const updated = rootState.solutionWorkspaces.workspaces.map((w) =>
        w.id === id ? { ...w, ...patch, editedAt } : w
      )
      saveToStorage({ workspaces: updated, nextId: rootState.solutionWorkspaces.nextId })
    },

    // Returns the existing workspace for a problem, or creates a new one if none exists.
    ensureForProblem(problemId: number, rootState): SolutionWorkspace {
      const existing = rootState.solutionWorkspaces.workspaces.find((w) => w.problemId === problemId)
      if (existing) return existing

      const state = rootState.solutionWorkspaces
      const now = new Date().toISOString()
      const newWorkspace: SolutionWorkspace = {
        id: state.nextId,
        problemId,
        createdAt: now,
        editedAt: now,
        ...DEFAULT_WORKSPACE_FIELDS,
      }
      dispatch.solutionWorkspaces.addWorkspace(newWorkspace)
      saveToStorage({
        workspaces: [...state.workspaces, newWorkspace],
        nextId: state.nextId + 1,
      })
      return newWorkspace
    },

    delete(id: number, rootState) {
      dispatch.solutionWorkspaces.removeWorkspace(id)
      const remaining = rootState.solutionWorkspaces.workspaces.filter((w) => w.id !== id)
      saveToStorage({ workspaces: remaining, nextId: rootState.solutionWorkspaces.nextId })
    },
  }),
})

export type { SolutionWorkspace }
