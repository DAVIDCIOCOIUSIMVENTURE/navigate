import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-research-sessions"

export type ResearchAnswer = {
  text: string
}

export type ResearchSession = {
  sessionId: string
  toolId: string | null
  answers: Record<string, ResearchAnswer[]>
}

export type ResearchStep = "pick" | "tool" | "capture" | "review"

interface ResearchSessionsState {
  sessions: Record<string, ResearchSession>
  lastPickedMethodId: string | null
  lastStep: ResearchStep | null
  lastPromptIndex: number
  hydrated: boolean
}

const defaultState: ResearchSessionsState = {
  sessions: {},
  lastPickedMethodId: null,
  lastStep: null,
  lastPromptIndex: 0,
  hydrated: false,
}

function saveToStorage(state: ResearchSessionsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessions: state.sessions,
        lastPickedMethodId: state.lastPickedMethodId,
        lastStep: state.lastStep,
        lastPromptIndex: state.lastPromptIndex,
      })
    )
  } catch {
    // ignore storage errors
  }
}

type StoredShape = {
  sessions?: Record<string, ResearchSession>
  lastPickedMethodId?: string | null
  lastStep?: ResearchStep | null
  lastPromptIndex?: number
}

function loadFromStorage(): StoredShape | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredShape
  } catch {
    return null
  }
}

function emptyAnswer(): ResearchAnswer {
  return { text: "" }
}

export const researchSessions = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setAllSessions(
      state,
      payload: {
        sessions: Record<string, ResearchSession>
        lastPickedMethodId: string | null
        lastStep: ResearchStep | null
        lastPromptIndex: number
      }
    ) {
      return {
        ...state,
        sessions: payload.sessions,
        lastPickedMethodId: payload.lastPickedMethodId,
        lastStep: payload.lastStep,
        lastPromptIndex: payload.lastPromptIndex,
        hydrated: true,
      }
    },

    markHydrated(state) {
      return { ...state, hydrated: true }
    },

    setLastPosition(
      state,
      payload: { methodId: string | null; step: ResearchStep | null; promptIndex: number }
    ) {
      const next: ResearchSessionsState = {
        ...state,
        lastPickedMethodId: payload.methodId,
        lastStep: payload.step,
        lastPromptIndex: payload.promptIndex,
      }
      saveToStorage(next)
      return next
    },

    ensureSession(
      state,
      payload: { methodId: string; sessionId: string; promptIds: string[] }
    ) {
      if (state.sessions[payload.methodId]) return state
      const answers: Record<string, ResearchAnswer[]> = {}
      for (const id of payload.promptIds) answers[id] = [emptyAnswer()]
      const next: ResearchSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.methodId]: { sessionId: payload.sessionId, toolId: null, answers },
        },
      }
      saveToStorage(next)
      return next
    },

    setTool(state, payload: { methodId: string; toolId: string | null }) {
      const session = state.sessions[payload.methodId]
      if (!session) return state
      const next: ResearchSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.methodId]: { ...session, toolId: payload.toolId },
        },
      }
      saveToStorage(next)
      return next
    },

    clearAllSessions(state) {
      const next: ResearchSessionsState = {
        ...state,
        sessions: {},
        lastPickedMethodId: null,
        lastStep: null,
        lastPromptIndex: 0,
      }
      saveToStorage(next)
      return next
    },

    clearSession(state, methodId: string) {
      const { [methodId]: _removed, ...rest } = state.sessions
      void _removed
      const wasActive = state.lastPickedMethodId === methodId
      const next: ResearchSessionsState = {
        ...state,
        sessions: rest,
        lastPickedMethodId: wasActive ? null : state.lastPickedMethodId,
        lastStep: wasActive ? null : state.lastStep,
        lastPromptIndex: wasActive ? 0 : state.lastPromptIndex,
      }
      saveToStorage(next)
      return next
    },

    setAnswerText(
      state,
      payload: { methodId: string; promptId: string; index: number; text: string }
    ) {
      const session = state.sessions[payload.methodId]
      if (!session) return state
      const list = session.answers[payload.promptId] ?? [emptyAnswer()]
      const nextList = [...list]
      nextList[payload.index] = { text: payload.text }
      const next: ResearchSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.methodId]: {
            ...session,
            answers: { ...session.answers, [payload.promptId]: nextList },
          },
        },
      }
      saveToStorage(next)
      return next
    },

    setAnswerSlots(
      state,
      payload: { methodId: string; promptId: string; slots: ResearchAnswer[] }
    ) {
      const session = state.sessions[payload.methodId]
      if (!session) return state
      const finalList = payload.slots.length === 0 ? [emptyAnswer()] : payload.slots
      const next: ResearchSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.methodId]: {
            ...session,
            answers: { ...session.answers, [payload.promptId]: finalList },
          },
        },
      }
      saveToStorage(next)
      return next
    },

    addAnswerSlot(state, payload: { methodId: string; promptId: string }) {
      const session = state.sessions[payload.methodId]
      if (!session) return state
      const list = session.answers[payload.promptId] ?? []
      const next: ResearchSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.methodId]: {
            ...session,
            answers: {
              ...session.answers,
              [payload.promptId]: [...list, emptyAnswer()],
            },
          },
        },
      }
      saveToStorage(next)
      return next
    },

    removeAnswerSlot(
      state,
      payload: { methodId: string; promptId: string; index: number }
    ) {
      const session = state.sessions[payload.methodId]
      if (!session) return state
      const list = session.answers[payload.promptId] ?? []
      const filtered = list.filter((_, i) => i !== payload.index)
      const finalList = filtered.length === 0 ? [emptyAnswer()] : filtered
      const next: ResearchSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.methodId]: {
            ...session,
            answers: { ...session.answers, [payload.promptId]: finalList },
          },
        },
      }
      saveToStorage(next)
      return next
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.researchSessions.setAllSessions({
          sessions: stored.sessions ?? {},
          lastPickedMethodId: stored.lastPickedMethodId ?? null,
          lastStep: stored.lastStep ?? null,
          lastPromptIndex: stored.lastPromptIndex ?? 0,
        })
      } else {
        dispatch.researchSessions.markHydrated()
      }
    },
  }),
})
