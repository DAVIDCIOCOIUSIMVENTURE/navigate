import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { Portfolio, PortfolioActionState } from "@/types/portfolio"
import { DEFAULT_PORTFOLIO_FIELDS } from "@/types/portfolio"

const STORAGE_KEY = "navigate-portfolios"

export type PortfolioPatch = Partial<
  Pick<Portfolio, "title" | "description" | "problemId" | "actions">
>

export type PortfolioCreateInput = {
  title?: string
  description?: string
  problemId?: number | null
  actions?: PortfolioActionState[]
}

interface PortfoliosState {
  portfolios: Portfolio[]
  nextId: number
}

const defaultState: PortfoliosState = {
  portfolios: [],
  nextId: 1,
}

function saveToStorage(state: PortfoliosState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): PortfoliosState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PortfoliosState
    return {
      ...parsed,
      portfolios: parsed.portfolios.map((p) => ({
        ...p,
        problemId: p.problemId ?? null,
        actions: p.actions ?? [],
      })),
    }
  } catch {
    return null
  }
}

export const portfolios = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addPortfolio(state, portfolio: Portfolio) {
      return { ...state, portfolios: [...state.portfolios, portfolio], nextId: state.nextId + 1 }
    },

    removePortfolio(state, id: number) {
      return { ...state, portfolios: state.portfolios.filter((p) => p.id !== id) }
    },

    updatePortfolio(state, { id, patch }: { id: number; patch: PortfolioPatch & { editedAt: string } }) {
      return {
        ...state,
        portfolios: state.portfolios.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }
    },

    setAll(_, loaded: PortfoliosState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.portfolios.setAll(stored)
      }
    },

    update({ id, patch }: { id: number; patch: PortfolioPatch }, rootState) {
      const editedAt = new Date().toISOString()
      dispatch.portfolios.updatePortfolio({ id, patch: { ...patch, editedAt } })
      const updated = rootState.portfolios.portfolios.map((p) =>
        p.id === id ? { ...p, ...patch, editedAt } : p,
      )
      saveToStorage({ portfolios: updated, nextId: rootState.portfolios.nextId })
    },

    create(payload: PortfolioCreateInput, rootState): Portfolio {
      const state = rootState.portfolios
      const now = new Date().toISOString()
      const newPortfolio: Portfolio = {
        id: state.nextId,
        createdAt: now,
        editedAt: now,
        ...DEFAULT_PORTFOLIO_FIELDS,
        title: payload.title ?? DEFAULT_PORTFOLIO_FIELDS.title,
        description: payload.description ?? DEFAULT_PORTFOLIO_FIELDS.description,
        problemId: payload.problemId ?? DEFAULT_PORTFOLIO_FIELDS.problemId,
        actions: payload.actions ?? DEFAULT_PORTFOLIO_FIELDS.actions,
      }
      dispatch.portfolios.addPortfolio(newPortfolio)
      const nextState: PortfoliosState = {
        portfolios: [...state.portfolios, newPortfolio],
        nextId: state.nextId + 1,
      }
      saveToStorage(nextState)
      return newPortfolio
    },

    delete(id: number, rootState) {
      dispatch.portfolios.removePortfolio(id)
      const remaining = rootState.portfolios.portfolios.filter((p) => p.id !== id)
      saveToStorage({ portfolios: remaining, nextId: rootState.portfolios.nextId })
    },
  }),
})

export type { Portfolio }
