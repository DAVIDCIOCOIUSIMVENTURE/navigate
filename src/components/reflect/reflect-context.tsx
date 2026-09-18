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
import type { Lens } from "@/data/reflectLenses"
import { selectReflectProject, type ReflectAnswer } from "@/store/reflect-sessions-model"
import type { ReflectionCapture } from "@/types/reflection"

export type { ReflectAnswer }

/** Turns the reflection saved on a problem back into session answers for the same lens. */
function answersFromCapture(lens: Lens, capture: ReflectionCapture): Record<string, ReflectAnswer[]> {
  if (capture.lensId !== lens.id) return {}
  const out: Record<string, ReflectAnswer[]> = {}
  for (const entry of capture.prompts) {
    out[entry.promptId] = entry.answers.map((text) => ({ text, context: {} }))
  }
  return out
}

type ReflectContextValue = {
  lens: Lens
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
  /** Drops the draft once its problem has been saved. */
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

/**
 * The session for one guided prompt tool inside one project. Every read and write
 * goes to the `reflectSessions` model under the project's id, so a draft
 * started in one project never appears in another.
 */
export function ReflectProvider({
  projectId,
  lens,
  seed = null,
  children,
}: {
  projectId: number
  lens: Lens
  /** The reflection already saved on the project's problem; pre-fills a fresh session for the same lens. */
  seed?: ReflectionCapture | null
  children: ReactNode
}) {
  const dispatch = useDispatch<AppDispatch>()
  const hydrated = useSelector((s: RootState) => s.reflectSessions.hydrated)
  const session = useSelector((s: RootState) => selectReflectProject(s, projectId).sessions[lens.id])

  /**
   * The lens whose session this provider has already opened. Saving the
   * problem clears the draft, and the project then holds that problem, so
   * without this the effect would immediately build the draft again from
   * what was just saved. Keyed by lens so switching lens still opens one.
   */
  const openedForLens = useRef<string | null>(null)
  useEffect(() => {
    if (!hydrated) return
    if (session || openedForLens.current === lens.id) return
    openedForLens.current = lens.id
    dispatch.reflectSessions.ensureSession({
      projectId,
      lensId: lens.id,
      sessionId: createSessionId(),
      promptIds: lens.prompts.map((p) => p.id),
      seedAnswers: seed ? answersFromCapture(lens, seed) : undefined,
    })
  }, [hydrated, session, dispatch, projectId, lens, seed])

  const answers = session?.answers ?? initialAnswers(lens)
  const lensId = lens.id

  const setAnswerText = useCallback(
    (promptId: string, index: number, text: string) => {
      dispatch.reflectSessions.setAnswerText({ projectId, lensId, promptId, index, text })
    },
    [dispatch, projectId, lensId]
  )

  const setAnswerContext = useCallback(
    (promptId: string, index: number, fieldId: string, value: string) => {
      dispatch.reflectSessions.setAnswerContext({ projectId, lensId, promptId, index, fieldId, value })
    },
    [dispatch, projectId, lensId]
  )

  const addAnswerSlot = useCallback(
    (promptId: string) => {
      dispatch.reflectSessions.addAnswerSlot({ projectId, lensId, promptId })
    },
    [dispatch, projectId, lensId]
  )

  const removeAnswerSlot = useCallback(
    (promptId: string, index: number) => {
      dispatch.reflectSessions.removeAnswerSlot({ projectId, lensId, promptId, index })
    },
    [dispatch, projectId, lensId]
  )

  const setAnswerSlots = useCallback(
    (promptId: string, slots: ReflectAnswer[]) => {
      dispatch.reflectSessions.setAnswerSlots({ projectId, lensId, promptId, slots })
    },
    [dispatch, projectId, lensId]
  )

  const clearSession = useCallback(() => {
    dispatch.reflectSessions.clearSession({ projectId, lensId })
  }, [dispatch, projectId, lensId])

  const value = useMemo<ReflectContextValue>(
    () => ({
      lens,
      answers,
      setAnswerText,
      setAnswerContext,
      addAnswerSlot,
      removeAnswerSlot,
      setAnswerSlots,
      clearSession,
    }),
    [lens, answers, setAnswerText, setAnswerContext, addAnswerSlot, removeAnswerSlot, setAnswerSlots, clearSession]
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
