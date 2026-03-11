import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { SavedCombination } from "@/app/(app)/problem-discovery/brainstorm/data"

const STORAGE_KEY = "navigate-brainstorm"

interface BrainstormState {
  combinations: SavedCombination[]
  nextId: number
}

const defaultState: BrainstormState = {
  combinations: [],
  nextId: 1,
}

function saveToStorage(state: BrainstormState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): BrainstormState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BrainstormState
  } catch {
    return null
  }
}

export const brainstorm = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setCombinations(state, combinations: SavedCombination[]) {
      return { ...state, combinations }
    },

    setNextId(state, nextId: number) {
      return { ...state, nextId }
    },

    setAll(_, loaded: BrainstormState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.brainstorm.setAll(stored)
      }
    },

    add(combination: Omit<SavedCombination, "id">, rootState) {
      const state = rootState.brainstorm
      const newCombination: SavedCombination = {
        ...combination,
        id: state.nextId,
      }
      const nextState: BrainstormState = {
        combinations: [...state.combinations, newCombination],
        nextId: state.nextId + 1,
      }
      dispatch.brainstorm.setCombinations(nextState.combinations)
      dispatch.brainstorm.setNextId(nextState.nextId)
      saveToStorage(nextState)
    },

    update({ id, selections }: { id: number; selections: Record<string, string[]> }, rootState) {
      const state = rootState.brainstorm
      const updated = state.combinations.map((c) =>
        c.id === id
          ? { ...c, selections, savedAt: new Date().toISOString() }
          : c
      )
      const nextState: BrainstormState = { ...state, combinations: updated }
      dispatch.brainstorm.setCombinations(updated)
      saveToStorage(nextState)
    },

    delete(id: number, rootState) {
      const state = rootState.brainstorm
      const remaining = state.combinations.filter((c) => c.id !== id)
      const nextState: BrainstormState = { ...state, combinations: remaining }
      dispatch.brainstorm.setCombinations(remaining)
      saveToStorage(nextState)
    },
  }),
})
