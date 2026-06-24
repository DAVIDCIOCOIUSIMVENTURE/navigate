"use client"

import { useEffect } from "react"
import { useRouter } from "@/lib/router"

export default function IntroductionRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/solutions/discover")
  }, [router])
  return null
}
