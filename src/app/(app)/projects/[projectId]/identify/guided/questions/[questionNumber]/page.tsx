"use client"

import { useParams, useRouter } from "next/navigation"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { QuestionPanel } from "../../guided-panels"
import { guidedHrefs } from "../../routes"

export default function GuidedQuestionPage() {
  const router = useRouter()
  const { projectId } = useProjectScope()
  const hrefs = guidedHrefs(projectId)
  const { questionNumber } = useParams<{ questionNumber: string }>()
  const index = Number(questionNumber) - 1

  // The layout redirects malformed numbers, and the panel renders nothing for
  // a number the path has not reached yet.
  if (!Number.isInteger(index) || index < 0) return null

  return (
    <QuestionPanel
      index={index}
      onIndexChange={(next) => router.push(hrefs.question(next))}
      onLeave={() => router.push(projectRoutes.identify(projectId))}
      onReview={() => router.push(hrefs.review())}
    />
  )
}
