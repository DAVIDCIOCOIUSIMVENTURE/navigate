import { describe, it, expect } from "vitest"
import {
  TOUR_STEPS,
  TOUR_TARGETS,
  findStepIndex,
  isStepApplicable,
  resolveTourStep,
  stepProgress,
  type TourContext,
  type TourStep,
} from "./tour-steps"

const noProblems: TourContext = { firstProblemId: null }
const withProblem: TourContext = { firstProblemId: 42 }

const step = (overrides: Partial<TourStep>): TourStep => ({ id: "x", title: "X", body: [], ...overrides })

describe("resolveTourStep", () => {
  it("passes a static route and target through", () => {
    expect(resolveTourStep(step({ route: "/problems", target: "a" }), noProblems)).toEqual({ route: "/problems", target: "a" })
  })

  it("has no route or target when neither is given", () => {
    expect(resolveTourStep(step({}), noProblems)).toEqual({ route: null, target: null })
  })

  it("drops the target when a route resolver returns null", () => {
    const explore = TOUR_STEPS.find((s) => s.id === "explore-problem")!
    expect(resolveTourStep(explore, noProblems)).toEqual({ route: null, target: null })
    expect(resolveTourStep(explore, withProblem)).toEqual({ route: "/problems/42", target: TOUR_TARGETS.canvasExplore })
  })
})

describe("isStepApplicable", () => {
  it("defaults to applicable and honours when()", () => {
    expect(isStepApplicable(step({}), noProblems)).toBe(true)
    expect(isStepApplicable(step({ when: (ctx) => ctx.firstProblemId !== null }), noProblems)).toBe(false)
    expect(isStepApplicable(step({ when: (ctx) => ctx.firstProblemId !== null }), withProblem)).toBe(true)
  })
})

describe("findStepIndex", () => {
  const steps: TourStep[] = [
    step({ id: "a" }),
    step({ id: "b", when: () => false }),
    step({ id: "c" }),
    step({ id: "d", when: () => false }),
  ]

  it("skips inapplicable steps going forward and back", () => {
    expect(findStepIndex(steps, 0, 1, noProblems)).toBe(2)
    expect(findStepIndex(steps, 2, -1, noProblems)).toBe(0)
  })

  it("returns null at either end", () => {
    expect(findStepIndex(steps, 2, 1, noProblems)).toBeNull()
    expect(findStepIndex(steps, 0, -1, noProblems)).toBeNull()
  })
})

describe("stepProgress", () => {
  const steps: TourStep[] = [
    step({ id: "welcome", variant: "welcome" }),
    step({ id: "a" }),
    step({ id: "b", when: () => false }),
    step({ id: "c" }),
    step({ id: "finish", variant: "finish" }),
  ]

  it("counts only ordinary applicable steps", () => {
    expect(stepProgress(steps, 1, noProblems)).toEqual({ current: 1, total: 2 })
    expect(stepProgress(steps, 3, noProblems)).toEqual({ current: 2, total: 2 })
  })

  it("reports current 0 for the welcome and finish cards", () => {
    expect(stepProgress(steps, 0, noProblems)).toEqual({ current: 0, total: 2 })
    expect(stepProgress(steps, 4, noProblems)).toEqual({ current: 0, total: 2 })
  })
})

describe("TOUR_STEPS", () => {
  it("opens with the welcome card and closes with the finish card", () => {
    expect(TOUR_STEPS[0].variant).toBe("welcome")
    expect(TOUR_STEPS[TOUR_STEPS.length - 1].variant).toBe("finish")
  })

  it("has unique ids", () => {
    const ids = TOUR_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("only anchors to known targets", () => {
    const known = new Set<string>(
      Object.values(TOUR_TARGETS).flatMap((v) => (typeof v === "function" ? [] : [v])),
    )
    for (const s of TOUR_STEPS) {
      if (s.target && !s.target.startsWith("sidebar-")) expect(known.has(s.target), s.id).toBe(true)
    }
  })
})
