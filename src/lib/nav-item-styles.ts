import { cn } from "@/lib/utils"

/**
 * Shared styling for flow navigation rows (steppers, section navs, per-flow
 * sidebars) and the icon / step-number tiles that sit inside them.
 *
 * Inactive rows keep the ghost button's default text colour and swap the
 * teal-tinted accent hover for the app's faint grey `muted` surface. The
 * active row sits on that same grey with primary text. Only the active tile
 * uses the primary colour: inactive tiles stay grey with the default
 * foreground so nothing reads as selected until it is.
 */
export const NAV_ITEM_HOVER_CLASS = "hover:bg-muted"

export const NAV_ITEM_ACTIVE_CLASS =
  "bg-muted text-primary hover:bg-muted hover:text-primary"

/** Dropdown menu items highlight on focus rather than hover, so the active row repeats the tint there. */
export const NAV_ITEM_ACTIVE_FOCUS_CLASS = "focus:bg-muted focus:text-primary"

const NAV_ICON_TILE_BASE = "flex items-center justify-center w-7 h-7 rounded-md shrink-0"
const NAV_ICON_BASE = "h-3.5 w-3.5 [stroke-width:2.5]"

/** Icon tile for a nav row: solid primary when active, faint grey otherwise. */
export function navIconTileClass(isActive: boolean) {
  return cn(NAV_ICON_TILE_BASE, isActive ? "bg-primary" : "bg-muted")
}

/** Icon glyph for a nav row: light on the active primary tile, default foreground otherwise. Slightly heavier stroke than lucide's default. */
export function navIconClass(isActive: boolean) {
  return cn(NAV_ICON_BASE, isActive ? "text-primary-foreground" : "text-foreground")
}

export type NavStepState = "active" | "completed" | "locked" | "default"

/** Numbered step badge for steppers, matching the icon tile colours. */
export function navStepBadgeClass(state: NavStepState) {
  return cn(
    NAV_ICON_TILE_BASE,
    "text-xs font-bold transition-colors",
    state === "active"
      ? "bg-primary text-primary-foreground"
      : state === "locked"
        ? "bg-muted/60 text-muted-foreground/60"
        : "bg-muted text-foreground",
  )
}

/** Compact section title tile (the h-7 tile beside a focus flow's h1). */
export const SECTION_TITLE_TILE_CLASS =
  "flex h-7 w-7 items-center justify-center rounded-md bg-primary shrink-0"
export const SECTION_TITLE_ICON_CLASS = "h-4 w-4 text-primary-foreground [stroke-width:2.5]"
