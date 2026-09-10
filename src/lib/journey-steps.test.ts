import { computeJourneySteps, JOURNEY_STEPS, problemJourneyStep, type ProblemJourneySummary } from "./journey-steps"

const problem = (over: Partial<ProblemJourneySummary> = {}): ProblemJourneySummary => ({
  validationStatus: "unvalidated",
  jobCount: 0,
  existingSolutionCount: 0,
  ...over,
})

describe("JOURNEY_STEPS", () => {
  it("lists the six milestones in order", () => {
    expect(JOURNEY_STEPS.map((s) => s.id)).toEqual([
      "self-discovery",
      "identify-problems",
      "explore-problems",
      "validate-problems",
      "identify-solutions",
      "validate-solutions",
    ])
  })
})

describe("computeJourneySteps", () => {
  it("completes the steps before the active one and greys the rest", () => {
    expect(computeJourneySteps("identify-problems").map((s) => s.status)).toEqual([
      "completed",
      "active",
      "upcoming",
      "upcoming",
      "upcoming",
      "upcoming",
    ])
  })

  it("moves the boundary along with the active step", () => {
    expect(computeJourneySteps("explore-problems").map((s) => s.status)).toEqual([
      "completed",
      "completed",
      "active",
      "upcoming",
      "upcoming",
      "upcoming",
    ])
    expect(computeJourneySteps("validate-solutions").map((s) => s.status)).toEqual([
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
      "active",
    ])
  })

  it("keeps every step upcoming when no step is active", () => {
    expect(computeJourneySteps(null).every((s) => s.status === "upcoming")).toBe(true)
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
