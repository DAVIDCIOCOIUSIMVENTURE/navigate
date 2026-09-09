import { createModel } from "@rematch/core"
import type { RootModel } from "."
import { EMPTY_JOURNEY, type TourJourney } from "@/lib/tour-steps"

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
  /** Ids created during the hands-on steps, so later steps point at the same problem and solution. */
  journey: TourJourney
}

/** What is persisted. Expected to move to the database later. */
export interface StoredTour {
  phase: TourPhase
  stepIndex: number
  journey: TourJourney
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
  journey: EMPTY_JOURNEY,
}

function saveToStorage(state: TourState) {
  if (typeof window === "undefined") return
  try {
    const stored: StoredTour = { phase: state.phase, stepIndex: state.stepIndex, journey: state.journey }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // ignore storage errors
  }
}

function parseId(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function parseJourney(value: unknown): TourJourney {
  if (!value || typeof value !== "object") return EMPTY_JOURNEY
  const raw = value as Partial<Record<keyof TourJourney, unknown>>
  return { problemId: parseId(raw.problemId), solutionId: parseId(raw.solutionId) }
}

/**
 * Reads the stored value, accepting the earlier `{ enabled, stepIndex }` shape
 * so browsers that saw the first release keep their place.
 */
export function parseStoredTour(raw: string | null): StoredTour {
  const fallback: StoredTour = { phase: "armed", stepIndex: 0, journey: EMPTY_JOURNEY }
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTour> & { enabled?: unknown }
    const stepIndex = parseId(parsed.stepIndex) ?? 0
    const journey = parseJourney(parsed.journey)
    if (isTourPhase(parsed.phase)) return { phase: parsed.phase, stepIndex: Math.max(0, stepIndex), journey }
    if (typeof parsed.enabled === "boolean") {
      return parsed.enabled
        ? { phase: stepIndex > 0 ? "paused" : "armed", stepIndex: Math.max(0, stepIndex), journey }
        : { phase: "off", stepIndex: 0, journey: EMPTY_JOURNEY }
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
      let next: TourState
      if (stored.phase === "off") {
        next = { hydrated: true, phase: "off", stepIndex: 0, journey: EMPTY_JOURNEY }
      } else if (stored.phase === "armed") {
        next = { hydrated: true, phase: "running", stepIndex: 0, journey: EMPTY_JOURNEY }
      } else {
        next = { hydrated: true, phase: "running", stepIndex: stored.stepIndex, journey: stored.journey }
      }
      saveToStorage(next)
      return next
    },
    /** Starts (or restarts) from the welcome dialog, whatever the current phase. */
    start(state): TourState {
      const next: TourState = { ...state, hydrated: true, phase: "running", stepIndex: 0, journey: EMPTY_JOURNEY }
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
    /** Remembers ids created during the hands-on steps. */
    setJourney(state, patch: Partial<TourJourney>): TourState {
      const next: TourState = { ...state, journey: { ...state.journey, ...patch } }
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
      const next: TourState = { ...state, phase: "off", stepIndex: 0, journey: EMPTY_JOURNEY }
      saveToStorage(next)
      return next
    },
    /**
     * The Settings switch. Turning it on arms the tour for the next load;
     * turning it off also closes a tour that is currently running.
     */
    setEnabled(state, enabled: boolean): TourState {
      if (enabled === isTourEnabled(state.phase)) return state
      const next: TourState = { ...state, phase: enabled ? "armed" : "off", stepIndex: 0, journey: EMPTY_JOURNEY }
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
