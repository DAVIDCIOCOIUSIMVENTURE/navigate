export type ShortcomingItem = { id: number; text: string }

export type ExistingSolutionItem = { id: number; text: string; shortcomings: ShortcomingItem[] }

export type ValidationStatus = "unvalidated" | "in_progress" | "valid" | "invalid" | "unsure"
export type DecisionLevel = "" | "none" | "low" | "medium" | "high" | "prohibitive" | "small" | "large" | "terrible" | "poor" | "average" | "good" | "excellent" | "micro" | "giant"

export type ValidationMetric = {
  value: number | null
  unit: string
  level: DecisionLevel
}

export type ValidationAssessment = {
  howManyPeople: ValidationMetric
  howOften: ValidationMetric
  worthToThem: ValidationMetric
  costOfSwitching: ValidationMetric
  solutionEffectiveness: ValidationMetric
  competitorSize: ValidationMetric
}

export const DEFAULT_VALIDATION_METRIC: ValidationMetric = { value: null, unit: "", level: "" }

export const DEFAULT_VALIDATION_ASSESSMENT: ValidationAssessment = {
  howManyPeople: { value: 0, unit: "", level: "" },
  howOften: { value: 0, unit: "", level: "" },
  worthToThem: { value: 0, unit: "", level: "" },
  costOfSwitching: { value: null, unit: "", level: "medium" },
  solutionEffectiveness: { value: null, unit: "", level: "average" },
  competitorSize: { value: null, unit: "", level: "medium" },
}
