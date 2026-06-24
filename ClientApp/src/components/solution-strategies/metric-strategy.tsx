"use client"

import type { LucideIcon } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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

export type MetricReadTile = {
  icon: LucideIcon
  iconBg: string
  title: string
  body: string
}

export type MetricContent = {
  icon: LucideIcon
  title: string
  summary: string
  intro: string[]
  readFor: MetricReadTile[]
  pickLevel: string
  yourTurnTitle: string
  yourTurnBody: string
  strategyTitle: string
  strategyLabel: string
  strategyDescription: string
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
  icon: Icon,
  strategyTitle,
  strategyLabel,
  strategyDescription,
  scale,
  value,
  onChange,
  accent,
  readOnly = false,
}: {
  icon: LucideIcon
  strategyTitle: string
  strategyLabel: string
  strategyDescription: string
  scale: ScaleStop[]
  value: number | null
  onChange: (val: number | null) => void
  accent: string
  readOnly?: boolean
}) {
  if (readOnly && value == null) {
    return (
      <div className={cn("rounded-xl p-8", accent)}>
        <p className="text-base text-white italic">No score captured.</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl p-8 flex flex-col gap-6", accent)}>
      <p className="text-base font-medium text-white">{strategyTitle}</p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-white shrink-0" />
          <span className="text-base font-semibold text-white">{strategyLabel}</span>
        </div>
        {!readOnly && (
          <p className="text-base text-white">{strategyDescription}</p>
        )}
        <div className="mt-2 inline-flex w-fit rounded-xl bg-white/10 p-1.5">
          <ToggleGroup
            className="border-none"
            type="single"
            value={value !== null ? String(value) : ""}
            onValueChange={(val) => { if (!readOnly) onChange(val === "" ? null : Number(val)) }}
            disabled={readOnly}
          >
            {scale
              .filter((stop) => !readOnly || value === stop.score)
              .map((stop) => (
                <ToggleGroupItem
                  key={stop.score}
                  value={String(stop.score)}
                  className="px-4 py-1.5 text-base font-medium bg-transparent text-white data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-md hover:bg-white/10 rounded-md border-none"
                >
                  {stop.label}
                </ToggleGroupItem>
              ))}
          </ToggleGroup>
        </div>
      </div>
    </div>
  )
}
