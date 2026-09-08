/**
 * Pure layout maths for the tour overlay: where the spotlight sits, where the
 * popover goes, and where its arrow points. No DOM access, so it is unit
 * tested in `geometry.test.ts`.
 */
import type { TourPlacement } from "@/lib/tour-steps"

export type Rect = { top: number; left: number; width: number; height: number }
export type Size = { width: number; height: number }

/** Popover width in px; keep in sync with the width applied in `tour-cards.tsx`. */
export const CARD_WIDTH = 352
/** Gap between the spotlight and the popover. */
export const GAP = 14
/** Minimum distance from the viewport edge. */
export const MARGIN = 12
/** Breathing room around the spotlighted element. */
export const SPOT_PAD = 6
/** Half the arrow's side, so it straddles the card edge. */
const ARROW_OFFSET = 6
/** Keeps the arrow clear of the card's rounded corners. */
const ARROW_INSET = 16

export type Placed = { top: number; left: number; placement: TourPlacement }

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function sameRect(a: Rect | null, b: Rect): boolean {
  return !!a && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height
}

export function expandRect(rect: Rect, pad: number): Rect {
  return { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
}

function opposite(p: TourPlacement): TourPlacement {
  switch (p) {
    case "top": return "bottom"
    case "bottom": return "top"
    case "left": return "right"
    case "right": return "left"
  }
}

/**
 * Places the popover beside the spotlight. Tries the preferred side, then its
 * opposite, then the rest; whichever fits first wins. If nothing fits it sits
 * below and the clamps keep it inside the viewport.
 */
export function placeCard(spot: Rect, card: Size, preferred: TourPlacement, viewport: Size): Placed {
  const order = Array.from(new Set<TourPlacement>([preferred, opposite(preferred), "bottom", "top", "right", "left"]))
  const centreX = spot.left + spot.width / 2
  const centreY = spot.top + spot.height / 2
  const clampX = (left: number) => clamp(left, MARGIN, Math.max(MARGIN, viewport.width - MARGIN - card.width))
  const clampY = (top: number) => clamp(top, MARGIN, Math.max(MARGIN, viewport.height - MARGIN - card.height))

  for (const placement of order) {
    if (placement === "right") {
      const left = spot.left + spot.width + GAP
      if (left + card.width <= viewport.width - MARGIN) return { placement, left, top: clampY(centreY - card.height / 2) }
    } else if (placement === "left") {
      const left = spot.left - GAP - card.width
      if (left >= MARGIN) return { placement, left, top: clampY(centreY - card.height / 2) }
    } else if (placement === "bottom") {
      const top = spot.top + spot.height + GAP
      if (top + card.height <= viewport.height - MARGIN) return { placement, top, left: clampX(centreX - card.width / 2) }
    } else {
      const top = spot.top - GAP - card.height
      if (top >= MARGIN) return { placement, top, left: clampX(centreX - card.width / 2) }
    }
  }
  return { placement: "bottom", top: clampY(spot.top + spot.height + GAP), left: clampX(centreX - card.width / 2) }
}

export type ArrowGeometry = {
  /** Absolute offsets relative to the card. */
  offset: { top?: number; left?: number; right?: number; bottom?: number }
  /**
   * The arrow is a square rotated 45 degrees; this keeps only the half that
   * points at the target, so its two outer edges carry the border.
   */
  clipPath: string
}

const ARROW_CLIP: Record<TourPlacement, string> = {
  // Card to the right of the target: arrow on the card's left edge, pointing left.
  right: "polygon(0 0, 0 100%, 100% 100%)",
  // Card to the left: arrow on the right edge, pointing right.
  left: "polygon(0 0, 100% 0, 100% 100%)",
  // Card below: arrow on the top edge, pointing up.
  bottom: "polygon(0 0, 100% 0, 0 100%)",
  // Card above: arrow on the bottom edge, pointing down.
  top: "polygon(100% 0, 100% 100%, 0 100%)",
}

/** Where the arrow sits on the card so it lines up with the spotlight's centre. */
export function arrowGeometry(placed: Placed, spot: Rect, card: Size): ArrowGeometry {
  const centreX = spot.left + spot.width / 2 - placed.left
  const centreY = spot.top + spot.height / 2 - placed.top
  const along = (value: number, extent: number) => clamp(value, ARROW_INSET, extent - ARROW_INSET) - ARROW_OFFSET
  const clipPath = ARROW_CLIP[placed.placement]
  switch (placed.placement) {
    case "right":
      return { offset: { left: -ARROW_OFFSET, top: along(centreY, card.height) }, clipPath }
    case "left":
      return { offset: { right: -ARROW_OFFSET, top: along(centreY, card.height) }, clipPath }
    case "bottom":
      return { offset: { top: -ARROW_OFFSET, left: along(centreX, card.width) }, clipPath }
    case "top":
      return { offset: { bottom: -ARROW_OFFSET, left: along(centreX, card.width) }, clipPath }
  }
}
