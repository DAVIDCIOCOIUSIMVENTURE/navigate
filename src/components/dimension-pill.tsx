import { cn } from "@/lib/utils"
import {
  DIMENSION_COLORS,
  DIMENSION_ICONS,
  DIMENSION_LABELS,
  type DimensionKey,
} from "@/lib/dimension-visuals"

/**
 * A tiny pill naming one dimension (Customer, Context, Problem, You) in that
 * dimension's own colour, for sitting beside a title to say where a tool
 * starts from. Like the journey rail it is a wayfinding aid rather than copy,
 * so it stays at text-sm.
 */
export function DimensionPill({ dimension, className }: { dimension: DimensionKey; className?: string }) {
  const Icon = DIMENSION_ICONS[dimension]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium leading-tight",
        DIMENSION_COLORS[dimension].pill,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {DIMENSION_LABELS[dimension]}
    </span>
  )
}

/** The pills for every dimension a tool starts from, with an accessible name for the group. */
export function DimensionPills({ dimensions, className }: { dimensions: DimensionKey[]; className?: string }) {
  if (dimensions.length === 0) return null
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)} aria-label="Starts from">
      {dimensions.map((dimension) => (
        <DimensionPill key={dimension} dimension={dimension} />
      ))}
    </span>
  )
}
