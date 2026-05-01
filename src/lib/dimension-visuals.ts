import { Users, MapPin, TriangleAlert, Compass, type LucideIcon } from "lucide-react"

/**
 * Per-dimension iconography and colour palette. Used by the brainstorming
 * canvas, the dimension chip picker, and any other surface that renders
 * dimension chips so that "Customer", "Context", "Problem", and "You" stay
 * visually distinct everywhere they appear.
 *
 * Field names mirror the legacy local config that used to live in the
 * brainstorm page so existing call-sites can drop in this module unchanged.
 */

export type DimensionColor = {
  /** Solid icon colour, e.g. "text-emerald-500" */
  icon: string
  /** Top border accent, e.g. "border-t-emerald-500" */
  border: string
  /** Translucent backdrop for the column body, e.g. "bg-emerald-500/10" */
  bg: string
  /** Translucent backdrop with hover state for unexplored cards */
  bgIdle: string
  /** Translucent backdrop with hover state for explored cards */
  bgExplored: string
  /** Solid background for filled icon tiles, e.g. "bg-emerald-500" */
  iconBg: string
  /** Chip / pill colour combo, e.g. "bg-emerald-500/10 text-emerald-700 ..." */
  pill: string
  /** Chip border tone, used by the dimension picker outline */
  pillBorder: string
}

export const DIMENSION_ICONS: Record<string, LucideIcon> = {
  customers: Users,
  contexts: MapPin,
  problems: TriangleAlert,
  you: Compass,
}

export const DIMENSION_COLORS: Record<string, DimensionColor> = {
  customers: {
    icon: "text-emerald-500",
    border: "border-t-emerald-500",
    bg: "bg-emerald-500/10",
    bgIdle: "bg-emerald-500/5 hover:bg-emerald-500/10",
    bgExplored: "bg-emerald-500/10 hover:bg-emerald-500/20",
    iconBg: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    pillBorder: "border-emerald-500/30",
  },
  contexts: {
    icon: "text-blue-500",
    border: "border-t-blue-500",
    bg: "bg-blue-500/10",
    bgIdle: "bg-blue-500/5 hover:bg-blue-500/10",
    bgExplored: "bg-blue-500/10 hover:bg-blue-500/20",
    iconBg: "bg-blue-500",
    pill: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    pillBorder: "border-blue-500/30",
  },
  problems: {
    icon: "text-rose-500",
    border: "border-t-rose-500",
    bg: "bg-rose-500/10",
    bgIdle: "bg-rose-500/5 hover:bg-rose-500/10",
    bgExplored: "bg-rose-500/10 hover:bg-rose-500/20",
    iconBg: "bg-rose-500",
    pill: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    pillBorder: "border-rose-500/30",
  },
  you: {
    icon: "text-amber-500",
    border: "border-t-amber-500",
    bg: "bg-amber-500/10",
    bgIdle: "bg-amber-500/5 hover:bg-amber-500/10",
    bgExplored: "bg-amber-500/10 hover:bg-amber-500/20",
    iconBg: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    pillBorder: "border-amber-500/30",
  },
}
