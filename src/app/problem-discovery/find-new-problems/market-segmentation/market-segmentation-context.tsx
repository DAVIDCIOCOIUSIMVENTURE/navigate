"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface Job {
  id: number
  job: string
  functional: string
  emotional: string
  social: string
}

export interface Solution {
  id: number
  jobId: number
  text: string
}

interface MarketSegmentationContextValue {
  jobs: Job[]
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>
  nextJobId: number
  setNextJobId: React.Dispatch<React.SetStateAction<number>>
  solutions: Solution[]
  setSolutions: React.Dispatch<React.SetStateAction<Solution[]>>
  nextSolutionId: number
  setNextSolutionId: React.Dispatch<React.SetStateAction<number>>
}

const MarketSegmentationContext = createContext<MarketSegmentationContextValue | null>(null)

export function MarketSegmentationProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([{ id: 1, job: "", functional: "", emotional: "", social: "" }])
  const [nextJobId, setNextJobId] = useState(2)
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [nextSolutionId, setNextSolutionId] = useState(1)

  return (
    <MarketSegmentationContext.Provider value={{ jobs, setJobs, nextJobId, setNextJobId, solutions, setSolutions, nextSolutionId, setNextSolutionId }}>
      {children}
    </MarketSegmentationContext.Provider>
  )
}

export function useMarketSegmentation() {
  const ctx = useContext(MarketSegmentationContext)
  if (!ctx) throw new Error("useMarketSegmentation must be used within MarketSegmentationProvider")
  return ctx
}
