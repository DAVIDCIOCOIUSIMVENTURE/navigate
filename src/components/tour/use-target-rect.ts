"use client"

import { useEffect, useState } from "react"
import { sameRect, type Rect } from "./geometry"

/** How long to wait for a target to appear before giving up on it. */
const TARGET_TIMEOUT_MS = 2500

export type TargetStatus =
  /** Looking for the element, or waiting for the page it lives on. */
  | "pending"
  /** Found and visible; `rect` is current. */
  | "found"
  /** Never appeared within the timeout, or there was no target to look for. */
  | "missing"

export type TargetState = { status: TargetStatus; rect: Rect | null }

/**
 * Finds the element carrying `data-tour={targetId}` and tracks its bounding
 * box every frame, so the spotlight follows layout changes such as the sidebar
 * animating open or a table scrolling.
 *
 * - `waiting` holds the search off (used while a route change is in flight).
 * - `resetKey` restarts the search, for example when the pathname changes.
 */
export function useTargetRect(targetId: string | null, waiting: boolean, resetKey: string): TargetState {
  const [state, setState] = useState<TargetState>({ rect: null, status: "pending" })

  useEffect(() => {
    if (waiting) {
      setState({ rect: null, status: "pending" })
      return
    }
    if (!targetId) {
      setState({ rect: null, status: "missing" })
      return
    }
    setState({ rect: null, status: "pending" })

    let element: HTMLElement | null = null
    let lastRect: Rect | null = null
    let cancelled = false
    let raf = 0
    const started = performance.now()

    const tick = () => {
      if (cancelled) return
      if (!element || !element.isConnected) {
        element = document.querySelector<HTMLElement>(`[data-tour="${targetId}"]`)
        if (element) {
          element.scrollIntoView({ block: "nearest", inline: "nearest" })
        }
      }
      if (element) {
        const r = element.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) {
          // Rendered but hidden (for example `hidden md:block`); keep looking until the timeout.
          element = null
        } else {
          const next = { top: r.top, left: r.left, width: r.width, height: r.height }
          if (!sameRect(lastRect, next)) {
            lastRect = next
            setState({ rect: next, status: "found" })
          }
        }
      }
      if (!element && performance.now() - started > TARGET_TIMEOUT_MS) {
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
  }, [targetId, waiting, resetKey])

  return state
}
