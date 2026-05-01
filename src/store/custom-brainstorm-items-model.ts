import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-custom-brainstorm-items"

export interface CustomBrainstormItem {
  id: string
  label: string
  createdAt: string
}

export type CustomBrainstormColumnId = "customers" | "contexts" | "problems"

interface CustomBrainstormItemsState {
  byColumn: Record<string, CustomBrainstormItem[]>
}

const defaultState: CustomBrainstormItemsState = {
  byColumn: {
    customers: [],
    contexts: [],
    problems: [],
    // The "you" column is filled by self-discovery items, not custom items.
    you: [],
  },
}

function saveToStorage(state: CustomBrainstormItemsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

const COLUMN_SINGULAR: Record<string, string> = {
  customers: "customer",
  contexts: "context",
  problems: "problem",
  you: "you",
}

export function generateCustomItemId(columnId: string): string {
  const singular = COLUMN_SINGULAR[columnId] ?? columnId
  return `${singular}-user-${crypto.randomUUID().slice(0, 8)}`
}

export const customBrainstormItems = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addItem(
      state,
      payload: { columnId: string; item: CustomBrainstormItem }
    ) {
      const existing = state.byColumn[payload.columnId] ?? []
      const next: CustomBrainstormItemsState = {
        ...state,
        byColumn: {
          ...state.byColumn,
          [payload.columnId]: [...existing, payload.item],
        },
      }
      saveToStorage(next)
      return next
    },

    renameItem(
      state,
      payload: { columnId: string; id: string; label: string }
    ) {
      const existing = state.byColumn[payload.columnId] ?? []
      const next: CustomBrainstormItemsState = {
        ...state,
        byColumn: {
          ...state.byColumn,
          [payload.columnId]: existing.map((i) =>
            i.id === payload.id ? { ...i, label: payload.label } : i
          ),
        },
      }
      saveToStorage(next)
      return next
    },

    removeItem(state, payload: { columnId: string; id: string }) {
      const existing = state.byColumn[payload.columnId] ?? []
      const next: CustomBrainstormItemsState = {
        ...state,
        byColumn: {
          ...state.byColumn,
          [payload.columnId]: existing.filter((i) => i.id !== payload.id),
        },
      }
      saveToStorage(next)
      return next
    },

    setAll(_, loaded: CustomBrainstormItemsState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      if (typeof window === "undefined") return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const stored = JSON.parse(raw) as Partial<CustomBrainstormItemsState>
        if (stored.byColumn && typeof stored.byColumn === "object") {
          dispatch.customBrainstormItems.setAll({
            byColumn: {
              customers: stored.byColumn.customers ?? [],
              contexts: stored.byColumn.contexts ?? [],
              problems: stored.byColumn.problems ?? [],
              you: stored.byColumn.you ?? [],
            },
          })
        }
      } catch {
        // ignore parse errors
      }
    },

    // Helper effect that mints an id, dispatches the add, and returns the new id
    // so callers can immediately tick the item.
    create(payload: { columnId: string; label: string }): CustomBrainstormItem {
      const item: CustomBrainstormItem = {
        id: generateCustomItemId(payload.columnId),
        label: payload.label,
        createdAt: new Date().toISOString(),
      }
      dispatch.customBrainstormItems.addItem({ columnId: payload.columnId, item })
      return item
    },
  }),
})
