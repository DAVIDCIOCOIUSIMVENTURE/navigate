import type { LucideIcon } from "lucide-react"
import { Coins, Frown, Hourglass, Meh, Smile, TrendingUp, Wrench } from "lucide-react"
import type { Solution, SolutionMetricKey, TrafficLight } from "@/types/solution"

/**
 * Pure rules for the Compare solutions page: which metrics take part, how
 * important the user says each one is, how a solution's 1-5 scores fold into
 * one weighted score, and the traffic light the user then gives it.
 *
 * Cost and time to implement are scored the "wrong way round" on the
 * validation steps (1 is cheap / fast, 5 is expensive / slow), so they are
 * inverted before weighting so that a higher weighted score is always better.
 */

export type SolutionMetric = {
  key: SolutionMetricKey
  label: string
  icon: LucideIcon
  /** Shown beside the raw score so the direction of the scale is clear. */
  scaleNote: string
  /** False when 1 is the best raw score (cost, time to implement). */
  higherIsBetter: boolean
}

export const SOLUTION_METRICS: readonly SolutionMetric[] = [
  { key: "feasibility", label: "Feasibility", icon: Wrench, scaleNote: "1 hard, 5 easy", higherIsBetter: true },
  { key: "impact", label: "Impact", icon: TrendingUp, scaleNote: "1 low, 5 high", higherIsBetter: true },
  { key: "cost", label: "Cost", icon: Coins, scaleNote: "1 cheap, 5 expensive", higherIsBetter: false },
  { key: "timeToImplement", label: "Time to implement", icon: Hourglass, scaleNote: "1 fast, 5 slow", higherIsBetter: false },
] as const

/** How much a metric counts. 0 leaves it out of the weighted score entirely. */
export type MetricImportance = 0 | 1 | 2 | 3

export type MetricWeights = Record<SolutionMetricKey, MetricImportance>

export const IMPORTANCE_LEVELS: readonly { value: MetricImportance; label: string; description: string }[] = [
  { value: 0, label: "Ignore", description: "Leave this metric out of the ranking." },
  { value: 1, label: "Nice to have", description: "Counts, but only as a tie-breaker." },
  { value: 2, label: "Important", description: "A normal part of the decision." },
  { value: 3, label: "Essential", description: "Counts three times as much as a nice-to-have." },
] as const

export const DEFAULT_METRIC_WEIGHTS: MetricWeights = {
  feasibility: 2,
  impact: 2,
  cost: 2,
  timeToImplement: 2,
}

export function isMetricImportance(value: unknown): value is MetricImportance {
  return value === 0 || value === 1 || value === 2 || value === 3
}

/** Fills gaps and drops unknown values so a stored weights object is always complete. */
export function normaliseWeights(input: unknown): MetricWeights {
  const source = (input && typeof input === "object" ? input : {}) as Partial<Record<SolutionMetricKey, unknown>>
  const next = { ...DEFAULT_METRIC_WEIGHTS }
  for (const metric of SOLUTION_METRICS) {
    const value = source[metric.key]
    if (isMetricImportance(value)) next[metric.key] = value
  }
  return next
}

/**
 * The raw 1-5 score turned so that 5 is always the best outcome, or null when
 * the solution has not been scored on that metric.
 */
export function normaliseMetricScore(key: SolutionMetricKey, value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null
  const metric = SOLUTION_METRICS.find((m) => m.key === key)
  if (!metric) return null
  const clamped = Math.min(5, Math.max(1, value))
  return metric.higherIsBetter ? clamped : 6 - clamped
}

/**
 * Weighted average of the normalised metric scores, on the same 1-5 scale.
 * Metrics weighted 0 or left unscored do not take part. Returns null when no
 * metric counts, so the solution sorts to the bottom rather than as a 0.
 */
export function weightedScore(solution: Pick<Solution, SolutionMetricKey>, weights: MetricWeights): number | null {
  let total = 0
  let weightSum = 0
  for (const metric of SOLUTION_METRICS) {
    const weight = weights[metric.key]
    if (weight <= 0) continue
    const score = normaliseMetricScore(metric.key, solution[metric.key])
    if (score == null) continue
    total += score * weight
    weightSum += weight
  }
  if (weightSum === 0) return null
  return total / weightSum
}

export type RankedSolution<T extends Pick<Solution, SolutionMetricKey | "id">> = {
  solution: T
  score: number | null
  rank: number
}

/**
 * Orders solutions by weighted score, highest first. Unscored solutions go
 * last; ties keep the lower id first so the order is stable as weights move.
 */
export function rankSolutions<T extends Pick<Solution, SolutionMetricKey | "id">>(
  solutions: readonly T[],
  weights: MetricWeights,
): RankedSolution<T>[] {
  const scored = solutions.map((solution) => ({ solution, score: weightedScore(solution, weights) }))
  scored.sort((a, b) => {
    if (a.score == null && b.score == null) return a.solution.id - b.solution.id
    if (a.score == null) return 1
    if (b.score == null) return -1
    if (b.score !== a.score) return b.score - a.score
    return a.solution.id - b.solution.id
  })
  return scored.map((entry, index) => ({ ...entry, rank: index + 1 }))
}

export function formatWeightedScore(score: number | null): string {
  return score == null ? "Not scored" : `${score.toFixed(1)} / 5`
}

export type TrafficLightMeta = {
  label: string
  description: string
  /** The face drawn inside the light: smile, neutral or frown. */
  icon: LucideIcon
  /** Solid disc colour for the traffic light itself. */
  dotClass: string
  /** Text colour for the label beside the disc in tables. */
  textClass: string
  /** Filled pill treatment for the canvas header. */
  pillClass: string
}

/** Best first: the order for grouping and sorting. */
export const TRAFFIC_LIGHTS: readonly TrafficLight[] = ["green", "amber", "red"] as const

/** Worst first: the order the picker shows its buttons in, like a real traffic light read top down. */
export const TRAFFIC_LIGHT_PICKER_ORDER: readonly TrafficLight[] = ["red", "amber", "green"] as const

export const TRAFFIC_LIGHT_META: Record<TrafficLight, TrafficLightMeta> = {
  green: {
    label: "Green",
    description: "Pursue this solution.",
    icon: Smile,
    dotClass: "bg-success",
    textClass: "text-success",
    pillClass: "bg-success text-white border-success",
  },
  amber: {
    label: "Amber",
    description: "Worth considering, with reservations.",
    icon: Meh,
    dotClass: "bg-yellow-600",
    textClass: "text-yellow-600",
    pillClass: "bg-yellow-600 text-white border-yellow-600",
  },
  red: {
    label: "Red",
    description: "Park this solution for now.",
    icon: Frown,
    dotClass: "bg-destructive",
    textClass: "text-destructive",
    pillClass: "bg-destructive text-white border-destructive",
  },
}

/** Sort rank for a traffic light column: green first, unscored last. */
export const TRAFFIC_LIGHT_ORDER: Record<TrafficLight, number> = {
  green: 0,
  amber: 1,
  red: 2,
}

export function trafficLightRank(light: TrafficLight | null | undefined): number {
  return light ? TRAFFIC_LIGHT_ORDER[light] : TRAFFIC_LIGHTS.length
}

export function isTrafficLight(value: unknown): value is TrafficLight {
  return value === "green" || value === "amber" || value === "red"
}
