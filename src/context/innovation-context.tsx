"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

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

type InnovationContextValue = {
  // Problem Discovery data
  customer: CustomerFields
  setCustomer: (val: CustomerFields) => void
  jobs: Job[]
  setJobs: (val: Job[]) => void
  problems: ProblemItem[]
  setProblems: (val: ProblemItem[]) => void

  // Problem Validations
  validations: ProblemValidation[]
  setValidations: (val: ProblemValidation[]) => void
  upsertValidation: (v: ProblemValidation) => void
  getValidation: (problemId: number) => ProblemValidation | undefined
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

const InnovationContext = createContext<InnovationContextValue | null>(null)

export function InnovationProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerFields>(DEFAULT_CUSTOMER)
  const [jobs, setJobs] = useState<Job[]>([])
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [validations, setValidations] = useState<ProblemValidation[]>([])

  const upsertValidation = useCallback((v: ProblemValidation) => {
    setValidations((prev) => {
      const idx = prev.findIndex((x) => x.problemId === v.problemId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = v
        return next
      }
      return [...prev, v]
    })
  }, [])

  const getValidation = useCallback(
    (problemId: number) => validations.find((v) => v.problemId === problemId),
    [validations],
  )

  return (
    <InnovationContext.Provider
      value={{
        customer, setCustomer,
        jobs, setJobs,
        problems, setProblems,
        validations, setValidations,
        upsertValidation, getValidation,
      }}
    >
      {children}
    </InnovationContext.Provider>
  )
}

export function useInnovation() {
  const ctx = useContext(InnovationContext)
  if (!ctx) throw new Error("useInnovation must be used within InnovationProvider")
  return ctx
}
