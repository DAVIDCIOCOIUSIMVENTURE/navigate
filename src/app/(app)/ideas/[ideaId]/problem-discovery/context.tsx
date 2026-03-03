"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useIdeas } from "@/store/ideas-hooks"
import type { CustomerFields, SubSegmentFields, Job, Problem } from "@/types/idea"
import { DEFAULT_SUB_SEGMENT } from "@/types/idea"

export type { CustomerFields, SubSegmentFields, Job, Problem }
// Backwards-compatible alias for consumers that import ProblemItem from this context
export type ProblemItem = Problem

type ProblemDiscoveryContextValue = {
  ideaId: number
  customer: CustomerFields
  setCustomer: (val: CustomerFields) => void
  subSegment: SubSegmentFields
  setSubSegment: (val: SubSegmentFields) => void
  jobs: Job[]
  setJobs: (val: Job[]) => void
}

const ProblemDiscoveryContext = createContext<ProblemDiscoveryContextValue | null>(null)

export function ProblemDiscoveryProvider({
  ideaId,
  children,
}: {
  ideaId: number
  children: ReactNode
}) {
  const { getIdea, updateIdea } = useIdeas()
  const idea = getIdea(ideaId)

  const customer = idea?.customer ?? {
    segmentName: "", ageFrom: "", ageTo: "",
    whoTheyAre: "", whatTheyDo: "", goalsAndMotivations: "", frustrationsAndChallenges: "",
  }
  const subSegment = idea?.subSegment ?? { ...DEFAULT_SUB_SEGMENT }
  const jobs = idea?.jobs ?? []

  const setCustomer = useCallback(
    (val: CustomerFields) => updateIdea(ideaId, { customer: val }),
    [ideaId, updateIdea]
  )
  const setSubSegment = useCallback(
    (val: SubSegmentFields) => updateIdea(ideaId, { subSegment: val }),
    [ideaId, updateIdea]
  )
  const setJobs = useCallback(
    (val: Job[]) => updateIdea(ideaId, { jobs: val }),
    [ideaId, updateIdea]
  )

  return (
    <ProblemDiscoveryContext.Provider
      value={{ ideaId, customer, setCustomer, subSegment, setSubSegment, jobs, setJobs }}
    >
      {children}
    </ProblemDiscoveryContext.Provider>
  )
}

export function useProblemDiscovery() {
  const ctx = useContext(ProblemDiscoveryContext)
  if (!ctx) throw new Error("useProblemDiscovery must be used within ProblemDiscoveryProvider")
  return ctx
}

export const NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "Customers", path: "customers" },
  { label: "Customer Sub-Segment", path: "customer-sub-segment" },
  { label: "Jobs to Be Done", path: "jobs-to-be-done" },
  { label: "Problems", path: "problems" },
  { label: "Summary", path: "summary" },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, ideaId: number) {
  const base = `/ideas/${ideaId}/problem-discovery`
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment as (typeof STEP_PATHS)[number])
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
