import type { ElementType } from "react"
import { CheckCircle2, Circle, Clock, HelpCircle, XCircle } from "lucide-react"
import type { ValidationStatus } from "@/types/validation"

// Per-status icon + label + text colour for the problems and solutions tables.
// (The canvas pills use their own filled variant in canvas-shared.tsx; this is
// the muted row variant the tables share.)
export const TABLE_STATUS_META: Record<ValidationStatus, { icon: ElementType; label: string; className: string }> = {
  unvalidated: { icon: Circle, label: "Unvalidated", className: "text-muted-foreground" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-primary" },
  valid: { icon: CheckCircle2, label: "Valid", className: "text-success" },
  invalid: { icon: XCircle, label: "Invalid", className: "text-destructive" },
  unsure: { icon: HelpCircle, label: "Unsure", className: "text-tertiary" },
}

export const STATUS_FILTER_OPTIONS: { value: "all" | ValidationStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "unvalidated", label: "Unvalidated" },
  { value: "in_progress", label: "In Progress" },
  { value: "valid", label: "Valid" },
  { value: "invalid", label: "Invalid" },
  { value: "unsure", label: "Unsure" },
]

// Sort rank for the status column.
export const STATUS_ORDER: Record<ValidationStatus, number> = {
  unvalidated: 0,
  in_progress: 1,
  valid: 2,
  invalid: 3,
  unsure: 4,
}
