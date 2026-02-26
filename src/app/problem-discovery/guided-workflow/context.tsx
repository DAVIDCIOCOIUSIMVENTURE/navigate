"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

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

type WorkflowContextValue = {
  customer: CustomerFields
  setCustomer: (val: CustomerFields) => void
  jobs: Job[]
  setJobs: (val: Job[]) => void
  problems: ProblemItem[]
  setProblems: (val: ProblemItem[]) => void
  selectedProblemId: number | null
  setSelectedProblemId: (id: number | null) => void
  alternatives: string[]
  setAlternatives: (val: string[]) => void
  contextWhen: string
  setContextWhen: (val: string) => void
  shortcomings: string
  setShortcomings: (val: string) => void
  emotionalImpact: string
  setEmotionalImpact: (val: string) => void
  impacts: ImpactItem[]
  setImpacts: (val: ImpactItem[]) => void
}

const DEFAULT_CUSTOMER: CustomerFields = {
  segmentName: "",
  occupation: "",
  ageRange: "",
  whoTheyAre: "",
  whatTheyDo: "",
  goalsAndMotivations: "",
  frustrationsAndChallenges: "",
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerFields>(DEFAULT_CUSTOMER)
  const [jobs, setJobs] = useState<Job[]>([])
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null)
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [contextWhen, setContextWhen] = useState("")
  const [shortcomings, setShortcomings] = useState("")
  const [emotionalImpact, setEmotionalImpact] = useState("")
  const [impacts, setImpacts] = useState<ImpactItem[]>([])

  return (
    <WorkflowContext.Provider
      value={{
        customer, setCustomer,
        jobs, setJobs,
        problems, setProblems,
        selectedProblemId, setSelectedProblemId,
        alternatives, setAlternatives,
        contextWhen, setContextWhen,
        shortcomings, setShortcomings,
        emotionalImpact, setEmotionalImpact,
        impacts, setImpacts,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error("useWorkflow must be used within WorkflowProvider")
  return ctx
}

export const BASE = "/problem-discovery/guided-workflow"

export const NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "Customers", path: "customers" },
  { label: "Jobs to Be Done", path: "jobs-to-be-done" },
  { label: "Problems", path: "problems" },
  { label: "Pick a Problem", path: "pick-a-problem" },
  { label: "Alternatives", path: "alternatives" },
  { label: "Context", path: "context" },
  { label: "Alternatives Shortcomings", path: "shortcomings" },
  { label: "Emotional Impact", path: "emotional-impact" },
  { label: "Quantifiable Impact", path: "quantifiable-impact" },
  { label: "Summary", path: "summary" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string) {
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as (typeof STEP_PATHS)[number])
  return {
    prevPath: idx > 0 ? `${BASE}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${BASE}/${STEP_PATHS[idx + 1]}` : null,
  }
}
