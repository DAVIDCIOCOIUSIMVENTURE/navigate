"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const ACTIVE_PROBLEM_KEY = "navigate-active-discovery-problem"

export default function DiscoverIndexPage() {
  const router = useRouter()

  useEffect(() => {
    let hasActiveProblem = false
    try {
      const raw = localStorage.getItem(ACTIVE_PROBLEM_KEY)
      const parsed = raw == null ? NaN : Number(raw)
      hasActiveProblem = Number.isFinite(parsed)
    } catch {
      hasActiveProblem = false
    }
    router.replace(
      hasActiveProblem
        ? "/solutions/discover/choose-discovery"
        : "/solutions/discover/select-problem"
    )
  }, [router])

  return null
}
