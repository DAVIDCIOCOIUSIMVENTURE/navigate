"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProblemValidationIndexPage() {
  const params = useParams()
  const router = useRouter()
  const ideaId = params.ideaId

  useEffect(() => {
    router.replace(`/ideas/${ideaId}/problem-validation/pick-a-problem`)
  }, [ideaId, router])

  return null
}
