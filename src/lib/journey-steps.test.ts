import {
  completedJourneySteps,
  computeJourneySteps,
  identifyOriginOf,
  JOURNEY_STEPS,
  journeySolutionId,
  journeyStepHref,
  problemJourneyStep,
  summariseProblemJourney,
  NO_JOURNEY_TARGET,
  type IdentifyOrigin,
  type JourneyTarget,
  type ProblemJourneySummary,
} from "./journey-steps"
import type { Problem } from "@/store/problems-model"
import type { Solution } from "@/types/solution"

const problem = (over: Partial<ProblemJourneySummary> = {}): ProblemJourneySummary => ({
  validationStatus: "unvalidated",
  jobCount: 0,
  existingSolutionCount: 0,
  solutionCount: 0,
  validatedSolutionCount: 0,
  ...over,
})

describe("JOURNEY_STEPS", () => {
  it("lists the five milestones in order, without Self Discovery", () => {
    expect(JOURNEY_STEPS.map((s) => s.id)).toEqual([
      "identify-problems",
      "explore-problems",
      "validate-problems",
      "identify-solutions",
      "validate-solutions",
    ])
  })
})

describe("identifyOriginOf", () => {
  const stored = (over: Partial<Problem>): Pick<Problem, "source" | "reflection"> =>
    ({ source: "manual", reflection: null, ...over }) as Problem

  it("names the lens a guided-prompt tool captured, whatever the source says", () => {
    expect(
      identifyOriginOf(stored({ source: "identify", reflection: { lensId: "life", capturedAt: "", prompts: [] } }), null),
    ).toEqual({ tool: "lens", lensId: "life" })
  })

  it("leads to the hub for a lens the hub no longer offers, rather than a URL that bounces", () => {
    expect(
      identifyOriginOf(stored({ source: "identify", reflection: { lensId: "market", capturedAt: "", prompts: [] } }), null),
    ).toEqual({ tool: "hub" })
  })

  it("names the research method from the capture beside the problem", () => {
    expect(identifyOriginOf(stored({ source: "research" }), "low-rated-tools")).toEqual({
      tool: "research",
      methodId: "low-rated-tools",
    })
    expect(identifyOriginOf(stored({ source: "research" }), null)).toEqual({ tool: "research", methodId: null })
    expect(identifyOriginOf(stored({ source: "research" }), "no-such-method")).toEqual({
      tool: "research",
      methodId: null,
    })
  })

  it("ignores a research capture left beside a problem another tool identified", () => {
    expect(identifyOriginOf(stored({ source: "identify" }), "low-rated-tools")).toEqual({ tool: "canvas-builder" })
  })

  it("falls back to the Canvas Builder, and to the hub for a problem written by hand", () => {
    expect(identifyOriginOf(stored({ source: "identify" }), null)).toEqual({ tool: "canvas-builder" })
    expect(identifyOriginOf(stored({ source: "manual" }), null)).toEqual({ tool: "hub" })
  })

  it("leads to the hub for a problem saved before the guided tools recorded their lens", () => {
    expect(identifyOriginOf(stored({ source: "reflect" }), null)).toEqual({ tool: "hub" })
  })
})

describe("journeySolutionId", () => {
  const solution = (id: number, problemId: number, validationStatus: Solution["validationStatus"]) =>
    ({ id, problemId, validationStatus }) as Solution

  it("has nothing to open while the problem has no solutions", () => {
    expect(journeySolutionId(7, [solution(1, 8, "unvalidated")])).toBeNull()
  })

  it("opens the first linked solution still without a verdict", () => {
    expect(journeySolutionId(7, [solution(1, 7, "valid"), solution(2, 7, "in_progress"), solution(3, 7, "unvalidated")])).toBe(2)
  })

  it("falls back to the first linked solution once every one has a verdict", () => {
    expect(journeySolutionId(7, [solution(1, 8, "valid"), solution(2, 7, "invalid"), solution(3, 7, "valid")])).toBe(2)
  })
})

describe("journeyStepHref", () => {
  const step = (id: (typeof JOURNEY_STEPS)[number]["id"]) => JOURNEY_STEPS.find((s) => s.id === id)!
  const target = (origin: IdentifyOrigin, solutionId: number | null = null): JourneyTarget => ({ origin, solutionId })

  it("leads home outside a project", () => {
    expect(journeyStepHref(step("explore-problems"), null, NO_JOURNEY_TARGET)).toBe("/")
    expect(journeyStepHref(step("identify-problems"), null, target({ tool: "hub" }))).toBe("/")
  })

  it("leads to the identify hub, and otherwise the project page, while the project has no problem", () => {
    expect(journeyStepHref(step("identify-problems"), 3, NO_JOURNEY_TARGET)).toBe("/projects/3/identify")
    expect(journeyStepHref(step("explore-problems"), 3, NO_JOURNEY_TARGET)).toBe("/projects/3")
    expect(journeyStepHref(step("identify-solutions"), 3, NO_JOURNEY_TARGET)).toBe("/projects/3")
  })

  it("points each step at the project's own flows once it has a problem", () => {
    const t = target({ tool: "canvas-builder" }, 12)
    expect(journeyStepHref(step("identify-problems"), 3, t)).toBe("/projects/3/identify/canvas-builder")
    expect(journeyStepHref(step("explore-problems"), 3, t)).toBe("/projects/3/problem/explore/introduction")
    expect(journeyStepHref(step("validate-problems"), 3, t)).toBe("/projects/3/problem/validation/introduction")
    expect(journeyStepHref(step("identify-solutions"), 3, t)).toBe("/projects/3/solutions/identify/pick-method")
    expect(journeyStepHref(step("validate-solutions"), 3, t)).toBe("/projects/3/solutions/12/validate/introduction")
  })

  it("sends Identify problem back to the tool the problem came from, on its review step", () => {
    expect(journeyStepHref(step("identify-problems"), 3, target({ tool: "lens", lensId: "life" }))).toBe(
      "/projects/3/identify/life/review",
    )
    expect(journeyStepHref(step("identify-problems"), 3, target({ tool: "research", methodId: "open-data" }))).toBe(
      "/projects/3/identify/research/open-data/review",
    )
    expect(journeyStepHref(step("identify-problems"), 3, target({ tool: "research", methodId: null }))).toBe(
      "/projects/3/identify/research",
    )
    expect(journeyStepHref(step("identify-problems"), 3, target({ tool: "hub" }))).toBe("/projects/3/identify")
  })

  it("falls back to the project page when there is no solution to validate", () => {
    expect(journeyStepHref(step("validate-solutions"), 3, target({ tool: "hub" }))).toBe("/projects/3")
  })
})

describe("computeJourneySteps", () => {
  describe("without a problem in view", () => {
    it("completes the steps before the active one and greys the rest", () => {
      expect(computeJourneySteps("identify-problems").map((s) => s.status)).toEqual([
        "active",
        "upcoming",
        "upcoming",
        "upcoming",
        "upcoming",
      ])
      expect(computeJourneySteps("explore-problems").map((s) => s.status)).toEqual([
        "completed",
        "active",
        "upcoming",
        "upcoming",
        "upcoming",
      ])
    })

    it("keeps every step upcoming when no step is active", () => {
      expect(computeJourneySteps(null).every((s) => s.status === "upcoming")).toBe(true)
    })
  })

  describe("with a problem's progress", () => {
    it("always highlights the active step", () => {
      const steps = computeJourneySteps("validate-problems", ["identify-problems"])
      expect(steps.find((s) => s.id === "validate-problems")?.status).toBe("active")
    })

    it("greys the later steps the problem has not reached", () => {
      expect(
        computeJourneySteps("validate-problems", ["identify-problems", "explore-problems"]).map((s) => s.status),
      ).toEqual(["completed", "completed", "active", "upcoming", "upcoming"])
    })

    it("lights every step once the problem has a validated solution", () => {
      expect(
        computeJourneySteps("identify-solutions", [
          "identify-problems",
          "explore-problems",
          "validate-problems",
          "identify-solutions",
          "validate-solutions",
        ]).map((s) => s.status),
      ).toEqual(["completed", "completed", "completed", "active", "completed"])
    })

    it("greys an earlier step the problem skipped", () => {
      expect(
        computeJourneySteps("validate-problems", ["identify-problems", "validate-problems"]).map((s) => s.status),
      ).toEqual(["completed", "upcoming", "active", "upcoming", "upcoming"])
    })
  })
})

describe("completedJourneySteps", () => {
  it("only counts identification for a fresh problem", () => {
    expect(completedJourneySteps(problem())).toEqual(["identify-problems"])
  })

  it("adds explore once the deep dive has produced something", () => {
    expect(completedJourneySteps(problem({ jobCount: 1 }))).toEqual(["identify-problems", "explore-problems"])
    expect(completedJourneySteps(problem({ existingSolutionCount: 1 }))).toEqual([
      "identify-problems",
      "explore-problems",
    ])
  })

  it("adds validation only once there is a verdict", () => {
    expect(completedJourneySteps(problem({ validationStatus: "in_progress" }))).toEqual(["identify-problems"])
    expect(completedJourneySteps(problem({ jobCount: 1, validationStatus: "invalid" }))).toEqual([
      "identify-problems",
      "explore-problems",
      "validate-problems",
    ])
  })

  it("adds the solution steps from the linked solutions", () => {
    const validated = problem({ jobCount: 1, validationStatus: "valid", solutionCount: 2 })
    expect(completedJourneySteps(validated)).toEqual([
      "identify-problems",
      "explore-problems",
      "validate-problems",
      "identify-solutions",
    ])
    expect(completedJourneySteps({ ...validated, validatedSolutionCount: 1 })).toEqual([
      "identify-problems",
      "explore-problems",
      "validate-problems",
      "identify-solutions",
      "validate-solutions",
    ])
  })
})

describe("summariseProblemJourney", () => {
  const storeProblem = {
    id: 7,
    validationStatus: "valid",
    existingSolutions: [{ id: "e1" }],
    jobsToBeDone: {
      functional: [{ id: "j1" }],
      emotional: [{ id: "j2" }, { id: "j3" }],
      social: [],
    },
  } as unknown as Problem

  const solution = (id: number, problemId: number, validationStatus: Solution["validationStatus"]) =>
    ({ id, problemId, validationStatus }) as Solution

  it("counts jobs, existing solutions and only the solutions linked to the problem", () => {
    const solutions = [
      solution(1, 7, "unvalidated"),
      solution(2, 7, "valid"),
      solution(3, 8, "valid"),
    ]
    expect(summariseProblemJourney(storeProblem, solutions)).toEqual({
      validationStatus: "valid",
      jobCount: 3,
      existingSolutionCount: 1,
      solutionCount: 2,
      validatedSolutionCount: 1,
    })
  })
})

describe("problemJourneyStep", () => {
  it("starts at explore for a fresh problem", () => {
    expect(problemJourneyStep(problem())).toBe("explore-problems")
  })

  it("moves to validate once the problem is explored", () => {
    expect(problemJourneyStep(problem({ jobCount: 1 }))).toBe("validate-problems")
    expect(problemJourneyStep(problem({ existingSolutionCount: 1 }))).toBe("validate-problems")
  })

  it("moves to identify solutions once there is a verdict", () => {
    expect(problemJourneyStep(problem({ validationStatus: "valid" }))).toBe("identify-solutions")
    expect(problemJourneyStep(problem({ validationStatus: "in_progress", jobCount: 2 }))).toBe("validate-problems")
  })

  it("moves to validate solutions once the problem has any, so no completed step sits after the active one", () => {
    expect(problemJourneyStep(problem({ validationStatus: "valid", solutionCount: 1 }))).toBe("validate-solutions")
    expect(
      problemJourneyStep(problem({ validationStatus: "valid", solutionCount: 2, validatedSolutionCount: 2 })),
    ).toBe("validate-solutions")
  })
})
