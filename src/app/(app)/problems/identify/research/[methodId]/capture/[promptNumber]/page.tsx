"use client"

import { useParams, useRouter } from "next/navigation"
import { useResearch } from "@/components/research/research-context"
import { CapturePanel } from "../../../research-panels"
import { researchCaptureHref, researchReviewHref, researchToolHref } from "../../../routes"

export default function ResearchCapturePage() {
  const router = useRouter()
  const { method } = useResearch()
  const { promptNumber } = useParams<{ promptNumber: string }>()
  const index = Number(promptNumber) - 1

  // The layout redirects out-of-range numbers; render nothing until it lands.
  if (!Number.isInteger(index) || index < 0 || index >= method.prompts.length) return null

  return (
    <CapturePanel
      index={index}
      onIndexChange={(next) => router.push(researchCaptureHref(method.id, next))}
      onBackToTool={() => router.push(researchToolHref(method.id))}
      onReview={() => router.push(researchReviewHref(method.id))}
    />
  )
}
