"use client"

import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type CanvasValidationStatus =
  | "valid"
  | "invalid"
  | "unsure"
  | "in_progress"
  | "unvalidated"

export const STATUS_CONFIG: Record<
  CanvasValidationStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  valid: { label: "Valid", className: "bg-success text-white border-success", icon: CheckCircle2 },
  invalid: { label: "Invalid", className: "bg-destructive text-white border-destructive", icon: XCircle },
  unsure: { label: "Unsure", className: "bg-primary text-primary-foreground border-primary", icon: HelpCircle },
  in_progress: { label: "In progress", className: "bg-secondary-brand text-white border-secondary-brand", icon: Clock },
  unvalidated: { label: "Unvalidated", className: "bg-muted-foreground text-white border-muted-foreground", icon: Circle },
}

export function StatusPill({
  status,
  size = "md",
}: {
  status: CanvasValidationStatus
  size?: "sm" | "md"
}) {
  const cfg = STATUS_CONFIG[status]
  const sizing =
    size === "sm"
      ? "text-sm px-2 py-0.5"
      : "text-sm font-medium px-2 py-0.5"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border shrink-0",
        sizing,
        cfg.className,
      )}
    >
      <cfg.icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

/**
 * Surface treatment for a canvas card. `card` is the default cream card;
 * `brand` paints the card in the cobalt secondary brand colour with white
 * text (used by the validation review page).
 */
export type CellTone = "card" | "brand"

export const CELL_TONE_CLASSES: Record<CellTone, string> = {
  card: "border bg-card shadow-sm",
  brand: "border border-secondary-brand bg-secondary-brand text-white shadow-sm",
}

export function Cell({
  icon: Icon,
  label,
  iconBg = "bg-tertiary",
  tone = "card",
  divider,
  className,
  children,
  empty,
}: {
  icon: LucideIcon
  label: string
  iconBg?: string
  tone?: CellTone
  /** Border colour class for a rule under the header, e.g. `border-yellow-600`. Omit for no rule. */
  divider?: string
  className?: string
  empty?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col rounded-xl overflow-hidden", CELL_TONE_CLASSES[tone], className)}>
      <div
        className={cn(
          "flex items-center gap-3 pt-4 pb-3",
          divider ? cn("mx-4 mb-3 border-b-2", divider) : "px-4",
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-lg shrink-0 text-white",
            iconBg,
          )}
          aria-hidden="true"
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="flex-1 font-semibold text-base">{label}</h3>
      </div>
      <div className={cn("px-4 pb-4 flex-1 min-h-0 overflow-y-auto text-base", empty && "italic opacity-60")}>
        {children}
      </div>
    </div>
  )
}

export function Placeholder() {
  return <span>Not yet captured</span>
}

export function MetricRow({
  label,
  metric,
}: {
  label: string
  metric: { value: number | null; unit: string; level: string }
}) {
  const hasValue = metric.value !== null && metric.value !== undefined
  const hasLevel = metric.level && metric.level !== ""
  if (!hasValue && !hasLevel) {
    return (
      <div className="flex justify-between gap-2 italic opacity-60">
        <span>{label}</span>
        <span>-</span>
      </div>
    )
  }
  const right = [
    hasValue ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}` : null,
    hasLevel ? metric.level : null,
  ]
    .filter(Boolean)
    .join(" / ")
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="font-medium capitalize">{right}</span>
    </div>
  )
}

export function ScoreCell({
  icon,
  label,
  iconBg,
  score,
  scaleNote,
  className,
}: {
  icon: LucideIcon
  label: string
  iconBg: string
  score: number | null
  scaleNote: string
  className?: string
}) {
  const filled = score ?? 0
  return (
    <Cell icon={icon} label={label} iconBg={iconBg} className={className} empty={score == null}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={cn(
                "h-3 flex-1 rounded",
                n <= filled ? iconBg : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className="text-base">
          {score != null ? `${score} / 5` : "Not scored"} {scaleNote}
        </p>
      </div>
    </Cell>
  )
}
