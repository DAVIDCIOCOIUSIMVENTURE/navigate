import { DEFAULT_VALIDATION_ASSESSMENT, type DecisionLevel, type ValidationAssessment } from "@/types/validation"
import { describeCompetitionSignals, describeMarketEstimates } from "./market-summary"

const assessment = (patch: Partial<ValidationAssessment>): ValidationAssessment => ({
  ...DEFAULT_VALIDATION_ASSESSMENT,
  ...patch,
})

describe("describeMarketEstimates", () => {
  it("is null until the people count and the price are captured", () => {
    expect(describeMarketEstimates(DEFAULT_VALIDATION_ASSESSMENT)).toBeNull()
    expect(
      describeMarketEstimates(assessment({ howManyPeople: { value: 500, unit: "", level: "" } })),
    ).toBeNull()
  })

  it("reads the people, cadence, price and the two shares as prose", () => {
    const text = describeMarketEstimates(
      assessment({
        howManyPeople: { value: 210000, unit: "People", level: "" },
        howOften: { value: 20, unit: "per year", level: "" },
        worthToThem: { value: 6, unit: "GBP", level: "" },
        reachableShare: 8,
        obtainableShare: 10,
      }),
    )
    expect(text).toBe(
      "About 210,000 people hit this 20 times per year and would pay £6 each time. The team expects to reach 8% of them and win 10% of those.",
    )
  })

  it("says once and twice rather than 1 times and 2 times", () => {
    const base: Partial<ValidationAssessment> = {
      howManyPeople: { value: 1000, unit: "", level: "" },
      worthToThem: { value: 25, unit: "GBP", level: "" },
    }
    expect(
      describeMarketEstimates(assessment({ ...base, howOften: { value: 1, unit: "per year", level: "" } })),
    ).toContain("hit this once per year")
    expect(
      describeMarketEstimates(assessment({ ...base, howOften: { value: 2, unit: "per month", level: "" } })),
    ).toContain("hit this twice per month")
  })

  it("leaves the cadence out when no frequency is captured", () => {
    const text = describeMarketEstimates(
      assessment({
        howManyPeople: { value: 1000, unit: "", level: "" },
        worthToThem: { value: 25, unit: "GBP", level: "" },
      }),
    )
    expect(text).toContain("hit this and would pay")
  })
})

describe("describeCompetitionSignals", () => {
  it("joins the three signals into one sentence", () => {
    expect(
      describeCompetitionSignals(
        assessment({
          competitorSize: { value: null, unit: "", level: "small" },
          costOfSwitching: { value: null, unit: "", level: "low" },
          solutionEffectiveness: { value: null, unit: "", level: "poor" },
        }),
      ),
    ).toBe("Competitors are small, the cost of switching is low and today's solutions are poor.")
  })

  it("words the medium size, a switching cost of none and stored capitals", () => {
    expect(
      describeCompetitionSignals(
        assessment({
          // Older saved problems carry the level capitalised.
          competitorSize: { value: null, unit: "", level: "Medium" as unknown as DecisionLevel },
          costOfSwitching: { value: null, unit: "", level: "none" },
          solutionEffectiveness: { value: null, unit: "", level: "" },
        }),
      ),
    ).toBe("Competitors are medium-sized and there is no cost of switching.")
  })

  it("is null when no signal is set", () => {
    expect(
      describeCompetitionSignals(
        assessment({
          competitorSize: { value: null, unit: "", level: "" },
          costOfSwitching: { value: null, unit: "", level: "" },
          solutionEffectiveness: { value: null, unit: "", level: "" },
        }),
      ),
    ).toBeNull()
  })
})
