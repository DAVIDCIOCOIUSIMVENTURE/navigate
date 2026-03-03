import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { Idea } from "@/types/idea"
import { DEFAULT_CUSTOMER, DEFAULT_SUB_SEGMENT } from "@/types/idea"

const STORAGE_KEY = "navigate-ideas"

interface IdeasState {
  ideas: Idea[]
  nextId: number
}

const defaultState: IdeasState = {
  ideas: [],
  nextId: 1,
}

function saveToStorage(state: IdeasState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): IdeasState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as IdeasState
  } catch {
    return null
  }
}

export const ideas = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addIdea(state, idea: Idea) {
      return { ...state, ideas: [...state.ideas, idea], nextId: state.nextId + 1 }
    },

    applyUpdate(state, { id, patch }: { id: number; patch: Partial<Idea> }) {
      return {
        ...state,
        ideas: state.ideas.map((idea) =>
          idea.id === id
            ? { ...idea, ...patch, updatedAt: new Date().toISOString() }
            : idea
        ),
      }
    },

    removeIdea(state, id: number) {
      return { ...state, ideas: state.ideas.filter((idea) => idea.id !== id) }
    },

    setAll(_, loaded: IdeasState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.ideas.setAll(stored)
      }
    },

    create(mode: "guided" | "quickstart", rootState): Idea {
      const state = rootState.ideas
      const now = new Date().toISOString()
      const newIdea: Idea = {
        id: state.nextId,
        title: `Idea ${state.ideas.length + 1}`,
        createdAt: now,
        updatedAt: now,
        mode,
        customer: { ...DEFAULT_CUSTOMER },
        subSegment: { ...DEFAULT_SUB_SEGMENT },
        jobs: [],
        selectedProblemId: null,
        problemDiscoveryComplete: false,
        problemValidationComplete: false,
      }
      dispatch.ideas.addIdea(newIdea)
      const nextState: IdeasState = {
        ideas: [...state.ideas, newIdea],
        nextId: state.nextId + 1,
      }
      saveToStorage(nextState)
      return newIdea
    },

    update({ id, patch }: { id: number; patch: Partial<Idea> }, rootState) {
      dispatch.ideas.applyUpdate({ id, patch })
      const updatedIdeas = rootState.ideas.ideas.map((idea) =>
        idea.id === id
          ? { ...idea, ...patch, updatedAt: new Date().toISOString() }
          : idea
      )
      saveToStorage({ ideas: updatedIdeas, nextId: rootState.ideas.nextId })
    },

    delete(id: number, rootState) {
      dispatch.ideas.removeIdea(id)
      const remainingIdeas = rootState.ideas.ideas.filter((idea) => idea.id !== id)
      saveToStorage({ ideas: remainingIdeas, nextId: rootState.ideas.nextId })
    },
  }),
})
