import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-problem-triggers"

export interface ProblemTrigger {
  id: string
  title: string
  questionUrl: string
  suggestionId?: string
}

interface ProblemTriggersState {
  triggers: ProblemTrigger[]
}

const defaultState: ProblemTriggersState = {
  triggers: [],
}

function saveToStorage(state: ProblemTriggersState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

export const problemTriggers = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addTrigger(state, payload: { title: string; questionUrl: string; suggestionId?: string }) {
      const next = {
        ...state,
        triggers: [
          ...state.triggers,
          { id: crypto.randomUUID(), title: payload.title, questionUrl: payload.questionUrl, ...(payload.suggestionId ? { suggestionId: payload.suggestionId } : {}) },
        ],
      }
      saveToStorage(next)
      return next
    },

    removeTrigger(state, id: string) {
      const next = { ...state, triggers: state.triggers.filter((t) => t.id !== id) }
      saveToStorage(next)
      return next
    },

    setTriggers(state, triggers: ProblemTrigger[]) {
      return { ...state, triggers }
    },
  },

  effects: (dispatch) => ({
    init() {
      if (typeof window === "undefined") return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const stored: Partial<ProblemTriggersState> = JSON.parse(raw)
        if (Array.isArray(stored.triggers)) {
          dispatch.problemTriggers.setTriggers(stored.triggers)
        }
      } catch {
        // ignore parse errors
      }
    },
  }),
})
