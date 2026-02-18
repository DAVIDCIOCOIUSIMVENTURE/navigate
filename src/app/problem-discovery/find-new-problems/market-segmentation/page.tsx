"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MarketSegmentationPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/problem-discovery/find-new-problems/market-segmentation/introduction")
  }, [router])
  return null
}
