import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { Solution, InspirationSource } from "@/types/solution"
import { DEFAULT_SOLUTION_FIELDS } from "@/types/solution"

const STORAGE_KEY = "navigate-solutions"

export type SolutionPatch = Partial<
  Pick<
    Solution,
    | "title"
    | "description"
    | "inspirationSource"
    | "inspirationDetail"
    | "feasibility"
    | "impact"
    | "cost"
    | "timeToImplement"
    | "validationStatus"
    | "workspaceId"
    | "analogyDomain"
    | "analogyInsight"
    | "scamperIdeas"
    | "improveIdeas"
    | "reverseWorseIdeas"
    | "reverseInversions"
  >
>

export type SolutionCreateInput = {
  problemId: number
  workspaceId?: number | null
  title?: string
  description?: string
  inspirationSource?: InspirationSource
  inspirationDetail?: string
  analogyDomain?: string
  analogyInsight?: string
  scamperIdeas?: Record<string, string>
  improveIdeas?: Record<string, string>
  reverseWorseIdeas?: string[]
  reverseInversions?: string[]
}

interface SolutionsState {
  solutions: Solution[]
  nextId: number
}

const defaultState: SolutionsState = {
  solutions: [],
  nextId: 1,
}

function saveToStorage(state: SolutionsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): SolutionsState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SolutionsState
  } catch {
    return null
  }
}

export const solutions = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addSolution(state, solution: Solution) {
      return { ...state, solutions: [...state.solutions, solution], nextId: state.nextId + 1 }
    },

    removeSolution(state, id: number) {
      return { ...state, solutions: state.solutions.filter((s) => s.id !== id) }
    },

    updateSolution(state, { id, patch }: { id: number; patch: SolutionPatch & { editedAt: string } }) {
      return {
        ...state,
        solutions: state.solutions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }
    },

    setAll(_, loaded: SolutionsState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.solutions.setAll(stored)
      }
    },

    update({ id, patch }: { id: number; patch: SolutionPatch }, rootState) {
      const editedAt = new Date().toISOString()
      dispatch.solutions.updateSolution({ id, patch: { ...patch, editedAt } })
      const updated = rootState.solutions.solutions.map((s) =>
        s.id === id ? { ...s, ...patch, editedAt } : s
      )
      saveToStorage({ solutions: updated, nextId: rootState.solutions.nextId })
    },

    create(payload: SolutionCreateInput, rootState): Solution {
      const state = rootState.solutions
      const now = new Date().toISOString()
      const newSolution: Solution = {
        id: state.nextId,
        problemId: payload.problemId,
        workspaceId: payload.workspaceId ?? null,
        createdAt: now,
        editedAt: now,
        ...DEFAULT_SOLUTION_FIELDS,
        title: payload.title ?? DEFAULT_SOLUTION_FIELDS.title,
        description: payload.description ?? DEFAULT_SOLUTION_FIELDS.description,
        inspirationSource: payload.inspirationSource ?? DEFAULT_SOLUTION_FIELDS.inspirationSource,
        inspirationDetail: payload.inspirationDetail ?? DEFAULT_SOLUTION_FIELDS.inspirationDetail,
        analogyDomain: payload.analogyDomain,
        analogyInsight: payload.analogyInsight,
        scamperIdeas: payload.scamperIdeas,
        improveIdeas: payload.improveIdeas,
        reverseWorseIdeas: payload.reverseWorseIdeas,
        reverseInversions: payload.reverseInversions,
      }
      dispatch.solutions.addSolution(newSolution)
      const nextState: SolutionsState = {
        solutions: [...state.solutions, newSolution],
        nextId: state.nextId + 1,
      }
      saveToStorage(nextState)
      return newSolution
    },

    delete(id: number, rootState) {
      dispatch.solutions.removeSolution(id)
      const remaining = rootState.solutions.solutions.filter((s) => s.id !== id)
      saveToStorage({ solutions: remaining, nextId: rootState.solutions.nextId })
    },
  }),
})

export type { Solution }
