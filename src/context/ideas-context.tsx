"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Idea } from "@/types/idea"
import { DEFAULT_CUSTOMER, DEFAULT_SUB_SEGMENT } from "@/types/idea"

type IdeasContextValue = {
  ideas: Idea[]
  createIdea: (mode: "guided" | "quickstart") => Idea
  updateIdea: (id: number, patch: Partial<Idea>) => void
  getIdea: (id: number) => Idea | undefined
}

const IdeasContext = createContext<IdeasContextValue | null>(null)

export function IdeasProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>([])

  const createIdea = useCallback((mode: "guided" | "quickstart"): Idea => {
    const now = new Date().toISOString()
    const newIdea: Idea = {
      id: Date.now(),
      title: `Idea ${ideas.length + 1}`,
      createdAt: now,
      updatedAt: now,
      mode,
      customer: { ...DEFAULT_CUSTOMER },
      subSegment: { ...DEFAULT_SUB_SEGMENT },
      jobs: [],
      problems: [],
      validations: [],
      selectedProblemId: null,
      problemDiscoveryComplete: false,
      problemValidationComplete: false,
    }
    setIdeas((prev) => [...prev, newIdea])
    return newIdea
  }, [ideas.length])

  const updateIdea = useCallback((id: number, patch: Partial<Idea>) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id
          ? { ...idea, ...patch, updatedAt: new Date().toISOString() }
          : idea
      )
    )
  }, [])

  const getIdea = useCallback(
    (id: number) => ideas.find((idea) => idea.id === id),
    [ideas]
  )

  return (
    <IdeasContext.Provider value={{ ideas, createIdea, updateIdea, getIdea }}>
      {children}
    </IdeasContext.Provider>
  )
}

export function useIdeas() {
  const ctx = useContext(IdeasContext)
  if (!ctx) throw new Error("useIdeas must be used within IdeasProvider")
  return ctx
}
