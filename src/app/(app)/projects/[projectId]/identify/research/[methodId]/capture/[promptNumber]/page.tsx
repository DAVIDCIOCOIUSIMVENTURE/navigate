"use client"

import { useParams, useRouter } from "next/navigation"
import { useResearch } from "@/components/research/research-context"
import { useProjectScope } from "@/hooks/use-projects"
import { CapturePanel } from "../../../research-panels"
import { researchHrefs } from "../../../routes"

export default function ResearchCapturePage() {
  const router = useRouter()
  const { method } = useResearch()
  const hrefs = researchHrefs(useProjectScope().projectId)
  const { promptNumber } = useParams<{ promptNumber: string }>()
  const index = Number(promptNumber) - 1

  // The layout redirects out-of-range numbers; render nothing until it lands.
  if (!Number.isInteger(index) || index < 0 || index >= method.prompts.length) return null

  return (
    <CapturePanel
      index={index}
      onIndexChange={(next) => router.push(hrefs.capture(method.id, next))}
      onBackToTool={() => router.push(hrefs.tool(method.id))}
      onReview={() => router.push(hrefs.review(method.id))}
    />
  )
}
