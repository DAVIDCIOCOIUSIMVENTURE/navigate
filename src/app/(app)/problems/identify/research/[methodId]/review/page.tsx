"use client"

import { useRouter } from "next/navigation"
import { useResearch } from "@/components/research/research-context"
import { ReviewPanel } from "../../research-panels"
import { researchCaptureHref, researchPickHref } from "../../routes"

export default function ResearchReviewPage() {
  const router = useRouter()
  const { method } = useResearch()

  return (
    <ReviewPanel
      onBack={() => router.push(researchCaptureHref(method.id, 0))}
      onJumpToPrompt={(promptId) => {
        const idx = method.prompts.findIndex((p) => p.id === promptId)
        router.push(researchCaptureHref(method.id, idx >= 0 ? idx : 0))
      }}
      onKeepResearching={() => router.push(researchPickHref())}
    />
  )
}
