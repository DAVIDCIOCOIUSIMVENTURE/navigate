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
import type { Lens } from "@/data/reflectLenses"
import type { ReflectAnswer } from "@/store/reflect-sessions-model"

export type { ReflectAnswer }

type ReflectContextValue = {
  lens: Lens
  sessionId: string
  answers: Record<string, ReflectAnswer[]>
  setAnswerText: (promptId: string, index: number, text: string) => void
  setAnswerContext: (
    promptId: string,
    index: number,
    fieldId: string,
    value: string
  ) => void
  addAnswerSlot: (promptId: string) => void
  removeAnswerSlot: (promptId: string, index: number) => void
  setAnswerSlots: (promptId: string, slots: ReflectAnswer[]) => void
  resetSession: () => void
  clearSession: () => void
}

const ReflectContext = createContext<ReflectContextValue | null>(null)

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `session-${crypto.randomUUID().slice(0, 8)}`
  }
  return `session-${Math.random().toString(36).slice(2, 10)}`
}

function emptyAnswer(): ReflectAnswer {
  return { text: "", context: {} }
}

function initialAnswers(lens: Lens): Record<string, ReflectAnswer[]> {
  const out: Record<string, ReflectAnswer[]> = {}
  for (const prompt of lens.prompts) {
    out[prompt.id] = [emptyAnswer()]
  }
  return out
}

export function ReflectProvider({
  lens,
  children,
}: {
  lens: Lens
  children: ReactNode
}) {
  const dispatch = useDispatch<AppDispatch>()
  const hydrated = useSelector((s: RootState) => s.reflectSessions.hydrated)
  const session = useSelector((s: RootState) => s.reflectSessions.sessions[lens.id])

  useEffect(() => {
    if (!hydrated) return
    if (session) return
    dispatch.reflectSessions.ensureSession({
      lensId: lens.id,
      sessionId: createSessionId(),
      promptIds: lens.prompts.map((p) => p.id),
    })
  }, [hydrated, session, dispatch, lens.id, lens.prompts])

  const sessionId = session?.sessionId ?? ""
  const answers = session?.answers ?? initialAnswers(lens)

  const setAnswerText = useCallback(
    (promptId: string, index: number, text: string) => {
      dispatch.reflectSessions.setAnswerText({ lensId: lens.id, promptId, index, text })
    },
    [dispatch, lens.id]
  )

  const setAnswerContext = useCallback(
    (promptId: string, index: number, fieldId: string, value: string) => {
      dispatch.reflectSessions.setAnswerContext({
        lensId: lens.id,
        promptId,
        index,
        fieldId,
        value,
      })
    },
    [dispatch, lens.id]
  )

  const addAnswerSlot = useCallback(
    (promptId: string) => {
      dispatch.reflectSessions.addAnswerSlot({ lensId: lens.id, promptId })
    },
    [dispatch, lens.id]
  )

  const removeAnswerSlot = useCallback(
    (promptId: string, index: number) => {
      dispatch.reflectSessions.removeAnswerSlot({ lensId: lens.id, promptId, index })
    },
    [dispatch, lens.id]
  )

  const setAnswerSlots = useCallback(
    (promptId: string, slots: ReflectAnswer[]) => {
      dispatch.reflectSessions.setAnswerSlots({ lensId: lens.id, promptId, slots })
    },
    [dispatch, lens.id]
  )

  const resetSession = useCallback(() => {
    dispatch.reflectSessions.resetSession({
      lensId: lens.id,
      sessionId: createSessionId(),
      promptIds: lens.prompts.map((p) => p.id),
    })
  }, [dispatch, lens.id, lens.prompts])

  const clearSession = useCallback(() => {
    dispatch.reflectSessions.clearSession(lens.id)
  }, [dispatch, lens.id])

  const value = useMemo<ReflectContextValue>(
    () => ({
      lens,
      sessionId,
      answers,
      setAnswerText,
      setAnswerContext,
      addAnswerSlot,
      removeAnswerSlot,
      setAnswerSlots,
      resetSession,
      clearSession,
    }),
    [
      lens,
      sessionId,
      answers,
      setAnswerText,
      setAnswerContext,
      addAnswerSlot,
      removeAnswerSlot,
      setAnswerSlots,
      resetSession,
      clearSession,
    ]
  )

  return <ReflectContext.Provider value={value}>{children}</ReflectContext.Provider>
}

export function useReflect(): ReflectContextValue {
  const ctx = useContext(ReflectContext)
  if (!ctx) {
    throw new Error("useReflect must be used inside a ReflectProvider")
  }
  return ctx
}
