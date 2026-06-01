export type ShortcomingItem = { id: number; text: string }

export type ExistingSolutionItem = { id: number; text: string; shortcomings: ShortcomingItem[] }

export type ValidationStatus = "unvalidated" | "in_progress" | "valid" | "invalid" | "unsure"
export type DecisionLevel = "" | "none" | "low" | "medium" | "high" | "prohibitive" | "small" | "large" | "terrible" | "poor" | "average" | "good" | "excellent" | "micro" | "giant" | "mild" | "moderate" | "strong" | "severe" | "unbearable"

export type ValidationMetric = {
  value: number | null
  unit: string
  level: DecisionLevel
}

export type JobIntensity = "" | "mild" | "strong" | "unbearable"

export type JobKind = "functional" | "emotional" | "social"

export type Job = {
  id: number
  text: string
  intensity: JobIntensity
}

export type JobsToBeDone = {
  functional: Job[]
  emotional: Job[]
  social: Job[]
}

/**
 * The single job the user picked to anchor the price on. A customer hires a
 * solution for one primary job, so the price is anchored on one job, not summed
 * across all of them. `kind` + `id` together identify it because job ids are
 * only unique within their own list.
 */
export type JobAnchor = { kind: JobKind; id: number }

export type ValidationAssessment = {
  jobsToBeDone: JobsToBeDone
  anchorJob: JobAnchor | null
  howManyPeople: ValidationMetric
  howOften: ValidationMetric
  worthToThem: ValidationMetric
  reachableShare: number
  obtainableShare: number
  costOfSwitching: ValidationMetric
  solutionEffectiveness: ValidationMetric
  competitorSize: ValidationMetric
}

export const DEFAULT_VALIDATION_METRIC: ValidationMetric = { value: null, unit: "", level: "" }

export const DEFAULT_REACHABLE_SHARE = 30
export const DEFAULT_OBTAINABLE_SHARE = 10

export const DEFAULT_JOBS_TO_BE_DONE: JobsToBeDone = {
  functional: [],
  emotional: [],
  social: [],
}

export const DEFAULT_VALIDATION_ASSESSMENT: ValidationAssessment = {
  jobsToBeDone: DEFAULT_JOBS_TO_BE_DONE,
  anchorJob: null,
  howManyPeople: { value: 0, unit: "", level: "" },
  howOften: { value: 0, unit: "", level: "" },
  worthToThem: { value: 0, unit: "", level: "" },
  reachableShare: DEFAULT_REACHABLE_SHARE,
  obtainableShare: DEFAULT_OBTAINABLE_SHARE,
  costOfSwitching: { value: null, unit: "", level: "medium" },
  solutionEffectiveness: { value: null, unit: "", level: "average" },
  competitorSize: { value: null, unit: "", level: "medium" },
}
