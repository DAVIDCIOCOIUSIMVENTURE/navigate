import type { ValidationStatus } from "@/types/idea"

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
export type InspirationSource = "" | "scamper" | "reverse" | "analogy" | "improve" | "freeform"

/**
 * Per-problem refinement and discovery scratchpad. One workspace per problem.
 * Holds the tool choices and intermediate data generated during the discovery wizard.
 */
export type SolutionWorkspace = {
  id: number
  problemId: number
  createdAt: string
  editedAt: string
  analysisToolType: AnalysisToolType
  discoveryToolType: DiscoveryToolType
  rootCauses: RootCause[]
  fiveWhyChains: FiveWhyChain[]
  affectedGroups: AffectedGroup[]
  rootCauseNotes: string
  reverseBrainstorm: ImprovementItem[]
  reverseInversion: ImprovementItem[]
  analogyDomain: string
  analogyInsight: string
  improvementResponses: ImprovementResponses
  // Per-prompt brainstorm ideas captured before promoting to a Solution.
  // Keys are the SCAMPER dimension keys (substitute, combine, ...).
  scamperIdeas: Record<string, ImprovementItem[]>
}

/**
 * A single proposed solution. Rows in the Solution Bank are instances of this type.
 * Each solution is tied to a problem and can be independently validated.
 */
export type Solution = {
  id: number
  problemId: number
  workspaceId: number | null
  createdAt: string
  editedAt: string
  title: string
  description: string
  inspirationSource: InspirationSource
  inspirationDetail: string
  feasibility: number | null // 1-5
  impact: number | null // 1-5
  cost: number | null // 1-5 (1=cheap, 5=expensive)
  timeToImplement: number | null // 1-5 (1=fast, 5=slow)
  validationNotes: string
  validationStatus: ValidationStatus
  validationReason: string
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

export const DEFAULT_WORKSPACE_FIELDS: Omit<SolutionWorkspace, "id" | "problemId" | "createdAt" | "editedAt"> = {
  analysisToolType: "",
  discoveryToolType: "",
  rootCauses: [],
  fiveWhyChains: [],
  affectedGroups: [],
  rootCauseNotes: "",
  reverseBrainstorm: [],
  reverseInversion: [],
  analogyDomain: "",
  analogyInsight: "",
  improvementResponses: DEFAULT_IMPROVEMENT,
  scamperIdeas: {},
}

export const DEFAULT_SOLUTION_FIELDS: Omit<Solution, "id" | "problemId" | "workspaceId" | "createdAt" | "editedAt"> = {
  title: "",
  description: "",
  inspirationSource: "",
  inspirationDetail: "",
  feasibility: null,
  impact: null,
  cost: null,
  timeToImplement: null,
  validationNotes: "",
  validationStatus: "unvalidated",
  validationReason: "",
}
