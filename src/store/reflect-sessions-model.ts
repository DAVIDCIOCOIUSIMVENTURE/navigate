import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-reflect-sessions"

export type ReflectAnswer = {
  text: string
  context: Record<string, string>
}

export type ReflectSession = {
  sessionId: string
  answers: Record<string, ReflectAnswer[]>
}

interface ReflectSessionsState {
  sessions: Record<string, ReflectSession>
  hydrated: boolean
}

const defaultState: ReflectSessionsState = {
  sessions: {},
  hydrated: false,
}

function saveToStorage(state: ReflectSessionsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: state.sessions }))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): Record<string, ReflectSession> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { sessions?: Record<string, ReflectSession> }
    return parsed.sessions ?? null
  } catch {
    return null
  }
}

function emptyAnswer(): ReflectAnswer {
  return { text: "", context: {} }
}

export const reflectSessions = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setAllSessions(state, sessions: Record<string, ReflectSession>) {
      return { ...state, sessions, hydrated: true }
    },

    markHydrated(state) {
      return { ...state, hydrated: true }
    },

    ensureSession(
      state,
      payload: { lensId: string; sessionId: string; promptIds: string[] }
    ) {
      if (state.sessions[payload.lensId]) return state
      const answers: Record<string, ReflectAnswer[]> = {}
      for (const id of payload.promptIds) answers[id] = [emptyAnswer()]
      const next: ReflectSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.lensId]: { sessionId: payload.sessionId, answers },
        },
      }
      saveToStorage(next)
      return next
    },

    resetSession(
      state,
      payload: { lensId: string; sessionId: string; promptIds: string[] }
    ) {
      const answers: Record<string, ReflectAnswer[]> = {}
      for (const id of payload.promptIds) answers[id] = [emptyAnswer()]
      const next: ReflectSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.lensId]: { sessionId: payload.sessionId, answers },
        },
      }
      saveToStorage(next)
      return next
    },

    clearSession(state, lensId: string) {
      const { [lensId]: _removed, ...rest } = state.sessions
      void _removed
      const next: ReflectSessionsState = { ...state, sessions: rest }
      saveToStorage(next)
      return next
    },

    setAnswerText(
      state,
      payload: { lensId: string; promptId: string; index: number; text: string }
    ) {
      const session = state.sessions[payload.lensId]
      if (!session) return state
      const list = session.answers[payload.promptId] ?? [emptyAnswer()]
      const nextList = [...list]
      nextList[payload.index] = {
        ...(nextList[payload.index] ?? emptyAnswer()),
        text: payload.text,
      }
      const next: ReflectSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.lensId]: {
            ...session,
            answers: { ...session.answers, [payload.promptId]: nextList },
          },
        },
      }
      saveToStorage(next)
      return next
    },

    setAnswerContext(
      state,
      payload: {
        lensId: string
        promptId: string
        index: number
        fieldId: string
        value: string
      }
    ) {
      const session = state.sessions[payload.lensId]
      if (!session) return state
      const list = session.answers[payload.promptId] ?? [emptyAnswer()]
      const nextList = [...list]
      const slot = nextList[payload.index] ?? emptyAnswer()
      nextList[payload.index] = {
        ...slot,
        context: { ...slot.context, [payload.fieldId]: payload.value },
      }
      const next: ReflectSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.lensId]: {
            ...session,
            answers: { ...session.answers, [payload.promptId]: nextList },
          },
        },
      }
      saveToStorage(next)
      return next
    },

    addAnswerSlot(state, payload: { lensId: string; promptId: string }) {
      const session = state.sessions[payload.lensId]
      if (!session) return state
      const list = session.answers[payload.promptId] ?? []
      const next: ReflectSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.lensId]: {
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

    setAnswerSlots(
      state,
      payload: { lensId: string; promptId: string; slots: ReflectAnswer[] }
    ) {
      const session = state.sessions[payload.lensId]
      if (!session) return state
      const finalList =
        payload.slots.length === 0 ? [emptyAnswer()] : payload.slots
      const next: ReflectSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.lensId]: {
            ...session,
            answers: { ...session.answers, [payload.promptId]: finalList },
          },
        },
      }
      saveToStorage(next)
      return next
    },

    removeAnswerSlot(
      state,
      payload: { lensId: string; promptId: string; index: number }
    ) {
      const session = state.sessions[payload.lensId]
      if (!session) return state
      const list = session.answers[payload.promptId] ?? []
      const filtered = list.filter((_, i) => i !== payload.index)
      const finalList = filtered.length === 0 ? [emptyAnswer()] : filtered
      const next: ReflectSessionsState = {
        ...state,
        sessions: {
          ...state.sessions,
          [payload.lensId]: {
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
        dispatch.reflectSessions.setAllSessions(stored)
      } else {
        dispatch.reflectSessions.markHydrated()
      }
    },
  }),
})
