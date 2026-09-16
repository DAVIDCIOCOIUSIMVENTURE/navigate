import { createModel } from "@rematch/core"
import type { RootModel } from "."
import { parsePerProject, perProjectReducers, type PerProject, type PerProjectState } from "./per-project"

const STORAGE_KEY = "navigate-reflect-sessions"

export type ReflectAnswer = {
  text: string
  context: Record<string, string>
}

export type ReflectSession = {
  sessionId: string
  answers: Record<string, ReflectAnswer[]>
}

export type ReflectStep = "pick" | "prompts" | "review"

const REFLECT_STEPS: readonly ReflectStep[] = ["pick", "prompts", "review"]

/**
 * One project's Reflect drafts: a session per lens the user has opened, plus
 * where they last were so the flow can resume. Drafts belong to the project
 * they were started in and never show in another.
 */
export type ReflectProjectState = {
  sessions: Record<string, ReflectSession>
  lastPickedLensId: string | null
  lastStep: ReflectStep | null
  lastPromptIndex: number
}

export const EMPTY_REFLECT_PROJECT: ReflectProjectState = {
  sessions: {},
  lastPickedLensId: null,
  lastStep: null,
  lastPromptIndex: 0,
}

type ReflectSessionsState = PerProjectState<ReflectProjectState>

const defaultState: ReflectSessionsState = {
  byProject: {},
  hydrated: false,
}

/** The Reflect drafts of one project, empty when it has none. */
export function selectReflectProject(state: { reflectSessions: ReflectSessionsState }, projectId: number): ReflectProjectState {
  return state.reflectSessions.byProject[projectId] ?? EMPTY_REFLECT_PROJECT
}

function saveToStorage(byProject: PerProject<ReflectProjectState>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ byProject }))
  } catch {
    // ignore storage errors
  }
}

function parseProjectState(raw: unknown): ReflectProjectState | null {
  if (!raw || typeof raw !== "object") return null
  const value = raw as Partial<ReflectProjectState>
  return {
    sessions: value.sessions && typeof value.sessions === "object" ? value.sessions : {},
    lastPickedLensId: typeof value.lastPickedLensId === "string" ? value.lastPickedLensId : null,
    lastStep: REFLECT_STEPS.includes(value.lastStep as ReflectStep) ? (value.lastStep as ReflectStep) : null,
    lastPromptIndex: typeof value.lastPromptIndex === "number" && value.lastPromptIndex >= 0 ? value.lastPromptIndex : 0,
  }
}

/** Reads the stored map. Drafts saved before projects existed had no project to belong to and are dropped. */
function loadFromStorage(): PerProject<ReflectProjectState> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { byProject?: unknown }
    return parsePerProject(parsed.byProject, parseProjectState)
  } catch {
    return {}
  }
}

function emptyAnswer(): ReflectAnswer {
  return { text: "", context: {} }
}

const { update: updateProject, clear: clearProjectSlice } = perProjectReducers(EMPTY_REFLECT_PROJECT, saveToStorage)

/** Applies a change to one lens's answers within the project. */
function updateAnswers(
  project: ReflectProjectState,
  lensId: string,
  promptId: string,
  change: (list: ReflectAnswer[]) => ReflectAnswer[],
): ReflectProjectState {
  const session = project.sessions[lensId]
  if (!session) return project
  const list = session.answers[promptId] ?? [emptyAnswer()]
  return {
    ...project,
    sessions: {
      ...project.sessions,
      [lensId]: { ...session, answers: { ...session.answers, [promptId]: change(list) } },
    },
  }
}

function freshSession(sessionId: string, promptIds: string[], seedAnswers?: Record<string, ReflectAnswer[]>): ReflectSession {
  const answers: Record<string, ReflectAnswer[]> = {}
  for (const id of promptIds) {
    const seeded = seedAnswers?.[id]
    answers[id] = seeded && seeded.length > 0 ? seeded : [emptyAnswer()]
  }
  return { sessionId, answers }
}

export const reflectSessions = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setAll(state, byProject: PerProject<ReflectProjectState>): ReflectSessionsState {
      return { ...state, byProject, hydrated: true }
    },

    setLastPosition(
      state,
      payload: { projectId: number; lensId: string | null; step: ReflectStep | null; promptIndex: number }
    ) {
      return updateProject(state, payload, (project, { lensId, step, promptIndex }) => ({
        ...project,
        lastPickedLensId: lensId,
        lastStep: step,
        lastPromptIndex: promptIndex,
      }))
    },

    /**
     * Creates the lens's session if the project has none. `seedAnswers`
     * pre-fills prompts from a problem already saved with this lens, so
     * revisiting the tool for the project's problem starts from what was
     * captured.
     */
    ensureSession(
      state,
      payload: { projectId: number; lensId: string; sessionId: string; promptIds: string[]; seedAnswers?: Record<string, ReflectAnswer[]> }
    ) {
      return updateProject(state, payload, (project, { lensId, sessionId, promptIds, seedAnswers }) => {
        if (project.sessions[lensId]) return project
        return { ...project, sessions: { ...project.sessions, [lensId]: freshSession(sessionId, promptIds, seedAnswers) } }
      })
    },

    /** Forgets every draft and the last position of one project. */
    clearProject(state, projectId: number): ReflectSessionsState {
      return clearProjectSlice(state, projectId)
    },

    clearSession(state, payload: { projectId: number; lensId: string }) {
      return updateProject(state, payload, (project, { lensId }) => {
        const { [lensId]: _removed, ...rest } = project.sessions
        void _removed
        const wasActive = project.lastPickedLensId === lensId
        return {
          sessions: rest,
          lastPickedLensId: wasActive ? null : project.lastPickedLensId,
          lastStep: wasActive ? null : project.lastStep,
          lastPromptIndex: wasActive ? 0 : project.lastPromptIndex,
        }
      })
    },

    setAnswerText(state, payload: { projectId: number; lensId: string; promptId: string; index: number; text: string }) {
      return updateProject(state, payload, (project, { lensId, promptId, index, text }) =>
        updateAnswers(project, lensId, promptId, (list) => {
          const next = [...list]
          next[index] = { ...(next[index] ?? emptyAnswer()), text }
          return next
        }),
      )
    },

    setAnswerContext(
      state,
      payload: { projectId: number; lensId: string; promptId: string; index: number; fieldId: string; value: string }
    ) {
      return updateProject(state, payload, (project, { lensId, promptId, index, fieldId, value }) =>
        updateAnswers(project, lensId, promptId, (list) => {
          const next = [...list]
          const slot = next[index] ?? emptyAnswer()
          next[index] = { ...slot, context: { ...slot.context, [fieldId]: value } }
          return next
        }),
      )
    },

    addAnswerSlot(state, payload: { projectId: number; lensId: string; promptId: string }) {
      return updateProject(state, payload, (project, { lensId, promptId }) =>
        updateAnswers(project, lensId, promptId, (list) => [...list, emptyAnswer()]),
      )
    },

    setAnswerSlots(state, payload: { projectId: number; lensId: string; promptId: string; slots: ReflectAnswer[] }) {
      return updateProject(state, payload, (project, { lensId, promptId, slots }) =>
        updateAnswers(project, lensId, promptId, () => (slots.length === 0 ? [emptyAnswer()] : slots)),
      )
    },

    removeAnswerSlot(state, payload: { projectId: number; lensId: string; promptId: string; index: number }) {
      return updateProject(state, payload, (project, { lensId, promptId, index }) =>
        updateAnswers(project, lensId, promptId, (list) => {
          const filtered = list.filter((_, i) => i !== index)
          return filtered.length === 0 ? [emptyAnswer()] : filtered
        }),
      )
    },
  },

  effects: (dispatch) => ({
    init() {
      dispatch.reflectSessions.setAll(loadFromStorage())
    },
  }),
})
