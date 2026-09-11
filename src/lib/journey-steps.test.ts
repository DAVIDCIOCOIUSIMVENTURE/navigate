import {
  completedJourneySteps,
  computeJourneySteps,
  JOURNEY_STEPS,
  problemJourneyStep,
  summariseProblemJourney,
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
})
