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

export type ReflectStep = "pick" | "introduction" | "prompts" | "review"

interface ReflectSessionsState {
  sessions: Record<string, ReflectSession>
  lastPickedLensId: string | null
  lastStep: ReflectStep | null
  lastPromptIndex: number
  hydrated: boolean
}

const defaultState: ReflectSessionsState = {
  sessions: {},
  lastPickedLensId: null,
  lastStep: null,
  lastPromptIndex: 0,
  hydrated: false,
}

function saveToStorage(state: ReflectSessionsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessions: state.sessions,
        lastPickedLensId: state.lastPickedLensId,
        lastStep: state.lastStep,
        lastPromptIndex: state.lastPromptIndex,
      })
    )
  } catch {
    // ignore storage errors
  }
}

type StoredShape = {
  sessions?: Record<string, ReflectSession>
  lastPickedLensId?: string | null
  lastStep?: ReflectStep | null
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

function emptyAnswer(): ReflectAnswer {
  return { text: "", context: {} }
}

export const reflectSessions = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setAllSessions(
      state,
      payload: {
        sessions: Record<string, ReflectSession>
        lastPickedLensId: string | null
        lastStep: ReflectStep | null
        lastPromptIndex: number
      }
    ) {
      return {
        ...state,
        sessions: payload.sessions,
        lastPickedLensId: payload.lastPickedLensId,
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
      payload: {
        lensId: string | null
        step: ReflectStep | null
        promptIndex: number
      }
    ) {
      const next: ReflectSessionsState = {
        ...state,
        lastPickedLensId: payload.lensId,
        lastStep: payload.step,
        lastPromptIndex: payload.promptIndex,
      }
      saveToStorage(next)
      return next
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

    clearAllSessions(state) {
      const next: ReflectSessionsState = {
        ...state,
        sessions: {},
        lastPickedLensId: null,
        lastStep: null,
        lastPromptIndex: 0,
      }
      saveToStorage(next)
      return next
    },

    clearSession(state, lensId: string) {
      const { [lensId]: _removed, ...rest } = state.sessions
      void _removed
      const wasActive = state.lastPickedLensId === lensId
      const next: ReflectSessionsState = {
        ...state,
        sessions: rest,
        lastPickedLensId: wasActive ? null : state.lastPickedLensId,
        lastStep: wasActive ? null : state.lastStep,
        lastPromptIndex: wasActive ? 0 : state.lastPromptIndex,
      }
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
        dispatch.reflectSessions.setAllSessions({
          sessions: stored.sessions ?? {},
          lastPickedLensId: stored.lastPickedLensId ?? null,
          lastStep: stored.lastStep ?? null,
          lastPromptIndex: stored.lastPromptIndex ?? 0,
        })
      } else {
        dispatch.reflectSessions.markHydrated()
      }
    },
  }),
})
