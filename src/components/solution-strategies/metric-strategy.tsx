"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type ScaleStop = {
  score: number
  label: string
  description: string
}

export type MetricCaseStudy = {
  company: string
  context: string
  score: number
  reasoning: string
  outcome: string
  icon?: LucideIcon
  iconBg?: string
}

export type MetricContent = {
  icon: LucideIcon
  title: string
  summary: string
  guidance: string[]
  scale: ScaleStop[]
  caseStudies: MetricCaseStudy[]
  accent: string
}

/**
 * Editable metric scoring block. Renders the guidance bullets and the 1-5
 * scale picker on a coloured (`accent`) panel. Reused by the dedicated
 * validation step pages and by the solution hub. Pass `readOnly` to disable
 * the score buttons for the summary view.
 */
export function MetricStrategy({
  guidance,
  scale,
  value,
  onChange,
  accent,
  readOnly = false,
}: {
  guidance: string[]
  scale: ScaleStop[]
  value: number | null
  onChange: (val: number | null) => void
  accent: string
  readOnly?: boolean
}) {
  if (readOnly && value == null) {
    return (
      <div className={cn("rounded-xl p-8", accent)}>
        <p className="text-sm text-white/70 italic">No score captured.</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl p-8 flex flex-col gap-6", accent)}>
      {!readOnly && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">How to think about it</h3>
          <ul className="flex flex-col gap-2">
            {guidance.map((g) => (
              <li key={g} className="text-sm text-white flex items-start gap-2">
                <span className="text-white/50 mt-0.5">&bull;</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
          {readOnly ? "Your score" : "Your score (1 to 5)"}
        </h3>
        {!readOnly && (
          <p className="text-sm text-white/80">Pick the row that best matches your situation. You can change it any time.</p>
        )}

        <div className="flex flex-col gap-2">
          {scale
            .filter((stop) => !readOnly || value === stop.score)
            .map((stop) => {
              const selected = value === stop.score
              return (
                <button
                  key={stop.score}
                  type="button"
                  disabled={readOnly}
                  onClick={() => { if (!readOnly) onChange(selected ? null : stop.score) }}
                  className={cn(
                    "rounded-lg border-2 px-4 py-3 text-left flex items-start gap-4 transition-colors",
                    selected
                      ? "bg-white border-white shadow-md"
                      : "bg-white/5 border-white/30 hover:bg-white/10 hover:border-white/60",
                    readOnly && "cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl font-bold",
                      selected ? "bg-primary/10 text-primary" : "bg-white/10 text-white"
                    )}
                  >
                    {stop.score}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className={cn("text-sm font-semibold", selected ? "text-foreground" : "text-white")}>
                      {stop.label}
                    </p>
                    <p className={cn("text-sm", selected ? "text-muted-foreground" : "text-white/70")}>
                      {stop.description}
                    </p>
                  </div>
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
