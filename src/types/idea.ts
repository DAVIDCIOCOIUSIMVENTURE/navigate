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

export type AlternativeItem = { id: number; text: string; shortcomings: string[] }

export type ValidationStatus = "unvalidated" | "in_progress" | "valid" | "invalid"

export type Problem = {
  id: number
  text: string
  // Validation fields — populated when the user validates this problem
  validationStatus: ValidationStatus
  alternatives: AlternativeItem[]
  contextWhen: string
  emotionalImpact: string
  impacts: ImpactItem[]
  reason: string
}

export const DEFAULT_PROBLEM: Omit<Problem, "id"> = {
  text: "",
  validationStatus: "unvalidated",
  alternatives: [],
  contextWhen: "",
  emotionalImpact: "",
  impacts: [],
  reason: "",
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
