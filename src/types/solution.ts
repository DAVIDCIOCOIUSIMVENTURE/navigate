export type RootCause = {
  id: number
  description: string
}

export type FiveWhyChain = {
  id: number
  whys: string[] // 5 entries
}

export type AffectedGroup = {
  id: number
  name: string
  severity: "" | "low" | "medium" | "high" | "critical"
  description: string
}

export type ImprovementItem = {
  id: number
  text: string
}

export type SolutionCandidate = {
  id: number
  title: string
  description: string
  inspirationSource: "" | "scamper" | "reverse" | "analogy" | "improve" | "freeform"
  inspirationDetail: string
  feasibility: number | null // 1-5
  impact: number | null // 1-5
  cost: number | null // 1-5 (1=cheap, 5=expensive)
  timeToImplement: number | null // 1-5 (1=fast, 5=slow)
  notes: string
}

export type ScamperResponses = {
  substitute: ImprovementItem[]
  combine: ImprovementItem[]
  adapt: ImprovementItem[]
  modify: ImprovementItem[]
  putToOtherUse: ImprovementItem[]
  eliminate: ImprovementItem[]
  reverse: ImprovementItem[]
}

export type ImprovementResponses = {
  coreFunctionality: ImprovementItem[]
  easeOfUse: ImprovementItem[]
  speedConvenience: ImprovementItem[]
  priceValue: ImprovementItem[]
  qualityPerception: ImprovementItem[]
  customisation: ImprovementItem[]
  customerSupport: ImprovementItem[]
  trustTransparency: ImprovementItem[]
  deliveryFulfilment: ImprovementItem[]
  availabilityAccess: ImprovementItem[]
  emotionalExperience: ImprovementItem[]
  socialEthicalValue: ImprovementItem[]
  communication: ImprovementItem[]
  riskReduction: ImprovementItem[]
  postPurchase: ImprovementItem[]
}

export type AnalysisToolType = "" | "root-causes" | "five-whys" | "affected-groups"
export type DiscoveryToolType = "" | "scamper" | "reverse" | "analogy" | "improve"
export type SolutionStatus = "not_started" | "in_progress" | "complete"
export type SolutionVerdict = "none" | "pursue" | "revisit" | "abandon"

export type Solution = {
  id: number
  problemId: number
  createdAt: string
  editedAt: string
  status: SolutionStatus
  analysisToolType: AnalysisToolType
  discoveryToolType: DiscoveryToolType
  // Step 1: Root Cause Analysis
  rootCauses: RootCause[]
  fiveWhyChains: FiveWhyChain[]
  affectedGroups: AffectedGroup[]
  rootCauseNotes: string
  // Step 2: Solution Discovery
  scamperResponses: ScamperResponses
  reverseBrainstorm: ImprovementItem[]
  reverseInversion: ImprovementItem[]
  analogyDomain: string
  analogyInsight: string
  improvementResponses: ImprovementResponses
  candidates: SolutionCandidate[]
  // Step 3: Solution Analysis
  selectedCandidateId: number | null
  analysisNotes: string
  verdict: SolutionVerdict
}

export const DEFAULT_IMPROVEMENT: ImprovementResponses = {
  coreFunctionality: [],
  easeOfUse: [],
  speedConvenience: [],
  priceValue: [],
  qualityPerception: [],
  customisation: [],
  customerSupport: [],
  trustTransparency: [],
  deliveryFulfilment: [],
  availabilityAccess: [],
  emotionalExperience: [],
  socialEthicalValue: [],
  communication: [],
  riskReduction: [],
  postPurchase: [],
}

export const DEFAULT_SCAMPER: ScamperResponses = {
  substitute: [],
  combine: [],
  adapt: [],
  modify: [],
  putToOtherUse: [],
  eliminate: [],
  reverse: [],
}

export const DEFAULT_SOLUTION_FIELDS: Omit<Solution, "id" | "problemId" | "createdAt" | "editedAt"> = {
  status: "not_started",
  analysisToolType: "",
  discoveryToolType: "",
  rootCauses: [],
  fiveWhyChains: [],
  affectedGroups: [],
  rootCauseNotes: "",
  scamperResponses: DEFAULT_SCAMPER,
  reverseBrainstorm: [],
  reverseInversion: [],
  analogyDomain: "",
  analogyInsight: "",
  improvementResponses: DEFAULT_IMPROVEMENT,
  candidates: [],
  selectedCandidateId: null,
  analysisNotes: "",
  verdict: "none",
}
