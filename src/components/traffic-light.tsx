"use client"

import type { TrafficLight } from "@/types/solution"
import { TRAFFIC_LIGHT_META, TRAFFIC_LIGHT_PICKER_ORDER } from "@/lib/solution-comparison"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * The traffic light a solution earns on the Compare solutions page, in the
 * three places it shows: a coloured disc with a label for table rows, a
 * filled pill beside the status pill on the canvas, and the three-button
 * picker on the compare page itself.
 */

export function TrafficLightDot({ light, className }: { light: TrafficLight; className?: string }) {
  return (
    <span
      className={cn("inline-block h-3 w-3 shrink-0 rounded-full", TRAFFIC_LIGHT_META[light].dotClass, className)}
      aria-hidden="true"
    />
  )
}

/** Disc plus label for a table cell. Renders a muted "Not scored" when unset. */
export function TrafficLightLabel({ light, className }: { light: TrafficLight | null | undefined; className?: string }) {
  if (!light) {
    return <span className={cn("text-sm text-muted-foreground", className)}>Not scored</span>
  }
  const meta = TRAFFIC_LIGHT_META[light]
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", meta.textClass, className)}>
      <TrafficLightDot light={light} />
      {meta.label}
    </span>
  )
}

/** Filled pill matching the canvas status pill. Renders nothing when unset. */
export function TrafficLightPill({ light }: { light: TrafficLight | null | undefined }) {
  if (!light) return null
  const meta = TRAFFIC_LIGHT_META[light]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border shrink-0 text-sm font-medium px-2 py-0.5",
        meta.pillClass,
      )}
    >
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/90" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

/**
 * Three round buttons, one per light, red first like a real traffic light,
 * each carrying its face (frown, neutral, smile). Clicking the selected light
 * again clears it so a solution can go back to unscored.
 */
export function TrafficLightPicker({
  value,
  onChange,
  label,
}: {
  value: TrafficLight | null
  onChange: (light: TrafficLight | null) => void
  /** Accessible group name, e.g. the solution title. */
  label: string
}) {
  return (
    <div role="group" aria-label={`Traffic light for ${label}`} className="flex items-center gap-2">
      {TRAFFIC_LIGHT_PICKER_ORDER.map((light) => {
        const meta = TRAFFIC_LIGHT_META[light]
        const Face = meta.icon
        const selected = value === light
        return (
          <Tooltip key={light}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`${meta.label}: ${meta.description}`}
                onClick={() => onChange(selected ? null : light)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  meta.dotClass,
                  selected
                    ? "ring-2 ring-offset-2 ring-foreground scale-110"
                    : value
                      ? "opacity-30 hover:opacity-70"
                      : "opacity-60 hover:opacity-100",
                )}
              >
                <Face className="h-5 w-5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{meta.label}: {meta.description}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
