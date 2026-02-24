"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FindingMyCustomersPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/problem-discovery/find-new-problems/finding-my-customers/introduction")
  }, [router])
  return null
}
