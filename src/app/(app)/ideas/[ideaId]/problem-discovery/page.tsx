"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProblemDiscoveryIndexPage() {
  const params = useParams()
  const router = useRouter()
  const ideaId = params.ideaId

  useEffect(() => {
    router.replace(`/ideas/${ideaId}/problem-discovery/introduction`)
  }, [ideaId, router])

  return null
}
