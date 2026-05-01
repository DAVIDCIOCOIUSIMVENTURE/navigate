import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-self-discovery-items"

export interface SelfDiscoveryItem {
  id: string
  title: string
  questionUrl: string
  suggestionId?: string
}

interface SelfDiscoveryItemsState {
  items: SelfDiscoveryItem[]
}

const defaultState: SelfDiscoveryItemsState = {
  items: [],
}

function saveToStorage(state: SelfDiscoveryItemsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function generateItemId(): string {
  return `you-user-${crypto.randomUUID().slice(0, 8)}`
}

export const selfDiscoveryItems = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addItem(state, payload: { title: string; questionUrl: string; suggestionId?: string }) {
      const next = {
        ...state,
        items: [
          ...state.items,
          {
            id: generateItemId(),
            title: payload.title,
            questionUrl: payload.questionUrl,
            ...(payload.suggestionId ? { suggestionId: payload.suggestionId } : {}),
          },
        ],
      }
      saveToStorage(next)
      return next
    },

    removeItem(state, id: string) {
      const next = { ...state, items: state.items.filter((t) => t.id !== id) }
      saveToStorage(next)
      return next
    },

    setItems(state, items: SelfDiscoveryItem[]) {
      return { ...state, items }
    },
  },

  effects: (dispatch) => ({
    init() {
      if (typeof window === "undefined") return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const stored: Partial<SelfDiscoveryItemsState> = JSON.parse(raw)
        if (Array.isArray(stored.items)) {
          dispatch.selfDiscoveryItems.setItems(stored.items)
        }
      } catch {
        // ignore parse errors
      }
    },
  }),
})
