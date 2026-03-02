"use client"

import { useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Idea } from "@/types/idea"
import { DEFAULT_CUSTOMER, DEFAULT_SUB_SEGMENT } from "@/types/idea"

export function useIdeas() {
  const dispatch = useDispatch<AppDispatch>()
  const ideas = useSelector((state: RootState) => state.ideas.ideas)
  const nextId = useSelector((state: RootState) => state.ideas.nextId)

  const createIdea = useCallback(
    (mode: "guided" | "quickstart"): Idea => {
      const now = new Date().toISOString()
      const newIdea: Idea = {
        id: nextId,
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
      dispatch.ideas.addIdea(newIdea)
      return newIdea
    },
    [dispatch, nextId, ideas.length]
  )

  const updateIdea = useCallback(
    (id: number, patch: Partial<Idea>) => {
      dispatch.ideas.updateIdea({ id, patch })
    },
    [dispatch]
  )

  const getIdea = useCallback(
    (id: number): Idea | undefined => ideas.find((idea) => idea.id === id),
    [ideas]
  )

  return { ideas, createIdea, updateIdea, getIdea }
}
