"use client"

import { useRouter } from "next/navigation"
import { useGuided } from "@/components/guided/guided-context"
import { useProjectScope } from "@/hooks/use-projects"
import { ReviewPanel } from "../guided-panels"
import { guidedHrefs } from "../routes"

export default function GuidedReviewPage() {
  const router = useRouter()
  const { path } = useGuided()
  const hrefs = guidedHrefs(useProjectScope().projectId)

  return (
    <ReviewPanel
      onBack={() => router.push(hrefs.question(0))}
      onJumpToQuestion={(nodeId) => {
        const idx = path.nodes.findIndex((node) => node.id === nodeId)
        router.push(hrefs.question(idx >= 0 ? idx : 0))
      }}
    />
  )
}
