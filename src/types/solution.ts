import type { ValidationStatus } from "@/types/validation"

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

/** The four 1-5 scores captured by solution validation and compared on the Compare solutions page. */
export type SolutionMetricKey = "feasibility" | "impact" | "cost" | "timeToImplement"

/** The user's overall verdict on a solution after comparing it with the others. */
export type TrafficLight = "green" | "amber" | "red"

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
  reverseIdeation: ImprovementItem[]
  reverseInversion: ImprovementItem[]
  analogyDomain: string
  analogyInsight: string
  improvementResponses: ImprovementResponses
  // Per-prompt ideas captured before promoting to a Solution.
  // Keys are the SCAMPER dimension keys (substitute, combine, ...).
  scamperIdeas: Record<string, ImprovementItem[]>
}

/**
 * A single proposed solution. Rows on the Solutions page are instances of this type.
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
  validationStatus: ValidationStatus
  // Traffic light given on the Compare solutions page; null until scored there.
  trafficLight: TrafficLight | null
  // Method-specific snapshots captured at save time, so each solution can be
  // re-edited later in a dialog tailored to its inspiration source.
  analogyDomain?: string
  analogyInsight?: string
  scamperIdeas?: Record<string, string>
  improveIdeas?: Record<string, string>
  reverseWorseIdeas?: string[]
  reverseInversions?: string[]
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
  reverseIdeation: [],
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
  feasibility: 3,
  impact: 3,
  cost: 3,
  timeToImplement: 3,
  validationStatus: "unvalidated",
  trafficLight: null,
  analogyDomain: undefined,
  analogyInsight: undefined,
  scamperIdeas: undefined,
  improveIdeas: undefined,
  reverseWorseIdeas: undefined,
  reverseInversions: undefined,
}
