import { describe, it, expect } from "vitest"
import {
  EMPTY_JOURNEY,
  TOUR_STEPS,
  TOUR_TARGETS,
  findStepIndex,
  hasVerdict,
  isStepApplicable,
  isStepDone,
  isWithinStep,
  journeyProblem,
  latest,
  resolveTourStep,
  stepProgress,
  type TourContext,
  type TourStep,
} from "./tour-steps"

const ctxWith = (overrides: Partial<TourContext> = {}): TourContext => ({
  pathname: "/",
  journey: EMPTY_JOURNEY,
  problems: [],
  solutions: [],
  ...overrides,
})

const step = (overrides: Partial<TourStep>): TourStep => ({ id: "x", title: "X", body: [], ...overrides })
const find = (id: string) => {
  const found = TOUR_STEPS.find((s) => s.id === id)
  if (!found) throw new Error(`No step ${id}`)
  return found
}

describe("resolveTourStep", () => {
  it("passes a static route and target through", () => {
    expect(resolveTourStep(step({ route: "/problems", target: "a" }), ctxWith())).toEqual({ route: "/problems", targets: ["a"] })
  })

  it("keeps a click chain in order", () => {
    expect(resolveTourStep(step({ target: ["tab", "button"] }), ctxWith()).targets).toEqual(["tab", "button"])
  })

  it("resolves a target from the context", () => {
    const dynamic = step({ target: (ctx) => (ctx.journey.problemId === null ? null : `card-${ctx.journey.problemId}`) })
    expect(resolveTourStep(dynamic, ctxWith()).targets).toEqual([])
    expect(resolveTourStep(dynamic, ctxWith({ journey: { problemId: 4, solutionId: null } })).targets).toEqual(["card-4"])
  })

  it("has no route or target when neither is given", () => {
    expect(resolveTourStep(step({}), ctxWith())).toEqual({ route: null, targets: [] })
  })

  it("drops the target when a route resolver returns null", () => {
    const resolver = step({ route: (ctx) => (ctx.journey.problemId === null ? null : "/x"), target: "a" })
    expect(resolveTourStep(resolver, ctxWith())).toEqual({ route: null, targets: [] })
    expect(resolveTourStep(resolver, ctxWith({ journey: { problemId: 1, solutionId: null } }))).toEqual({ route: "/x", targets: ["a"] })
  })
})

describe("isStepApplicable", () => {
  it("defaults to applicable and honours when()", () => {
    expect(isStepApplicable(step({}), ctxWith())).toBe(true)
    expect(isStepApplicable(step({ when: (ctx) => ctx.problems.length > 0 }), ctxWith())).toBe(false)
  })
})

describe("isStepDone", () => {
  it("is never done for explain steps", () => {
    expect(isStepDone(step({ done: () => true }), ctxWith(), ctxWith())).toBe(false)
  })

  it("asks the act step's done()", () => {
    const act = step({ mode: "act", done: (ctx) => ctx.pathname === "/there" })
    expect(isStepDone(act, ctxWith(), ctxWith())).toBe(false)
    expect(isStepDone(act, ctxWith({ pathname: "/there" }), ctxWith())).toBe(true)
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
    expect(findStepIndex(steps, 0, 1, ctxWith())).toBe(2)
    expect(findStepIndex(steps, 2, -1, ctxWith())).toBe(0)
  })

  it("returns null at either end", () => {
    expect(findStepIndex(steps, 2, 1, ctxWith())).toBeNull()
    expect(findStepIndex(steps, 0, -1, ctxWith())).toBeNull()
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
    expect(stepProgress(steps, 1, ctxWith())).toEqual({ current: 1, total: 2 })
    expect(stepProgress(steps, 3, ctxWith())).toEqual({ current: 2, total: 2 })
  })

  it("reports current 0 for the welcome and finish cards", () => {
    expect(stepProgress(steps, 0, ctxWith())).toEqual({ current: 0, total: 2 })
    expect(stepProgress(steps, 4, ctxWith())).toEqual({ current: 0, total: 2 })
  })
})

describe("context helpers", () => {
  it("latest picks the highest id", () => {
    expect(latest([{ id: 2 }, { id: 9 }, { id: 4 }])?.id).toBe(9)
    expect(latest([])).toBeUndefined()
  })

  it("hasVerdict is true only for a recorded verdict", () => {
    expect(hasVerdict("valid")).toBe(true)
    expect(hasVerdict("unsure")).toBe(true)
    expect(hasVerdict("invalid")).toBe(true)
    expect(hasVerdict("in_progress")).toBe(false)
    expect(hasVerdict("unvalidated")).toBe(false)
    expect(hasVerdict(undefined)).toBe(false)
  })

  it("journeyProblem finds the problem the tour created", () => {
    const ctx = ctxWith({
      journey: { problemId: 2, solutionId: null },
      problems: [
        { id: 1, title: "old", validationStatus: "valid" },
        { id: 2, title: "mine", validationStatus: "unvalidated" },
      ],
    })
    expect(journeyProblem(ctx)?.title).toBe("mine")
  })
})

describe("hands-on steps", () => {
  const problem = (id: number, validationStatus: TourContext["problems"][number]["validationStatus"] = "unvalidated") => ({
    id,
    title: `P${id}`,
    validationStatus,
  })

  it("act-define spotlights the Define card's Use this tool button", () => {
    expect(resolveTourStep(find("act-define"), ctxWith()).targets).toEqual([
      TOUR_TARGETS.identifyDefineUse,
    ])
  })

  it("act-define completes when a problem appears and captures its id", () => {
    const define = find("act-define")
    const entry = ctxWith({ problems: [problem(1)] })
    expect(isStepDone(define, entry, entry)).toBe(false)
    const after = ctxWith({ problems: [problem(1), problem(2)] })
    expect(isStepDone(define, after, entry)).toBe(true)
    expect(define.capture?.(after)).toEqual({ problemId: 2 })
  })

  it("act-describe completes when the tour's problem is opened in Explore", () => {
    const describe = find("act-describe")
    const journey = { problemId: 2, solutionId: null }
    expect(isStepDone(describe, ctxWith({ journey, pathname: "/problems/identify" }), ctxWith())).toBe(false)
    expect(isStepDone(describe, ctxWith({ journey, pathname: "/problems/2/explore/introduction" }), ctxWith())).toBe(true)
    expect(isStepDone(describe, ctxWith({ journey, pathname: "/problems/9/explore/introduction" }), ctxWith())).toBe(false)
  })

  it("act-explore routes to the tour's problem and completes on reaching validation", () => {
    const explore = find("act-explore")
    expect(resolveTourStep(explore, ctxWith()).route).toBeNull()
    const journey = { problemId: 2, solutionId: null }
    expect(resolveTourStep(explore, ctxWith({ journey })).route).toBe("/problems/2/explore/introduction")
    expect(isStepDone(explore, ctxWith({ journey, pathname: "/problems/2/validation/worth" }), ctxWith())).toBe(true)
  })

  it("act-explore counts anywhere in the problem's Explore flow as within the step", () => {
    const explore = find("act-explore")
    const journey = { problemId: 2, solutionId: null }
    expect(isWithinStep(explore, ctxWith({ journey, pathname: "/problems/2/explore/jobs-to-be-done" }))).toBe(true)
    expect(isWithinStep(explore, ctxWith({ journey, pathname: "/problems/9/explore/jobs-to-be-done" }))).toBe(false)
    expect(isWithinStep(explore, ctxWith({ journey, pathname: "/" }))).toBe(false)
    // No route to go to means there is nowhere else to be.
    expect(isWithinStep(explore, ctxWith({ pathname: "/" }))).toBe(true)
  })

  it("isWithinStep is true on the route itself for steps without a flow", () => {
    const identify = find("act-identify")
    expect(isWithinStep(identify, ctxWith({ pathname: "/" }))).toBe(true)
    expect(isWithinStep(identify, ctxWith({ pathname: "/problems" }))).toBe(false)
  })

  it("act-validate completes once the tour's problem has a verdict", () => {
    const validate = find("act-validate")
    const journey = { problemId: 2, solutionId: null }
    expect(isStepDone(validate, ctxWith({ journey, problems: [problem(2, "in_progress")] }), ctxWith())).toBe(false)
    expect(isStepDone(validate, ctxWith({ journey, problems: [problem(2, "unsure")] }), ctxWith())).toBe(true)
  })

  it("act-identify-solution completes once the Identify Solutions flow opens", () => {
    const identify = find("act-identify-solution")
    expect(resolveTourStep(identify, ctxWith()).targets).toEqual([TOUR_TARGETS.solutionsIdentify])
    expect(isStepDone(identify, ctxWith({ pathname: "/solutions" }), ctxWith())).toBe(false)
    expect(isStepDone(identify, ctxWith({ pathname: "/solutions/identify/select-problem" }), ctxWith())).toBe(true)
  })

  it("act-discover-problem chains the tour's problem card to Next and completes on leaving the step", () => {
    const pick = find("act-discover-problem")
    const journey = { problemId: 2, solutionId: null }
    expect(resolveTourStep(pick, ctxWith()).targets).toEqual([])
    expect(resolveTourStep(pick, ctxWith({ journey })).targets).toEqual([TOUR_TARGETS.discoverProblem(2), TOUR_TARGETS.discoverNext])
    expect(isStepDone(pick, ctxWith({ journey, pathname: "/solutions/identify/select-problem" }), ctxWith())).toBe(false)
    expect(isStepDone(pick, ctxWith({ journey, pathname: "/solutions/identify/pick-method" }), ctxWith())).toBe(true)
  })

  it("act-discover completes when a solution for the tour's problem exists and captures it", () => {
    const discover = find("act-discover")
    const journey = { problemId: 2, solutionId: null }
    const entry = ctxWith({ journey, solutions: [{ id: 1, problemId: 9, validationStatus: "unvalidated" }] })
    expect(isStepDone(discover, entry, entry)).toBe(false)
    const after = ctxWith({
      journey,
      solutions: [
        { id: 1, problemId: 9, validationStatus: "unvalidated" },
        { id: 2, problemId: 2, validationStatus: "unvalidated" },
      ],
    })
    expect(isStepDone(discover, after, entry)).toBe(true)
    expect(discover.capture?.(after)).toEqual({ solutionId: 2 })
  })

  it("act-discover also accepts a new solution for another problem", () => {
    const discover = find("act-discover")
    const journey = { problemId: 2, solutionId: null }
    const entry = ctxWith({ journey })
    const after = ctxWith({ journey, solutions: [{ id: 5, problemId: 9, validationStatus: "unvalidated" }] })
    expect(isStepDone(discover, after, entry)).toBe(true)
    expect(discover.capture?.(after)).toEqual({ solutionId: 5 })
  })

  it("act-validate-solution routes to the captured solution and completes on a verdict", () => {
    const validate = find("act-validate-solution")
    const journey = { problemId: 2, solutionId: 5 }
    expect(resolveTourStep(validate, ctxWith({ journey })).route).toBe("/solutions/5/validate/introduction")
    expect(isStepDone(validate, ctxWith({ journey, solutions: [{ id: 5, problemId: 2, validationStatus: "valid" }] }), ctxWith())).toBe(true)
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
    const ctx = ctxWith({ journey: { problemId: 1, solutionId: 1 } })
    for (const s of TOUR_STEPS) {
      for (const id of resolveTourStep(s, ctx).targets) {
        if (id.startsWith("sidebar-") || id.startsWith("discover-problem-")) continue
        expect(known.has(id), `${s.id} -> ${id}`).toBe(true)
      }
    }
  })

  it("every act step has a done condition", () => {
    for (const s of TOUR_STEPS) {
      if (s.mode === "act") expect(typeof s.done, s.id).toBe("function")
    }
  })
})
