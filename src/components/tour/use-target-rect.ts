"use client"

import { useEffect, useState } from "react"
import { sameRect, type Rect } from "./geometry"

/** How long to wait for a target to appear before giving up on it. */
const TARGET_TIMEOUT_MS = 2500

export type TargetStatus =
  /** Looking for an element, or waiting for the page it lives on. */
  | "pending"
  /** Found and visible; `rect` is current. */
  | "found"
  /** Nothing appeared within the timeout, or there was nothing to look for. */
  | "missing"

export type TargetState = { status: TargetStatus; rect: Rect | null }

function isUsable(element: HTMLElement): boolean {
  if (element.matches(":disabled, [aria-disabled='true']")) return false
  const r = element.getBoundingClientRect()
  // Zero size means rendered but hidden (for example `hidden md:block`).
  return r.width > 0 || r.height > 0
}

/**
 * Picks the element to spotlight from a click chain: the last id in the list
 * that is rendered, visible and enabled. Earlier ids are the clicks that
 * reveal or enable the later ones (a tab that mounts its panel, a card that
 * enables Next), so the spotlight moves along the chain as the user clicks.
 */
function findChainTarget(targetIds: string[]): HTMLElement | null {
  for (let i = targetIds.length - 1; i >= 0; i -= 1) {
    const element = document.querySelector<HTMLElement>(`[data-tour="${targetIds[i]}"]`)
    if (element && isUsable(element)) return element
  }
  return null
}

/**
 * Tracks the bounding box of the current target every frame, so the spotlight
 * follows layout changes such as the sidebar animating open or a table
 * scrolling, and moves along a click chain as later targets appear.
 *
 * - `waiting` holds the search off (used while a route change is in flight).
 * - `resetKey` restarts the search, for example when the pathname changes.
 */
export function useTargetRect(targetIds: string[], waiting: boolean, resetKey: string): TargetState {
  const [state, setState] = useState<TargetState>({ rect: null, status: "pending" })
  const chainKey = targetIds.join("|")

  useEffect(() => {
    if (waiting) {
      setState({ rect: null, status: "pending" })
      return
    }
    if (targetIds.length === 0) {
      setState({ rect: null, status: "missing" })
      return
    }
    setState({ rect: null, status: "pending" })

    let current: HTMLElement | null = null
    let lastRect: Rect | null = null
    let cancelled = false
    let raf = 0
    const started = performance.now()

    const tick = () => {
      if (cancelled) return
      const element = findChainTarget(targetIds)
      if (element && element !== current) {
        element.scrollIntoView({ block: "nearest", inline: "nearest" })
      }
      current = element
      if (element) {
        const r = element.getBoundingClientRect()
        const next = { top: r.top, left: r.left, width: r.width, height: r.height }
        if (!sameRect(lastRect, next)) {
          lastRect = next
          setState({ rect: next, status: "found" })
        }
      } else if (performance.now() - started > TARGET_TIMEOUT_MS) {
        setState({ rect: null, status: "missing" })
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
    // `chainKey` stands in for the array so a fresh array with the same ids does not restart the search.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainKey, waiting, resetKey])

  return state
}
