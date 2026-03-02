"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useIdeas } from "@/store/ideas-hooks"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

export default function IdeaRootPage() {
  const params = useParams()
  const router = useRouter()
  const { getIdea } = useIdeas()
  const ideaMode = useSelector((state: RootState) => state.settings.ideaMode)

  const ideaId = Number(params.ideaId)

  useEffect(() => {
    const idea = getIdea(ideaId)
    if (!idea) {
      router.replace("/ideas")
      return
    }
    if (ideaMode === "quickstart") {
      if (idea.problemDiscoveryComplete) {
        router.replace(`/ideas/${ideaId}/problem-validation/quickstart`)
      } else {
        router.replace(`/ideas/${ideaId}/problem-discovery/quickstart`)
      }
    } else {
      if (idea.problemDiscoveryComplete) {
        router.replace(`/ideas/${ideaId}/problem-validation/pick-a-problem`)
      } else {
        router.replace(`/ideas/${ideaId}/problem-discovery/customers`)
      }
    }
  }, [ideaId, getIdea, ideaMode, router])

  return null
}
