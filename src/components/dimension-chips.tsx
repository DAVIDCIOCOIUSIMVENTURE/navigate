"use client"

import { useDimensionLabels } from "@/lib/dimension-labels"
import { cn } from "@/lib/utils"

/**
 * Render a list of dimension item ids as readable chips. The component is the
 * standard display surface for `Problem.customers[]`, `.contexts[]`, etc.
 * Resolves each id to its label via the (built-in -> custom -> self-discovery
 * item) lookup chain.
 */
export function DimensionChips({
  columnId,
  ids,
  className,
  emptyText,
}: {
  columnId: string
  ids: string[]
  className?: string
  emptyText?: string
}) {
  const labels = useDimensionLabels(columnId, ids)
  if (ids.length === 0) {
    return emptyText ? (
      <span className="text-xs text-muted-foreground/60 italic">{emptyText}</span>
    ) : null
  }
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {ids.map((id, i) => (
        <span
          key={id}
          className="rounded-md bg-background px-2 py-0.5 text-xs border"
        >
          {labels[i]}
        </span>
      ))}
    </div>
  )
}
