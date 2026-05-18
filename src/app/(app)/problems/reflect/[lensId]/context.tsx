"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Lens } from "@/data/reflectLenses"

export type ReflectAnswer = {
  text: string
  context: Record<string, string>
}

type ReflectContextValue = {
  lens: Lens
  sessionId: string
  /** promptId -> ordered list of answer slots. Always has at least one slot per prompt. */
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
  resetSession: () => void
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
  const [sessionId, setSessionId] = useState<string>(createSessionId)
  const [answers, setAnswers] = useState<Record<string, ReflectAnswer[]>>(() =>
    initialAnswers(lens)
  )

  const setAnswerText = useCallback((promptId: string, index: number, text: string) => {
    setAnswers((prev) => {
      const list = prev[promptId] ?? [emptyAnswer()]
      const next = [...list]
      next[index] = { ...(next[index] ?? emptyAnswer()), text }
      return { ...prev, [promptId]: next }
    })
  }, [])

  const setAnswerContext = useCallback(
    (promptId: string, index: number, fieldId: string, value: string) => {
      setAnswers((prev) => {
        const list = prev[promptId] ?? [emptyAnswer()]
        const next = [...list]
        const slot = next[index] ?? emptyAnswer()
        next[index] = { ...slot, context: { ...slot.context, [fieldId]: value } }
        return { ...prev, [promptId]: next }
      })
    },
    []
  )

  const addAnswerSlot = useCallback((promptId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [promptId]: [...(prev[promptId] ?? []), emptyAnswer()],
    }))
  }, [])

  const removeAnswerSlot = useCallback((promptId: string, index: number) => {
    setAnswers((prev) => {
      const next = (prev[promptId] ?? []).filter((_, i) => i !== index)
      return {
        ...prev,
        [promptId]: next.length === 0 ? [emptyAnswer()] : next,
      }
    })
  }, [])

  const resetSession = useCallback(() => {
    setSessionId(createSessionId())
    setAnswers(initialAnswers(lens))
  }, [lens])

  const value = useMemo<ReflectContextValue>(
    () => ({
      lens,
      sessionId,
      answers,
      setAnswerText,
      setAnswerContext,
      addAnswerSlot,
      removeAnswerSlot,
      resetSession,
    }),
    [
      lens,
      sessionId,
      answers,
      setAnswerText,
      setAnswerContext,
      addAnswerSlot,
      removeAnswerSlot,
      resetSession,
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

export const REFLECT_NAV_ITEMS_STANDARD = [
  { path: "introduction", label: "Introduction" },
  { path: "prompts", label: "Prompts" },
  { path: "review", label: "Review" },
  { path: "done", label: "Done" },
] as const

export const REFLECT_NAV_ITEMS_SINGLE_FORM = [
  { path: "introduction", label: "Introduction" },
  { path: "capture", label: "Capture" },
] as const

export type ReflectNavItem = { path: string; label: string }

export function getReflectNavItems(lens: Lens): readonly ReflectNavItem[] {
  return lens.flowKind === "single-form"
    ? REFLECT_NAV_ITEMS_SINGLE_FORM
    : REFLECT_NAV_ITEMS_STANDARD
}
