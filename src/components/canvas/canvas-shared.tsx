"use client"

import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  Pencil,
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
  unvalidated: { label: "Not tested", className: "bg-muted-foreground text-white border-muted-foreground", icon: Circle },
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

/**
 * The cobalt tile behind every icon on the problem and solution canvas cards,
 * and the matching cobalt for the heading beside it. On a brand card, where
 * cobalt on cobalt would disappear, both go white (`CANVAS_HEADER_BRAND`).
 */
export const CANVAS_ICON_TILE = "bg-secondary-brand text-white"
export const CANVAS_TITLE_COLOUR = "text-secondary-brand"
const CANVAS_HEADER_BRAND = { tile: "bg-white/20 text-white", title: "text-white" }

export const CELL_TONE_CLASSES: Record<CellTone, string> = {
  card: "border bg-card shadow-sm",
  brand: "border border-secondary-brand bg-secondary-brand text-white shadow-sm",
}

/**
 * The heading inside a canvas card header. With `onEdit` it becomes a button
 * that opens the card's edit dialog, showing a pencil on hover so the card
 * reads as clickable; without it, it is plain text. The heading element stays
 * an `h3` either way, with the button inside it, so the card keeps its place
 * in the document outline.
 */
export function CellTitle({
  label,
  onEdit,
  className,
}: {
  label: string
  onEdit?: () => void
  className?: string
}) {
  if (!onEdit) {
    return <h3 className={cn("font-bold text-base", className)}>{label}</h3>
  }
  return (
    <h3 className={cn("font-bold text-base", className)}>
      <button
        type="button"
        onClick={onEdit}
        title={`Edit ${label.toLowerCase()}`}
        className="group -mx-1 flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="group-hover:underline">{label}</span>
        <Pencil
          className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70 print:hidden"
          aria-hidden="true"
        />
      </button>
    </h3>
  )
}

export function Cell({
  icon: Icon,
  label,
  tone = "card",
  className,
  children,
  empty,
  onEdit,
  headerRight,
}: {
  icon: LucideIcon
  label: string
  tone?: CellTone
  className?: string
  empty?: boolean
  children: React.ReactNode
  /** Makes the card title a button that opens this card's edit dialog. */
  onEdit?: () => void
  /** A figure to sit at the right-hand end of the header row, opposite the title. */
  headerRight?: React.ReactNode
}) {
  const brand = tone === "brand"
  return (
    <div className={cn("flex flex-col rounded-xl overflow-hidden", CELL_TONE_CLASSES[tone], className)}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-lg shrink-0",
            brand ? CANVAS_HEADER_BRAND.tile : CANVAS_ICON_TILE,
          )}
          aria-hidden="true"
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <CellTitle
          label={label}
          onEdit={onEdit}
          className={cn("flex-1", brand ? CANVAS_HEADER_BRAND.title : CANVAS_TITLE_COLOUR)}
        />
        {headerRight && <div className="shrink-0 text-base">{headerRight}</div>}
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
