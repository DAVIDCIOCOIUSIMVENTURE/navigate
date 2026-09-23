"use client"

import { ContextCard, CONTEXT_HIGHLIGHT_CLASS } from "@/components/context-card"
import { DIMENSION_ICONS, DIMENSION_LABELS } from "@/lib/dimension-visuals"
import { filledAnswers, guidedAnchor, guidedStartingDimension } from "@/lib/guided-discovery"
import { useGuided } from "@/components/guided/guided-context"

/**
 * Compact amber card naming what the current Guided discovery run is starting
 * from: the dimension once the first question is answered, then the anchor
 * itself (the experience, group, annoyance or moment) once it is picked.
 * Rendered in the tool's stepper rail above the Reset button; renders nothing
 * before the first question is answered. Must sit inside a `GuidedProvider`.
 */
export function GuidedStartingCard() {
  const { answers, path } = useGuided()
  const dimension = guidedStartingDimension(answers)
  if (!dimension) return null

  const anchor = guidedAnchor(path)
  const anchorValue = anchor ? filledAnswers(answers, anchor.id)[0] ?? null : null

  return (
    <ContextCard
      label="Starting from"
      icon={DIMENSION_ICONS[dimension]}
      title={anchorValue ?? DIMENSION_LABELS[dimension]}
      className={CONTEXT_HIGHLIGHT_CLASS}
      compact
    />
  )
}
