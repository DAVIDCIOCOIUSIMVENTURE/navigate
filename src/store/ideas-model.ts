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
    // Called after create — appends the idea and advances nextId
    addIdea(state, idea: Idea) {
      return { ...state, ideas: [...state.ideas, idea], nextId: state.nextId + 1 }
    },

    // Called after update — merges patch into the matching idea
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

    // Called after delete — removes the idea by id
    removeIdea(state, id: number) {
      return { ...state, ideas: state.ideas.filter((idea) => idea.id !== id) }
    },

    // Called by init — replaces entire state from storage
    setAll(_, loaded: IdeasState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    // Load persisted ideas from localStorage on app mount
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.ideas.setAll(stored)
      }
    },

    // Build + persist a new idea; returns the idea so callers can navigate immediately
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
        problems: [],
        validations: [],
        selectedProblemId: null,
        problemDiscoveryComplete: false,
        problemValidationComplete: false,
      }
      dispatch.ideas.addIdea(newIdea)
      // Persist after reducer runs — nextId will be incremented in the new state
      const nextState: IdeasState = {
        ideas: [...state.ideas, newIdea],
        nextId: state.nextId + 1,
      }
      saveToStorage(nextState)
      return newIdea
    },

    // Persist an update; the reducer applies the patch to state
    update({ id, patch }: { id: number; patch: Partial<Idea> }, rootState) {
      dispatch.ideas.applyUpdate({ id, patch })
      const updatedIdeas = rootState.ideas.ideas.map((idea) =>
        idea.id === id
          ? { ...idea, ...patch, updatedAt: new Date().toISOString() }
          : idea
      )
      saveToStorage({ ideas: updatedIdeas, nextId: rootState.ideas.nextId })
    },

    // Remove an idea and persist
    delete(id: number, rootState) {
      dispatch.ideas.removeIdea(id)
      const remainingIdeas = rootState.ideas.ideas.filter((idea) => idea.id !== id)
      saveToStorage({ ideas: remainingIdeas, nextId: rootState.ideas.nextId })
    },
  }),
})
