"use client"

import { useMemo } from "react"
import { ContextCard, CONTEXT_HIGHLIGHT_CLASS } from "@/components/context-card"
import { getAnchorPromptId } from "@/data/reflectLenses"
import { useReflect } from "@/components/reflect/reflect-context"

/**
 * Compact amber card naming the experience, work area or audience the current
 * Reflect session is anchored on. Rendered in the Reflect stepper rail above
 * the Reset button; renders nothing until the anchor prompt has an answer.
 * Must sit inside a `ReflectProvider`.
 */
export function ReflectingOnCard() {
  const { lens, answers } = useReflect()

  const chosenAnchor = useMemo(() => {
    const anchorPromptId = getAnchorPromptId(lens)
    if (!anchorPromptId) return null
    const list = answers[anchorPromptId] ?? []
    const firstFilled = list.find((a) => a.text.trim().length > 0)
    return firstFilled ? firstFilled.text.trim() : null
  }, [lens, answers])

  if (!chosenAnchor) return null

  return (
    <ContextCard
      label="Reflecting on"
      icon={lens.icon}
      title={chosenAnchor}
      className={CONTEXT_HIGHLIGHT_CLASS}
      compact
    />
  )
}
