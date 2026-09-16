"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { projectHrefForProblem } from "@/lib/projects"

/**
 * A problem is viewed on its project's page, so `/problems/<id>` sends the
 * user there once the store has loaded (and home when the problem no longer
 * exists). The edit, explore and validation pages under this route stay.
 */
export default function ProblemRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const problemId = Number(params.problemRef)
  const hydrated = useSelector((state: RootState) => state.projects.hydrated)
  const href = useSelector((state: RootState) => projectHrefForProblem(state.projects.projects, problemId))

  useEffect(() => {
    if (hydrated) router.replace(href)
  }, [hydrated, href, router])

  return null
}
