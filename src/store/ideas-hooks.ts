"use client"

import { useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Idea } from "@/types/idea"

export function useIdeas() {
  const dispatch = useDispatch<AppDispatch>()
  const ideas = useSelector((state: RootState) => state.ideas.ideas)

  const createIdea = useCallback(
    (mode: "guided" | "quickstart"): Idea => {
      return dispatch.ideas.create(mode)
    },
    [dispatch]
  )

  const updateIdea = useCallback(
    (id: number, patch: Partial<Idea>) => {
      dispatch.ideas.update({ id, patch })
    },
    [dispatch]
  )

  const deleteIdea = useCallback(
    (id: number) => {
      dispatch.ideas.delete(id)
    },
    [dispatch]
  )

  const getIdea = useCallback(
    (id: number): Idea | undefined => ideas.find((idea) => idea.id === id),
    [ideas]
  )

  return { ideas, createIdea, updateIdea, deleteIdea, getIdea }
}
