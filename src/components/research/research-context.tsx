"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import type { ResearchMethod } from "@/data/researchMethods"
import { selectResearchProject, type ResearchAnswer } from "@/store/research-sessions-model"
import type { ResearchCapture } from "@/types/research"

export type { ResearchAnswer }

/** Turns the research saved against a problem back into session answers for the same method. */
function answersFromCapture(method: ResearchMethod, capture: ResearchCapture): Record<string, ResearchAnswer[]> {
  if (capture.methodId !== method.id) return {}
  const out: Record<string, ResearchAnswer[]> = {}
  for (const entry of capture.prompts) {
    out[entry.promptId] = entry.answers.map((text) => ({ text }))
  }
  return out
}

type ResearchContextValue = {
  method: ResearchMethod
  toolId: string | null
  answers: Record<string, ResearchAnswer[]>
  setTool: (toolId: string | null) => void
  setAnswerText: (promptId: string, index: number, text: string) => void
  setAnswerSlots: (promptId: string, slots: ResearchAnswer[]) => void
  addAnswerSlot: (promptId: string) => void
  removeAnswerSlot: (promptId: string, index: number) => void
  /** Drops the draft once its problem has been saved. */
  clearSession: () => void
}

const ResearchContext = createContext<ResearchContextValue | null>(null)

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `session-${crypto.randomUUID().slice(0, 8)}`
  }
  return `session-${Math.random().toString(36).slice(2, 10)}`
}

function emptyAnswer(): ResearchAnswer {
  return { text: "" }
}

function initialAnswers(method: ResearchMethod): Record<string, ResearchAnswer[]> {
  const out: Record<string, ResearchAnswer[]> = {}
  for (const prompt of method.prompts) {
    out[prompt.id] = [emptyAnswer()]
  }
  return out
}

/**
 * The Research session for one method inside one project. Every read and
 * write goes to the `researchSessions` model under the project's id, so a
 * draft started in one project never appears in another.
 */
export function ResearchProvider({
  projectId,
  method,
  seed = null,
  children,
}: {
  projectId: number
  method: ResearchMethod
  /** The research already saved against the project's problem; pre-fills a fresh session for the same method. */
  seed?: ResearchCapture | null
  children: ReactNode
}) {
  const dispatch = useDispatch<AppDispatch>()
  const hydrated = useSelector((s: RootState) => s.researchSessions.hydrated)
  const session = useSelector((s: RootState) => selectResearchProject(s, projectId).sessions[method.id])

  /**
   * The method whose session this provider has already opened. Saving the
   * problem clears the draft, and the project then holds that problem, so
   * without this the effect would immediately build the draft again from
   * what was just saved. Keyed by method so switching method still opens one.
   */
  const openedForMethod = useRef<string | null>(null)
  useEffect(() => {
    if (!hydrated) return
    if (session || openedForMethod.current === method.id) return
    openedForMethod.current = method.id
    const seeded = seed && seed.methodId === method.id ? seed : null
    dispatch.researchSessions.ensureSession({
      projectId,
      methodId: method.id,
      sessionId: createSessionId(),
      promptIds: method.prompts.map((p) => p.id),
      seedAnswers: seeded ? answersFromCapture(method, seeded) : undefined,
      seedToolId: seeded?.toolId ?? null,
    })
  }, [hydrated, session, dispatch, projectId, method, seed])

  const toolId = session?.toolId ?? null
  const answers = session?.answers ?? initialAnswers(method)
  const methodId = method.id

  const setTool = useCallback(
    (next: string | null) => {
      dispatch.researchSessions.setTool({ projectId, methodId, toolId: next })
    },
    [dispatch, projectId, methodId]
  )

  const setAnswerText = useCallback(
    (promptId: string, index: number, text: string) => {
      dispatch.researchSessions.setAnswerText({ projectId, methodId, promptId, index, text })
    },
    [dispatch, projectId, methodId]
  )

  const setAnswerSlots = useCallback(
    (promptId: string, slots: ResearchAnswer[]) => {
      dispatch.researchSessions.setAnswerSlots({ projectId, methodId, promptId, slots })
    },
    [dispatch, projectId, methodId]
  )

  const addAnswerSlot = useCallback(
    (promptId: string) => {
      dispatch.researchSessions.addAnswerSlot({ projectId, methodId, promptId })
    },
    [dispatch, projectId, methodId]
  )

  const removeAnswerSlot = useCallback(
    (promptId: string, index: number) => {
      dispatch.researchSessions.removeAnswerSlot({ projectId, methodId, promptId, index })
    },
    [dispatch, projectId, methodId]
  )

  const clearSession = useCallback(() => {
    dispatch.researchSessions.clearSession({ projectId, methodId })
  }, [dispatch, projectId, methodId])

  const value = useMemo<ResearchContextValue>(
    () => ({
      method,
      toolId,
      answers,
      setTool,
      setAnswerText,
      setAnswerSlots,
      addAnswerSlot,
      removeAnswerSlot,
      clearSession,
    }),
    [method, toolId, answers, setTool, setAnswerText, setAnswerSlots, addAnswerSlot, removeAnswerSlot, clearSession]
  )

  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>
}

export function useResearch(): ResearchContextValue {
  const ctx = useContext(ResearchContext)
  if (!ctx) {
    throw new Error("useResearch must be used inside a ResearchProvider")
  }
  return ctx
}
