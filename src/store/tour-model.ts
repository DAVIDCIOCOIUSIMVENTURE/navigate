import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-tour"

/**
 * The tour's lifecycle, as one explicit state:
 *
 * - `armed`: switched on and waiting; the welcome dialog opens on the next load.
 *   This is the state for a first visit.
 * - `running`: the overlay is visible at `stepIndex`.
 * - `paused`: closed part-way through; the same step reopens on the next load.
 * - `off`: switched off (finished, skipped, or disabled in Settings). Nothing
 *   opens until the user turns it back on.
 *
 * Transitions:
 *   armed   --start / hydrate-->  running
 *   paused  --resume / hydrate--> running
 *   running --stop-------------->  paused (or armed when still on the welcome step)
 *   running --finish------------>  off
 *   any     --setEnabled(false)->  off
 *   off     --setEnabled(true)-->  armed
 *   off     --start------------->  running
 */
export type TourPhase = "armed" | "running" | "paused" | "off"

export interface TourState {
  /** True once localStorage has been read, so the overlay never flashes before hydration. */
  hydrated: boolean
  phase: TourPhase
  /** Index into TOUR_STEPS. Kept while paused so the tour resumes in place. */
  stepIndex: number
}

/** What is persisted. Expected to move to the database later. */
export interface StoredTour {
  phase: TourPhase
  stepIndex: number
}

const PHASES: readonly TourPhase[] = ["armed", "running", "paused", "off"]

export function isTourPhase(value: unknown): value is TourPhase {
  return typeof value === "string" && (PHASES as readonly string[]).includes(value)
}

/** The user-facing on/off setting shown in Settings. */
export function isTourEnabled(phase: TourPhase): boolean {
  return phase !== "off"
}

const defaultState: TourState = {
  hydrated: false,
  phase: "armed",
  stepIndex: 0,
}

function saveToStorage(state: TourState) {
  if (typeof window === "undefined") return
  try {
    const stored: StoredTour = { phase: state.phase, stepIndex: state.stepIndex }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // ignore storage errors
  }
}

/**
 * Reads the stored value, accepting the earlier `{ enabled, stepIndex }` shape
 * so browsers that saw the first release keep their place.
 */
export function parseStoredTour(raw: string | null): StoredTour {
  const fallback: StoredTour = { phase: "armed", stepIndex: 0 }
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTour> & { enabled?: unknown }
    const stepIndex =
      typeof parsed.stepIndex === "number" && Number.isFinite(parsed.stepIndex) ? Math.max(0, parsed.stepIndex) : 0
    if (isTourPhase(parsed.phase)) return { phase: parsed.phase, stepIndex }
    if (typeof parsed.enabled === "boolean") {
      return parsed.enabled ? { phase: stepIndex > 0 ? "paused" : "armed", stepIndex } : { phase: "off", stepIndex: 0 }
    }
    return fallback
  } catch {
    return fallback
  }
}

export const tour = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    /** Applies the stored value. Anything not switched off resumes straight away. */
    hydrate(state, stored: StoredTour): TourState {
      const next: TourState =
        stored.phase === "off"
          ? { hydrated: true, phase: "off", stepIndex: 0 }
          : { hydrated: true, phase: "running", stepIndex: stored.phase === "armed" ? 0 : stored.stepIndex }
      saveToStorage(next)
      return next
    },
    /** Starts (or restarts) from the welcome dialog, whatever the current phase. */
    start(state): TourState {
      const next: TourState = { ...state, hydrated: true, phase: "running", stepIndex: 0 }
      saveToStorage(next)
      return next
    },
    /** Reopens a paused tour at the step it was closed on. */
    resume(state): TourState {
      if (state.phase === "off") return state
      const next: TourState = { ...state, phase: "running" }
      saveToStorage(next)
      return next
    },
    goTo(state, stepIndex: number): TourState {
      const next: TourState = { ...state, stepIndex: Math.max(0, stepIndex) }
      saveToStorage(next)
      return next
    },
    /**
     * Hides the overlay but keeps the setting on and the current step. Used by
     * the close cross on any step and by the welcome dialog's Close button
     * when "Don't show this again" is not ticked.
     */
    stop(state): TourState {
      const next: TourState = { ...state, phase: state.stepIndex === 0 ? "armed" : "paused" }
      saveToStorage(next)
      return next
    },
    /** Ends the tour and switches it off so it does not show again. */
    finish(state): TourState {
      const next: TourState = { ...state, phase: "off", stepIndex: 0 }
      saveToStorage(next)
      return next
    },
    /**
     * The Settings switch. Turning it on arms the tour for the next load;
     * turning it off also closes a tour that is currently running.
     */
    setEnabled(state, enabled: boolean): TourState {
      if (enabled === isTourEnabled(state.phase)) return state
      const next: TourState = enabled
        ? { ...state, phase: "armed", stepIndex: 0 }
        : { ...state, phase: "off", stepIndex: 0 }
      saveToStorage(next)
      return next
    },
  },

  effects: (dispatch) => ({
    init() {
      if (typeof window === "undefined") return
      let raw: string | null = null
      try {
        raw = localStorage.getItem(STORAGE_KEY)
      } catch {
        raw = null
      }
      dispatch.tour.hydrate(parseStoredTour(raw))
    },
  }),
})
