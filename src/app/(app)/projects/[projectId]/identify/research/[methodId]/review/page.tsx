"use client"

import { useRouter } from "next/navigation"
import { useResearch } from "@/components/research/research-context"
import { useProjectScope } from "@/hooks/use-projects"
import { ReviewPanel } from "../../research-panels"
import { researchHrefs } from "../../routes"

export default function ResearchReviewPage() {
  const router = useRouter()
  const { method } = useResearch()
  const hrefs = researchHrefs(useProjectScope().projectId)

  return (
    <ReviewPanel
      onBack={() => router.push(hrefs.capture(method.id, 0))}
      onJumpToPrompt={(promptId) => {
        const idx = method.prompts.findIndex((p) => p.id === promptId)
        router.push(hrefs.capture(method.id, idx >= 0 ? idx : 0))
      }}
    />
  )
}
