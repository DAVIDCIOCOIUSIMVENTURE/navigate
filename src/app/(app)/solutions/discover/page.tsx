"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadActiveDiscoveryProblemId } from "@/lib/active-discovery-problem"

export default function DiscoverIndexPage() {
  const router = useRouter()

  useEffect(() => {
    const hasActiveProblem = loadActiveDiscoveryProblemId() !== null
    router.replace(
      hasActiveProblem
        ? "/solutions/discover/choose-discovery"
        : "/solutions/discover/select-problem"
    )
  }, [router])

  return null
}
