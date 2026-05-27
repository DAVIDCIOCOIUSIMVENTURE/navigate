import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-problem-candidates"

export type ProblemCandidate = {
  id: string
  title: string
  lensId: string
  promptId: string
  sessionId: string
  context: Record<string, string>
  createdAt: string
  editedAt: string
  dismissedAt?: string
  promotedToProblemId?: number
}

export type ProblemCandidatePatch = Partial<
  Pick<ProblemCandidate, "title" | "context" | "dismissedAt" | "promotedToProblemId">
>

export type SessionAnswer = {
  promptId: string
  title: string
  context?: Record<string, string>
}

interface ProblemCandidatesState {
  items: ProblemCandidate[]
  hydrated: boolean
}

const defaultState: ProblemCandidatesState = {
  items: [],
  hydrated: false,
}

function saveToStorage(state: ProblemCandidatesState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): ProblemCandidate[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { items?: ProblemCandidate[] }
    return Array.isArray(parsed.items) ? parsed.items : null
  } catch {
    return null
  }
}

function generateCandidateId(): string {
  const slug =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `candidate-${slug}`
}

export const problemCandidates = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addItems(state, items: ProblemCandidate[]) {
      return { ...state, items: [...state.items, ...items] }
    },

    replaceItem(state, item: ProblemCandidate) {
      return {
        ...state,
        items: state.items.map((c) => (c.id === item.id ? item : c)),
      }
    },

    removeItem(state, id: string) {
      return { ...state, items: state.items.filter((c) => c.id !== id) }
    },

    setItems(state, items: ProblemCandidate[]) {
      return { ...state, items, hydrated: true }
    },

    markHydrated(state) {
      return { ...state, hydrated: true }
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.problemCandidates.setItems(stored)
      } else {
        dispatch.problemCandidates.markHydrated()
      }
    },

    bulkCreateForSession(
      { sessionId, lensId, answers }: { sessionId: string; lensId: string; answers: SessionAnswer[] },
      rootState
    ): ProblemCandidate[] {
      const now = new Date().toISOString()
      const created: ProblemCandidate[] = answers
        .filter((a) => a.title.trim().length > 0)
        .map((a) => ({
          id: generateCandidateId(),
          title: a.title.trim(),
          lensId,
          promptId: a.promptId,
          sessionId,
          context: a.context ?? {},
          createdAt: now,
          editedAt: now,
        }))
      if (created.length === 0) return []
      dispatch.problemCandidates.addItems(created)
      saveToStorage({ items: [...rootState.problemCandidates.items, ...created], hydrated: true })
      return created
    },

    update(
      { id, patch }: { id: string; patch: ProblemCandidatePatch },
      rootState
    ) {
      const existing = rootState.problemCandidates.items.find((c) => c.id === id)
      if (!existing) return
      const editedAt = new Date().toISOString()
      const next: ProblemCandidate = { ...existing, ...patch, editedAt }
      dispatch.problemCandidates.replaceItem(next)
      saveToStorage({
        items: rootState.problemCandidates.items.map((c) => (c.id === id ? next : c)),
        hydrated: true,
      })
    },

    dismiss(id: string, rootState) {
      const existing = rootState.problemCandidates.items.find((c) => c.id === id)
      if (!existing) return
      const now = new Date().toISOString()
      const next: ProblemCandidate = { ...existing, dismissedAt: now, editedAt: now }
      dispatch.problemCandidates.replaceItem(next)
      saveToStorage({
        items: rootState.problemCandidates.items.map((c) => (c.id === id ? next : c)),
        hydrated: true,
      })
    },

    restore(id: string, rootState) {
      const existing = rootState.problemCandidates.items.find((c) => c.id === id)
      if (!existing) return
      const now = new Date().toISOString()
      const { dismissedAt: _dismissedAt, ...rest } = existing
      void _dismissedAt
      const next: ProblemCandidate = { ...rest, editedAt: now }
      dispatch.problemCandidates.replaceItem(next)
      saveToStorage({
        items: rootState.problemCandidates.items.map((c) => (c.id === id ? next : c)),
        hydrated: true,
      })
    },

    async promote(id: string, rootState): Promise<number | null> {
      const existing = rootState.problemCandidates.items.find((c) => c.id === id)
      if (!existing || existing.promotedToProblemId != null) return null
      const newProblem = await dispatch.problems.create({
        source: "reflect",
        title: existing.title,
      })
      const now = new Date().toISOString()
      const next: ProblemCandidate = {
        ...existing,
        promotedToProblemId: newProblem.id,
        editedAt: now,
      }
      dispatch.problemCandidates.replaceItem(next)
      saveToStorage({
        items: rootState.problemCandidates.items.map((c) => (c.id === id ? next : c)),
        hydrated: true,
      })
      return newProblem.id
    },

    delete(id: string, rootState) {
      dispatch.problemCandidates.removeItem(id)
      saveToStorage({
        items: rootState.problemCandidates.items.filter((c) => c.id !== id),
        hydrated: true,
      })
    },
  }),
})
