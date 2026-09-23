"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { GUIDED_ANSWER_IDS, GUIDED_OPTION_FIELD, GUIDED_TOOL_ID, type GuidedOption } from "@/data/guidedDiscovery"
import { answersFromGuidedCapture, resolveGuidedPath, type GuidedAnswers, type GuidedPath } from "@/lib/guided-discovery"
import { selectReflectProject, type ReflectAnswer } from "@/store/reflect-sessions-model"
import type { ReflectionCapture } from "@/types/reflection"

type GuidedContextValue = {
  answers: GuidedAnswers
  /** The questions reached so far, worked out from the answers. */
  path: GuidedPath
  setAnswerText: (nodeId: string, index: number, text: string) => void
  setAnswerContext: (nodeId: string, index: number, fieldId: string, value: string) => void
  addAnswerSlot: (nodeId: string) => void
  removeAnswerSlot: (nodeId: string, index: number) => void
  setAnswerSlots: (nodeId: string, slots: ReflectAnswer[]) => void
  /** Answers a choice node with one of its options. */
  chooseOption: (nodeId: string, option: GuidedOption) => void
  /** Drops the draft once its problem has been saved. */
  clearSession: () => void
}

const GuidedContext = createContext<GuidedContextValue | null>(null)

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `session-${crypto.randomUUID().slice(0, 8)}`
  }
  return `session-${Math.random().toString(36).slice(2, 10)}`
}


/**
 * The Guided discovery session inside one project. The draft is kept in the
 * `reflectSessions` model under `GUIDED_TOOL_ID`, beside the lenses' drafts,
 * so it belongs to the project like theirs and is cleared, exported and
 * imported with them.
 */
export function GuidedProvider({
  projectId,
  seed = null,
  children,
}: {
  projectId: number
  /** The reflection already saved on the project's problem; pre-fills a fresh session when it came from this tool. */
  seed?: ReflectionCapture | null
  children: ReactNode
}) {
  const dispatch = useDispatch<AppDispatch>()
  const hydrated = useSelector((s: RootState) => s.reflectSessions.hydrated)
  const session = useSelector((s: RootState) => selectReflectProject(s, projectId).sessions[GUIDED_TOOL_ID])

  /**
   * Whether this provider has already opened a session. Saving the problem
   * clears the draft and the project then holds that problem, so without
   * this the effect would immediately build the draft again from what was
   * just saved.
   */
  const opened = useRef(false)
  useEffect(() => {
    if (!hydrated) return
    if (session || opened.current) return
    opened.current = true
    dispatch.reflectSessions.ensureSession({
      projectId,
      lensId: GUIDED_TOOL_ID,
      sessionId: createSessionId(),
      promptIds: GUIDED_ANSWER_IDS,
      seedAnswers: seed ? answersFromGuidedCapture(seed) : undefined,
    })
  }, [hydrated, session, dispatch, projectId, seed])

  const answers = useMemo<GuidedAnswers>(() => session?.answers ?? {}, [session])
  const path = useMemo(() => resolveGuidedPath(answers), [answers])
  const lensId = GUIDED_TOOL_ID

  const setAnswerText = useCallback(
    (promptId: string, index: number, text: string) => {
      dispatch.reflectSessions.setAnswerText({ projectId, lensId, promptId, index, text })
    },
    [dispatch, projectId, lensId],
  )

  const setAnswerContext = useCallback(
    (promptId: string, index: number, fieldId: string, value: string) => {
      dispatch.reflectSessions.setAnswerContext({ projectId, lensId, promptId, index, fieldId, value })
    },
    [dispatch, projectId, lensId],
  )

  const addAnswerSlot = useCallback(
    (promptId: string) => {
      dispatch.reflectSessions.addAnswerSlot({ projectId, lensId, promptId })
    },
    [dispatch, projectId, lensId],
  )

  const removeAnswerSlot = useCallback(
    (promptId: string, index: number) => {
      dispatch.reflectSessions.removeAnswerSlot({ projectId, lensId, promptId, index })
    },
    [dispatch, projectId, lensId],
  )

  const setAnswerSlots = useCallback(
    (promptId: string, slots: ReflectAnswer[]) => {
      dispatch.reflectSessions.setAnswerSlots({ projectId, lensId, promptId, slots })
    },
    [dispatch, projectId, lensId],
  )

  const chooseOption = useCallback(
    (nodeId: string, option: GuidedOption) => {
      dispatch.reflectSessions.setAnswerSlots({
        projectId,
        lensId,
        promptId: nodeId,
        slots: [{ text: option.label, context: { [GUIDED_OPTION_FIELD]: option.id } }],
      })
    },
    [dispatch, projectId, lensId],
  )

  const clearSession = useCallback(() => {
    dispatch.reflectSessions.clearSession({ projectId, lensId })
  }, [dispatch, projectId, lensId])

  const value = useMemo<GuidedContextValue>(
    () => ({ answers, path, setAnswerText, setAnswerContext, addAnswerSlot, removeAnswerSlot, setAnswerSlots, chooseOption, clearSession }),
    [answers, path, setAnswerText, setAnswerContext, addAnswerSlot, removeAnswerSlot, setAnswerSlots, chooseOption, clearSession],
  )

  return <GuidedContext.Provider value={value}>{children}</GuidedContext.Provider>
}

export function useGuided(): GuidedContextValue {
  const ctx = useContext(GuidedContext)
  if (!ctx) throw new Error("useGuided must be used inside a GuidedProvider")
  return ctx
}
