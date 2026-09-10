"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function IntroductionRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/solutions/identify")
  }, [router])
  return null
}
