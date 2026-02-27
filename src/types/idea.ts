export type CustomerFields = {
  segmentName: string
  occupation: string
  ageRange: string
  whoTheyAre: string
  whatTheyDo: string
  goalsAndMotivations: string
  frustrationsAndChallenges: string
}

export type Job = {
  id: number
  job: string
  functional: string
  emotional: string
  social: string
}

export type ProblemItem = {
  id: number
  jobId: number | null
  text: string
}

export type ImpactItem = { category: string; description: string }

export type ValidationStatus = "unvalidated" | "in_progress" | "valid" | "invalid"

export type ProblemValidation = {
  id: number
  problemId: number
  alternatives: string[]
  contextWhen: string
  shortcomings: string
  emotionalImpact: string
  impacts: ImpactItem[]
  status: ValidationStatus
  reason: string
}

export type Idea = {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  mode: "guided" | "quickstart"

  // Problem Discovery
  customer: CustomerFields
  jobs: Job[]
  problems: ProblemItem[]

  // Problem Validation (one per problem)
  validations: ProblemValidation[]
  selectedProblemId: number | null

  // Stage flags
  problemDiscoveryComplete: boolean
  problemValidationComplete: boolean
}

export const DEFAULT_CUSTOMER: CustomerFields = {
  segmentName: "",
  occupation: "",
  ageRange: "",
  whoTheyAre: "",
  whatTheyDo: "",
  goalsAndMotivations: "",
  frustrationsAndChallenges: "",
}
