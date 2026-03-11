import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-problems"

export type ProblemSource = "brainstorm" | "manual"

export type TopLevelProblem = {
  id: number
  statement: string
  source: ProblemSource
  createdAt: string
}

interface ProblemsState {
  problems: TopLevelProblem[]
  nextId: number
}

const defaultState: ProblemsState = {
  problems: [],
  nextId: 1,
}

function saveToStorage(state: ProblemsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): ProblemsState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProblemsState
  } catch {
    return null
  }
}

export const problems = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addProblem(state, problem: TopLevelProblem) {
      return { ...state, problems: [...state.problems, problem], nextId: state.nextId + 1 }
    },

    removeProblem(state, id: number) {
      return { ...state, problems: state.problems.filter((p) => p.id !== id) }
    },

    updateProblem(state, { id, statement }: { id: number; statement: string }) {
      return {
        ...state,
        problems: state.problems.map((p) => p.id === id ? { ...p, statement } : p),
      }
    },

    setAll(_, loaded: ProblemsState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.problems.setAll(stored)
      }
    },

    update({ id, statement }: { id: number; statement: string }, rootState) {
      dispatch.problems.updateProblem({ id, statement })
      const updated = rootState.problems.problems.map((p) =>
        p.id === id ? { ...p, statement } : p
      )
      saveToStorage({ problems: updated, nextId: rootState.problems.nextId })
    },

    create({ statement, source }: { statement: string; source: ProblemSource }, rootState): TopLevelProblem {
      const state = rootState.problems
      const now = new Date().toISOString()
      const newProblem: TopLevelProblem = {
        id: state.nextId,
        statement,
        source,
        createdAt: now,
      }
      dispatch.problems.addProblem(newProblem)
      const nextState: ProblemsState = {
        problems: [...state.problems, newProblem],
        nextId: state.nextId + 1,
      }
      saveToStorage(nextState)
      return newProblem
    },

    delete(id: number, rootState) {
      dispatch.problems.removeProblem(id)
      const remaining = rootState.problems.problems.filter((p) => p.id !== id)
      saveToStorage({ problems: remaining, nextId: rootState.problems.nextId })
    },
  }),
})
