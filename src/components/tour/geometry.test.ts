import { describe, it, expect } from "vitest"
import { GAP, MARGIN, arrowGeometry, expandRect, maskPanels, placeCard, sameRect, type Rect } from "./geometry"

const viewport = { width: 1440, height: 900 }
const card = { width: 352, height: 200 }

describe("placeCard", () => {
  it("uses the preferred side when it fits", () => {
    const spot: Rect = { top: 100, left: 10, width: 200, height: 40 }
    const placed = placeCard(spot, card, "right", viewport)
    expect(placed.placement).toBe("right")
    expect(placed.left).toBe(10 + 200 + GAP)
    expect(placed.top).toBe(100 + 20 - card.height / 2)
  })

  it("flips to the opposite side when the preferred side has no room", () => {
    const spot: Rect = { top: 100, left: 1200, width: 200, height: 40 }
    const placed = placeCard(spot, card, "right", viewport)
    expect(placed.placement).toBe("left")
    expect(placed.left).toBe(1200 - GAP - card.width)
  })

  it("puts a header-style target's card below it, centred horizontally", () => {
    const spot: Rect = { top: 10, left: 700, width: 40, height: 40 }
    const placed = placeCard(spot, card, "bottom", viewport)
    expect(placed.placement).toBe("bottom")
    expect(placed.top).toBe(10 + 40 + GAP)
    expect(placed.left).toBe(720 - card.width / 2)
  })

  it("falls through to another side when neither preferred nor opposite fits", () => {
    // Very tall target near the bottom: no room below or above, so it goes right.
    const spot: Rect = { top: 20, left: 10, width: 200, height: 860 }
    const placed = placeCard(spot, card, "bottom", viewport)
    expect(placed.placement).toBe("right")
  })

  it("clamps the card inside the viewport margins", () => {
    const spot: Rect = { top: 0, left: 0, width: 20, height: 20 }
    const placed = placeCard(spot, card, "right", viewport)
    expect(placed.top).toBe(MARGIN)
    const farRight: Rect = { top: 0, left: 1420, width: 20, height: 20 }
    const below = placeCard(farRight, card, "bottom", viewport)
    expect(below.left).toBe(viewport.width - MARGIN - card.width)
  })
})

describe("arrowGeometry", () => {
  const spot: Rect = { top: 100, left: 10, width: 200, height: 40 }

  it("sits on the left edge, level with the target, when the card is to the right", () => {
    const placed = placeCard(spot, card, "right", viewport)
    const arrow = arrowGeometry(placed, spot, card)
    expect(arrow.offset.left).toBe(-6)
    // Target centre is at the card's vertical centre, minus half the arrow.
    expect(arrow.offset.top).toBe(card.height / 2 - 6)
    expect(arrow.clipPath).toBe("polygon(0 0, 0 100%, 100% 100%)")
  })

  it("keeps the arrow clear of the rounded corners", () => {
    const placed = { top: 0, left: 0, placement: "bottom" as const }
    const edgeSpot: Rect = { top: -50, left: -100, width: 10, height: 10 }
    const arrow = arrowGeometry(placed, edgeSpot, card)
    expect(arrow.offset.left).toBe(16 - 6)
  })

  it("uses the opposite clip for each side", () => {
    const placedTop = { top: 0, left: 0, placement: "top" as const }
    expect(arrowGeometry(placedTop, spot, card).offset.bottom).toBe(-6)
    const placedLeft = { top: 0, left: 0, placement: "left" as const }
    expect(arrowGeometry(placedLeft, spot, card).offset.right).toBe(-6)
  })
})

describe("maskPanels", () => {
  it("covers the viewport except the hole", () => {
    const hole: Rect = { top: 100, left: 200, width: 50, height: 40 }
    const panels = maskPanels(hole, viewport)
    expect(panels).toEqual([
      { top: 0, left: 0, width: 1440, height: 100 },
      { top: 140, left: 0, width: 1440, height: 760 },
      { top: 100, left: 0, width: 200, height: 40 },
      { top: 100, left: 250, width: 1190, height: 40 },
    ])
    const area = panels.reduce((sum, p) => sum + p.width * p.height, 0)
    expect(area).toBe(1440 * 900 - 50 * 40)
  })

  it("drops empty panels when the hole touches an edge", () => {
    const hole: Rect = { top: 0, left: 0, width: 50, height: 40 }
    const panels = maskPanels(hole, viewport)
    expect(panels).toHaveLength(2)
    expect(panels.every((p) => p.width > 0 && p.height > 0)).toBe(true)
  })
})

describe("rect helpers", () => {
  it("expandRect pads on every side", () => {
    expect(expandRect({ top: 10, left: 20, width: 30, height: 40 }, 6)).toEqual({ top: 4, left: 14, width: 42, height: 52 })
  })

  it("sameRect compares by value and treats null as different", () => {
    const a: Rect = { top: 1, left: 2, width: 3, height: 4 }
    expect(sameRect(a, { ...a })).toBe(true)
    expect(sameRect(a, { ...a, top: 0 })).toBe(false)
    expect(sameRect(null, a)).toBe(false)
  })
})
