import { describe, it, expect } from "vitest"
import { tour, parseStoredTour, isTourEnabled, type TourState } from "./tour-model"

const reducers = tour.reducers
const initialState = tour.state

const running = (stepIndex: number): TourState => ({ hydrated: true, phase: "running", stepIndex })

describe("tour model reducers", () => {
  it("starts un-hydrated and armed", () => {
    expect(initialState).toEqual({ hydrated: false, phase: "armed", stepIndex: 0 })
  })

  describe("hydrate", () => {
    it("armed opens at the welcome step", () => {
      expect(reducers.hydrate(initialState, { phase: "armed", stepIndex: 7 })).toEqual(running(0))
    })

    it("paused resumes at the saved step", () => {
      expect(reducers.hydrate(initialState, { phase: "paused", stepIndex: 4 })).toEqual(running(4))
    })

    it("running (tab closed mid-tour) resumes at the saved step", () => {
      expect(reducers.hydrate(initialState, { phase: "running", stepIndex: 9 })).toEqual(running(9))
    })

    it("off stays off", () => {
      expect(reducers.hydrate(initialState, { phase: "off", stepIndex: 4 })).toEqual({
        hydrated: true,
        phase: "off",
        stepIndex: 0,
      })
    })
  })

  it("start restarts from the welcome step from any phase", () => {
    const off = reducers.finish(running(3))
    expect(reducers.start(off)).toEqual(running(0))
    expect(reducers.start(running(5))).toEqual(running(0))
  })

  it("resume reopens a paused tour in place and ignores an off tour", () => {
    const paused = reducers.stop(running(3))
    expect(reducers.resume(paused)).toEqual(running(3))
    const off = reducers.finish(running(3))
    expect(reducers.resume(off)).toBe(off)
  })

  it("goTo clamps negative indices to zero", () => {
    expect(reducers.goTo(running(0), 3).stepIndex).toBe(3)
    expect(reducers.goTo(running(0), -2).stepIndex).toBe(0)
  })

  describe("stop", () => {
    it("pauses mid-tour and keeps the step", () => {
      expect(reducers.stop(running(2))).toEqual({ hydrated: true, phase: "paused", stepIndex: 2 })
    })

    it("re-arms when closed on the welcome step", () => {
      expect(reducers.stop(running(0))).toEqual({ hydrated: true, phase: "armed", stepIndex: 0 })
    })
  })

  it("finish switches the tour off and resets the step", () => {
    expect(reducers.finish(running(5))).toEqual({ hydrated: true, phase: "off", stepIndex: 0 })
  })

  describe("setEnabled", () => {
    it("false closes a running tour and switches it off", () => {
      expect(reducers.setEnabled(running(2), false)).toEqual({ hydrated: true, phase: "off", stepIndex: 0 })
    })

    it("true arms an off tour without starting it", () => {
      const off = reducers.finish(running(2))
      expect(reducers.setEnabled(off, true)).toEqual({ hydrated: true, phase: "armed", stepIndex: 0 })
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
    expect(parseStoredTour(null)).toEqual({ phase: "armed", stepIndex: 0 })
  })

  it("reads the current shape", () => {
    expect(parseStoredTour(JSON.stringify({ phase: "paused", stepIndex: 6 }))).toEqual({ phase: "paused", stepIndex: 6 })
  })

  it("migrates the earlier enabled flag", () => {
    expect(parseStoredTour(JSON.stringify({ enabled: false, stepIndex: 3 }))).toEqual({ phase: "off", stepIndex: 0 })
    expect(parseStoredTour(JSON.stringify({ enabled: true, stepIndex: 0 }))).toEqual({ phase: "armed", stepIndex: 0 })
    expect(parseStoredTour(JSON.stringify({ enabled: true, stepIndex: 3 }))).toEqual({ phase: "paused", stepIndex: 3 })
  })

  it("falls back on garbage", () => {
    expect(parseStoredTour("not json")).toEqual({ phase: "armed", stepIndex: 0 })
    expect(parseStoredTour(JSON.stringify({ phase: "bogus", stepIndex: "x" }))).toEqual({ phase: "armed", stepIndex: 0 })
  })
})
