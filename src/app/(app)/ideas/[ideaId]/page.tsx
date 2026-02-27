"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useIdeas } from "@/context/ideas-context"

export default function IdeaRootPage() {
  const params = useParams()
  const router = useRouter()
  const { getIdea } = useIdeas()

  const ideaId = Number(params.ideaId)

  useEffect(() => {
    const idea = getIdea(ideaId)
    if (!idea) {
      router.replace("/ideas")
      return
    }
    if (idea.problemDiscoveryComplete) {
      router.replace(`/ideas/${ideaId}/problem-validation/pick-a-problem`)
    } else {
      router.replace(`/ideas/${ideaId}/problem-discovery/customers`)
    }
  }, [ideaId, getIdea, router])

  return null
}
