import {
  DEFAULT_METRIC_WEIGHTS,
  formatWeightedScore,
  normaliseMetricScore,
  normaliseWeights,
  rankSolutions,
  trafficLightRank,
  weightedScore,
  type MetricWeights,
} from "./solution-comparison"

const metrics = (
  feasibility: number | null,
  impact: number | null,
  cost: number | null,
  timeToImplement: number | null,
  id = 1,
) => ({ id, feasibility, impact, cost, timeToImplement })

describe("normaliseMetricScore", () => {
  it("keeps feasibility and impact as they are", () => {
    expect(normaliseMetricScore("feasibility", 4)).toBe(4)
    expect(normaliseMetricScore("impact", 1)).toBe(1)
  })

  it("inverts cost and time so 5 is always best", () => {
    expect(normaliseMetricScore("cost", 1)).toBe(5)
    expect(normaliseMetricScore("cost", 5)).toBe(1)
    expect(normaliseMetricScore("timeToImplement", 2)).toBe(4)
  })

  it("returns null for an unscored metric and clamps out-of-range values", () => {
    expect(normaliseMetricScore("impact", null)).toBeNull()
    expect(normaliseMetricScore("impact", 9)).toBe(5)
    expect(normaliseMetricScore("cost", 0)).toBe(5)
  })
})

describe("weightedScore", () => {
  it("averages the normalised scores with equal weights", () => {
    // feasibility 4, impact 2, cost 1 (-> 5), time 5 (-> 1): mean 3
    expect(weightedScore(metrics(4, 2, 1, 5), DEFAULT_METRIC_WEIGHTS)).toBe(3)
  })

  it("weights metrics the user marks as essential more heavily", () => {
    const weights: MetricWeights = { feasibility: 3, impact: 1, cost: 0, timeToImplement: 0 }
    // (5 * 3 + 1 * 1) / 4 = 4
    expect(weightedScore(metrics(5, 1, 3, 3), weights)).toBe(4)
  })

  it("ignores metrics weighted 0 and metrics without a score", () => {
    const weights: MetricWeights = { feasibility: 2, impact: 2, cost: 0, timeToImplement: 2 }
    // cost is ignored, time is unscored, so only feasibility and impact count
    expect(weightedScore(metrics(2, 4, 1, null), weights)).toBe(3)
  })

  it("returns null when nothing counts", () => {
    const none: MetricWeights = { feasibility: 0, impact: 0, cost: 0, timeToImplement: 0 }
    expect(weightedScore(metrics(5, 5, 1, 1), none)).toBeNull()
    expect(weightedScore(metrics(null, null, null, null), DEFAULT_METRIC_WEIGHTS)).toBeNull()
  })
})

describe("rankSolutions", () => {
  it("orders highest weighted score first and numbers the ranks", () => {
    const ranked = rankSolutions(
      [metrics(2, 2, 4, 4, 1), metrics(5, 5, 1, 1, 2), metrics(3, 3, 3, 3, 3)],
      DEFAULT_METRIC_WEIGHTS,
    )
    expect(ranked.map((r) => r.solution.id)).toEqual([2, 3, 1])
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3])
  })

  it("puts unscored solutions last and breaks ties by id", () => {
    const ranked = rankSolutions(
      [metrics(null, null, null, null, 9), metrics(3, 3, 3, 3, 4), metrics(3, 3, 3, 3, 2)],
      DEFAULT_METRIC_WEIGHTS,
    )
    expect(ranked.map((r) => r.solution.id)).toEqual([2, 4, 9])
    expect(ranked[2].score).toBeNull()
  })

  it("re-orders when the weights change", () => {
    const cheap = metrics(2, 2, 1, 3, 1)
    const impactful = metrics(2, 5, 5, 3, 2)
    const costFirst: MetricWeights = { feasibility: 0, impact: 0, cost: 3, timeToImplement: 0 }
    const impactFirst: MetricWeights = { feasibility: 0, impact: 3, cost: 0, timeToImplement: 0 }
    expect(rankSolutions([cheap, impactful], costFirst)[0].solution.id).toBe(1)
    expect(rankSolutions([cheap, impactful], impactFirst)[0].solution.id).toBe(2)
  })
})

describe("normaliseWeights", () => {
  it("fills in defaults for missing or invalid entries", () => {
    expect(normaliseWeights(undefined)).toEqual(DEFAULT_METRIC_WEIGHTS)
    expect(normaliseWeights({ feasibility: 3, impact: 7, cost: "high" })).toEqual({
      ...DEFAULT_METRIC_WEIGHTS,
      feasibility: 3,
    })
  })
})

describe("traffic lights", () => {
  it("ranks green before amber before red before unscored", () => {
    expect(trafficLightRank("green")).toBeLessThan(trafficLightRank("amber"))
    expect(trafficLightRank("amber")).toBeLessThan(trafficLightRank("red"))
    expect(trafficLightRank("red")).toBeLessThan(trafficLightRank(null))
  })

  it("formats the weighted score to one decimal place", () => {
    expect(formatWeightedScore(3.6666)).toBe("3.7 / 5")
    expect(formatWeightedScore(null)).toBe("Not scored")
  })
})
