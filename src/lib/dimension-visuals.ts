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
    icon: "text-green-800",
    border: "border-t-green-800",
    bg: "bg-green-800/10",
    bgIdle: "bg-green-800/5 hover:bg-green-800/10",
    bgExplored: "bg-green-800/10 hover:bg-green-800/20",
    iconBg: "bg-green-800",
    pill: "bg-green-800 text-white font-bold dark:bg-green-700 dark:text-white",
    pillBorder: "border-green-800/30",
  },
  contexts: {
    icon: "text-blue-900",
    border: "border-t-blue-900",
    bg: "bg-blue-900/10",
    bgIdle: "bg-blue-900/5 hover:bg-blue-900/10",
    bgExplored: "bg-blue-900/10 hover:bg-blue-900/20",
    iconBg: "bg-blue-900",
    pill: "bg-blue-900 text-white font-bold dark:bg-blue-800 dark:text-white",
    pillBorder: "border-blue-900/30",
  },
  problems: {
    icon: "text-red-800",
    border: "border-t-red-800",
    bg: "bg-red-800/10",
    bgIdle: "bg-red-800/5 hover:bg-red-800/10",
    bgExplored: "bg-red-800/10 hover:bg-red-800/20",
    iconBg: "bg-red-800",
    pill: "bg-red-800 text-white font-bold dark:bg-red-700 dark:text-white",
    pillBorder: "border-red-800/30",
  },
  you: {
    icon: "text-yellow-700",
    border: "border-t-yellow-600",
    bg: "bg-yellow-600/10",
    bgIdle: "bg-yellow-600/5 hover:bg-yellow-600/10",
    bgExplored: "bg-yellow-600/10 hover:bg-yellow-600/20",
    iconBg: "bg-yellow-600",
    pill: "bg-yellow-600 text-white font-bold dark:bg-yellow-500 dark:text-white",
    pillBorder: "border-yellow-600/30",
  },
}
