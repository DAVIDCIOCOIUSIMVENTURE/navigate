"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import type { ResearchMethod } from "@/data/researchMethods"
import type { ResearchAnswer } from "@/store/research-sessions-model"

export type { ResearchAnswer }

type ResearchContextValue = {
  method: ResearchMethod
  sessionId: string
  toolId: string | null
  answers: Record<string, ResearchAnswer[]>
  setTool: (toolId: string | null) => void
  setAnswerText: (promptId: string, index: number, text: string) => void
  setAnswerSlots: (promptId: string, slots: ResearchAnswer[]) => void
  addAnswerSlot: (promptId: string) => void
  removeAnswerSlot: (promptId: string, index: number) => void
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

export function ResearchProvider({
  method,
  children,
}: {
  method: ResearchMethod
  children: ReactNode
}) {
  const dispatch = useDispatch<AppDispatch>()
  const hydrated = useSelector((s: RootState) => s.researchSessions.hydrated)
  const session = useSelector((s: RootState) => s.researchSessions.sessions[method.id])

  useEffect(() => {
    if (!hydrated) return
    if (session) return
    dispatch.researchSessions.ensureSession({
      methodId: method.id,
      sessionId: createSessionId(),
      promptIds: method.prompts.map((p) => p.id),
    })
  }, [hydrated, session, dispatch, method.id, method.prompts])

  const sessionId = session?.sessionId ?? ""
  const toolId = session?.toolId ?? null
  const answers = session?.answers ?? initialAnswers(method)

  const setTool = useCallback(
    (next: string | null) => {
      dispatch.researchSessions.setTool({ methodId: method.id, toolId: next })
    },
    [dispatch, method.id]
  )

  const setAnswerText = useCallback(
    (promptId: string, index: number, text: string) => {
      dispatch.researchSessions.setAnswerText({ methodId: method.id, promptId, index, text })
    },
    [dispatch, method.id]
  )

  const setAnswerSlots = useCallback(
    (promptId: string, slots: ResearchAnswer[]) => {
      dispatch.researchSessions.setAnswerSlots({ methodId: method.id, promptId, slots })
    },
    [dispatch, method.id]
  )

  const addAnswerSlot = useCallback(
    (promptId: string) => {
      dispatch.researchSessions.addAnswerSlot({ methodId: method.id, promptId })
    },
    [dispatch, method.id]
  )

  const removeAnswerSlot = useCallback(
    (promptId: string, index: number) => {
      dispatch.researchSessions.removeAnswerSlot({ methodId: method.id, promptId, index })
    },
    [dispatch, method.id]
  )

  const clearSession = useCallback(() => {
    dispatch.researchSessions.clearSession(method.id)
  }, [dispatch, method.id])

  const value = useMemo<ResearchContextValue>(
    () => ({
      method,
      sessionId,
      toolId,
      answers,
      setTool,
      setAnswerText,
      setAnswerSlots,
      addAnswerSlot,
      removeAnswerSlot,
      clearSession,
    }),
    [
      method,
      sessionId,
      toolId,
      answers,
      setTool,
      setAnswerText,
      setAnswerSlots,
      addAnswerSlot,
      removeAnswerSlot,
      clearSession,
    ]
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
