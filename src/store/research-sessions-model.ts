import { createModel } from "@rematch/core"
import type { RootModel } from "."
import { parsePerProject, perProjectReducers, type PerProject, type PerProjectState } from "./per-project"

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

const RESEARCH_STEPS: readonly ResearchStep[] = ["pick", "tool", "capture", "review"]

/**
 * One project's Research drafts: a session per method the user has opened,
 * plus where they last were so the flow can resume. Drafts belong to the
 * project they were started in and never show in another.
 */
export type ResearchProjectState = {
  sessions: Record<string, ResearchSession>
  lastPickedMethodId: string | null
  lastStep: ResearchStep | null
  lastPromptIndex: number
}

export const EMPTY_RESEARCH_PROJECT: ResearchProjectState = {
  sessions: {},
  lastPickedMethodId: null,
  lastStep: null,
  lastPromptIndex: 0,
}

type ResearchSessionsState = PerProjectState<ResearchProjectState>

const defaultState: ResearchSessionsState = {
  byProject: {},
  hydrated: false,
}

/** The Research drafts of one project, empty when it has none. */
export function selectResearchProject(state: { researchSessions: ResearchSessionsState }, projectId: number): ResearchProjectState {
  return state.researchSessions.byProject[projectId] ?? EMPTY_RESEARCH_PROJECT
}

function saveToStorage(byProject: PerProject<ResearchProjectState>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ byProject }))
  } catch {
    // ignore storage errors
  }
}

function parseProjectState(raw: unknown): ResearchProjectState | null {
  if (!raw || typeof raw !== "object") return null
  const value = raw as Partial<ResearchProjectState>
  return {
    sessions: value.sessions && typeof value.sessions === "object" ? value.sessions : {},
    lastPickedMethodId: typeof value.lastPickedMethodId === "string" ? value.lastPickedMethodId : null,
    lastStep: RESEARCH_STEPS.includes(value.lastStep as ResearchStep) ? (value.lastStep as ResearchStep) : null,
    lastPromptIndex: typeof value.lastPromptIndex === "number" && value.lastPromptIndex >= 0 ? value.lastPromptIndex : 0,
  }
}

/** Reads the stored map. Drafts saved before projects existed had no project to belong to and are dropped. */
function loadFromStorage(): PerProject<ResearchProjectState> {
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

function emptyAnswer(): ResearchAnswer {
  return { text: "" }
}

function freshSession(
  sessionId: string,
  toolId: string | null,
  promptIds: string[],
  seedAnswers?: Record<string, ResearchAnswer[]>,
): ResearchSession {
  const answers: Record<string, ResearchAnswer[]> = {}
  for (const id of promptIds) {
    const seeded = seedAnswers?.[id]
    answers[id] = seeded && seeded.length > 0 ? seeded : [emptyAnswer()]
  }
  return { sessionId, toolId, answers }
}

const { update: updateProject, clear: clearProjectSlice } = perProjectReducers(EMPTY_RESEARCH_PROJECT, saveToStorage)

/** Applies a change to one method's session within the project. */
function updateSession(
  project: ResearchProjectState,
  methodId: string,
  change: (session: ResearchSession) => ResearchSession,
): ResearchProjectState {
  const session = project.sessions[methodId]
  if (!session) return project
  return { ...project, sessions: { ...project.sessions, [methodId]: change(session) } }
}

function updateAnswers(
  project: ResearchProjectState,
  methodId: string,
  promptId: string,
  change: (list: ResearchAnswer[]) => ResearchAnswer[],
): ResearchProjectState {
  return updateSession(project, methodId, (session) => ({
    ...session,
    answers: { ...session.answers, [promptId]: change(session.answers[promptId] ?? [emptyAnswer()]) },
  }))
}

export const researchSessions = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setAll(state, byProject: PerProject<ResearchProjectState>): ResearchSessionsState {
      return { ...state, byProject, hydrated: true }
    },

    setLastPosition(
      state,
      payload: { projectId: number; methodId: string | null; step: ResearchStep | null; promptIndex: number }
    ) {
      return updateProject(state, payload, (project, { methodId, step, promptIndex }) => ({
        ...project,
        lastPickedMethodId: methodId,
        lastStep: step,
        lastPromptIndex: promptIndex,
      }))
    },

    /**
     * Creates the method's session if the project has none. `seedAnswers`
     * and `seedToolId` pre-fill it from research already saved against the
     * project's problem, so revisiting the tool starts from what was captured.
     */
    ensureSession(
      state,
      payload: {
        projectId: number
        methodId: string
        sessionId: string
        promptIds: string[]
        seedAnswers?: Record<string, ResearchAnswer[]>
        seedToolId?: string | null
      }
    ) {
      return updateProject(state, payload, (project, { methodId, sessionId, promptIds, seedAnswers, seedToolId }) => {
        if (project.sessions[methodId]) return project
        const session = freshSession(sessionId, seedToolId ?? null, promptIds, seedAnswers)
        return { ...project, sessions: { ...project.sessions, [methodId]: session } }
      })
    },

    setTool(state, payload: { projectId: number; methodId: string; toolId: string | null }) {
      return updateProject(state, payload, (project, { methodId, toolId }) =>
        updateSession(project, methodId, (session) => ({ ...session, toolId })),
      )
    },

    /** Forgets every draft and the last position of one project. */
    clearProject(state, projectId: number): ResearchSessionsState {
      return clearProjectSlice(state, projectId)
    },

    clearSession(state, payload: { projectId: number; methodId: string }) {
      return updateProject(state, payload, (project, { methodId }) => {
        const { [methodId]: _removed, ...rest } = project.sessions
        void _removed
        const wasActive = project.lastPickedMethodId === methodId
        return {
          sessions: rest,
          lastPickedMethodId: wasActive ? null : project.lastPickedMethodId,
          lastStep: wasActive ? null : project.lastStep,
          lastPromptIndex: wasActive ? 0 : project.lastPromptIndex,
        }
      })
    },

    setAnswerText(state, payload: { projectId: number; methodId: string; promptId: string; index: number; text: string }) {
      return updateProject(state, payload, (project, { methodId, promptId, index, text }) =>
        updateAnswers(project, methodId, promptId, (list) => {
          const next = [...list]
          next[index] = { text }
          return next
        }),
      )
    },

    setAnswerSlots(state, payload: { projectId: number; methodId: string; promptId: string; slots: ResearchAnswer[] }) {
      return updateProject(state, payload, (project, { methodId, promptId, slots }) =>
        updateAnswers(project, methodId, promptId, () => (slots.length === 0 ? [emptyAnswer()] : slots)),
      )
    },

    addAnswerSlot(state, payload: { projectId: number; methodId: string; promptId: string }) {
      return updateProject(state, payload, (project, { methodId, promptId }) =>
        updateAnswers(project, methodId, promptId, (list) => [...list, emptyAnswer()]),
      )
    },

    removeAnswerSlot(state, payload: { projectId: number; methodId: string; promptId: string; index: number }) {
      return updateProject(state, payload, (project, { methodId, promptId, index }) =>
        updateAnswers(project, methodId, promptId, (list) => {
          const filtered = list.filter((_, i) => i !== index)
          return filtered.length === 0 ? [emptyAnswer()] : filtered
        }),
      )
    },
  },

  effects: (dispatch) => ({
    init() {
      dispatch.researchSessions.setAll(loadFromStorage())
    },
  }),
})
