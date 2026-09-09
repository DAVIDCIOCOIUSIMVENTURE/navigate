import { describe, it, expect } from "vitest"
import { tour, parseStoredTour, isTourEnabled, type TourState } from "./tour-model"
import { EMPTY_JOURNEY } from "@/lib/tour-steps"

const reducers = tour.reducers
const initialState = tour.state

const running = (stepIndex: number, journey = EMPTY_JOURNEY): TourState => ({ hydrated: true, phase: "running", stepIndex, journey })
const midJourney = { problemId: 7, solutionId: null }

describe("tour model reducers", () => {
  it("starts un-hydrated and armed with an empty journey", () => {
    expect(initialState).toEqual({ hydrated: false, phase: "armed", stepIndex: 0, journey: EMPTY_JOURNEY })
  })

  describe("hydrate", () => {
    it("armed opens at the welcome step with a fresh journey", () => {
      expect(reducers.hydrate(initialState, { phase: "armed", stepIndex: 7, journey: midJourney })).toEqual(running(0))
    })

    it("paused resumes at the saved step with its journey", () => {
      expect(reducers.hydrate(initialState, { phase: "paused", stepIndex: 4, journey: midJourney })).toEqual(running(4, midJourney))
    })

    it("running (tab closed mid-tour) resumes at the saved step", () => {
      expect(reducers.hydrate(initialState, { phase: "running", stepIndex: 9, journey: midJourney })).toEqual(running(9, midJourney))
    })

    it("off stays off", () => {
      expect(reducers.hydrate(initialState, { phase: "off", stepIndex: 4, journey: midJourney })).toEqual({
        hydrated: true,
        phase: "off",
        stepIndex: 0,
        journey: EMPTY_JOURNEY,
      })
    })
  })

  it("start restarts from the welcome step and clears the journey", () => {
    const off = reducers.finish(running(3))
    expect(reducers.start(off)).toEqual(running(0))
    expect(reducers.start(running(5, midJourney))).toEqual(running(0))
  })

  it("resume reopens a paused tour in place and ignores an off tour", () => {
    const paused = reducers.stop(running(3, midJourney))
    expect(reducers.resume(paused)).toEqual(running(3, midJourney))
    const off = reducers.finish(running(3))
    expect(reducers.resume(off)).toBe(off)
  })

  it("goTo clamps negative indices to zero", () => {
    expect(reducers.goTo(running(0), 3).stepIndex).toBe(3)
    expect(reducers.goTo(running(0), -2).stepIndex).toBe(0)
  })

  it("setJourney merges the patch", () => {
    const withProblem = reducers.setJourney(running(3), { problemId: 7 })
    expect(withProblem.journey).toEqual({ problemId: 7, solutionId: null })
    expect(reducers.setJourney(withProblem, { solutionId: 2 }).journey).toEqual({ problemId: 7, solutionId: 2 })
  })

  describe("stop", () => {
    it("pauses mid-tour and keeps the step and journey", () => {
      expect(reducers.stop(running(2, midJourney))).toEqual({ hydrated: true, phase: "paused", stepIndex: 2, journey: midJourney })
    })

    it("re-arms when closed on the welcome step", () => {
      expect(reducers.stop(running(0))).toEqual({ hydrated: true, phase: "armed", stepIndex: 0, journey: EMPTY_JOURNEY })
    })
  })

  it("finish switches the tour off and resets the step and journey", () => {
    expect(reducers.finish(running(5, midJourney))).toEqual({ hydrated: true, phase: "off", stepIndex: 0, journey: EMPTY_JOURNEY })
  })

  describe("setEnabled", () => {
    it("false closes a running tour and switches it off", () => {
      expect(reducers.setEnabled(running(2, midJourney), false)).toEqual({ hydrated: true, phase: "off", stepIndex: 0, journey: EMPTY_JOURNEY })
    })

    it("true arms an off tour without starting it", () => {
      const off = reducers.finish(running(2))
      expect(reducers.setEnabled(off, true)).toEqual({ hydrated: true, phase: "armed", stepIndex: 0, journey: EMPTY_JOURNEY })
    })

    it("is a no-op when the setting already matches", () => {
      const paused = reducers.stop(running(2))
      expect(reducers.setEnabled(paused, true)).toBe(paused)
    })
  })

  it("reducers return a new object reference", () => {
    expect(reducers.start(initialState)).not.toBe(initialState)
  })
})

describe("isTourEnabled", () => {
  it("is true for every phase except off", () => {
    expect(isTourEnabled("armed")).toBe(true)
    expect(isTourEnabled("running")).toBe(true)
    expect(isTourEnabled("paused")).toBe(true)
    expect(isTourEnabled("off")).toBe(false)
  })
})

describe("parseStoredTour", () => {
  it("arms the tour when nothing is stored", () => {
    expect(parseStoredTour(null)).toEqual({ phase: "armed", stepIndex: 0, journey: EMPTY_JOURNEY })
  })

  it("reads the current shape", () => {
    expect(parseStoredTour(JSON.stringify({ phase: "paused", stepIndex: 6, journey: midJourney }))).toEqual({
      phase: "paused",
      stepIndex: 6,
      journey: midJourney,
    })
  })

  it("defaults a missing or malformed journey", () => {
    expect(parseStoredTour(JSON.stringify({ phase: "paused", stepIndex: 6 })).journey).toEqual(EMPTY_JOURNEY)
    expect(parseStoredTour(JSON.stringify({ phase: "paused", stepIndex: 6, journey: { problemId: "x" } })).journey).toEqual(EMPTY_JOURNEY)
  })

  it("migrates the earlier enabled flag", () => {
    expect(parseStoredTour(JSON.stringify({ enabled: false, stepIndex: 3 }))).toEqual({ phase: "off", stepIndex: 0, journey: EMPTY_JOURNEY })
    expect(parseStoredTour(JSON.stringify({ enabled: true, stepIndex: 0 }))).toEqual({ phase: "armed", stepIndex: 0, journey: EMPTY_JOURNEY })
    expect(parseStoredTour(JSON.stringify({ enabled: true, stepIndex: 3 }))).toEqual({ phase: "paused", stepIndex: 3, journey: EMPTY_JOURNEY })
  })

  it("falls back on garbage", () => {
    expect(parseStoredTour("not json")).toEqual({ phase: "armed", stepIndex: 0, journey: EMPTY_JOURNEY })
    expect(parseStoredTour(JSON.stringify({ phase: "bogus", stepIndex: "x" }))).toEqual({ phase: "armed", stepIndex: 0, journey: EMPTY_JOURNEY })
  })
})
