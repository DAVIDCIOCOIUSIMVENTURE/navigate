export type PriorKnowledgeFields = {
  personalFrustrations: string
  whoStruggles: string
  existingWorkarounds: string
  complaintsHeard: string
  whyItMatters: string
}

export const DEFAULT_PRIOR_KNOWLEDGE: PriorKnowledgeFields = {
  personalFrustrations: "",
  whoStruggles: "",
  existingWorkarounds: "",
  complaintsHeard: "",
  whyItMatters: "",
}

export type CustomerFields = {
  segmentName: string
  ageFrom: string
  ageTo: string
  whoTheyAre: string
  whatTheyDo: string
  goalsAndMotivations: string
  frustrationsAndChallenges: string
}

export type ImpactItem = { category: string; description: string }

export type ExistingSolutionItem = { id: number; text: string; shortcomings: string[]; impacts: ImpactItem[] }

export type ValidationStatus = "unvalidated" | "in_progress" | "valid" | "invalid" | "unsure"
export type DecisionLevel = "" | "low" | "medium" | "high"

export type ValidationMetric = {
  value: number | null
  unit: string
  level: DecisionLevel
}

export type ValidationAssessment = {
  howManyPeople: ValidationMetric
  howOften: ValidationMetric
  worthToThem: ValidationMetric
}

export const DEFAULT_VALIDATION_METRIC: ValidationMetric = { value: null, unit: "", level: "" }

export const DEFAULT_VALIDATION_ASSESSMENT: ValidationAssessment = {
  howManyPeople: { value: null, unit: "", level: "" },
  howOften: { value: null, unit: "", level: "" },
  worthToThem: { value: null, unit: "", level: "" },
}

export type Problem = {
  id: number
  text: string
  // Validation fields — populated when the user validates this problem
  validationStatus: ValidationStatus
  existingSolutions: ExistingSolutionItem[]
  contextWhen: string
  emotionalImpact: string
  impacts: ImpactItem[]
  reason: string
  timeLevel: DecisionLevel
  costLevel: DecisionLevel
  returnLevel: DecisionLevel
  marketLevel: DecisionLevel
}

export const DEFAULT_PROBLEM: Omit<Problem, "id"> = {
  text: "",
  validationStatus: "unvalidated",
  existingSolutions: [],
  contextWhen: "",
  emotionalImpact: "",
  impacts: [],
  reason: "",
  timeLevel: "",
  costLevel: "",
  returnLevel: "",
  marketLevel: "",
}

export type Job = {
  id: number
  name: string
  functional: string
  emotional: string
  social: string
  problems: Problem[]
}

export type SubSegmentFields = {
  name: string
  differentiators: string
  specificContext: string
  uniqueNeeds: string
}

export const DEFAULT_SUB_SEGMENT: SubSegmentFields = {
  name: "",
  differentiators: "",
  specificContext: "",
  uniqueNeeds: "",
}

export type Idea = {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  mode: "guided" | "quickstart"

  // Problem Discovery
  priorKnowledge: PriorKnowledgeFields
  customer: CustomerFields
  subSegment: SubSegmentFields
  jobs: Job[]

  // Problem Validation
  selectedProblemId: number | null

  // Stage flags
  problemDiscoveryComplete: boolean
  problemValidationComplete: boolean
}

export const DEFAULT_CUSTOMER: CustomerFields = {
  segmentName: "",
  ageFrom: "",
  ageTo: "",
  whoTheyAre: "",
  whatTheyDo: "",
  goalsAndMotivations: "",
  frustrationsAndChallenges: "",
}
