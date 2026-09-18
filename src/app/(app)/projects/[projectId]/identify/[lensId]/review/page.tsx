"use client"

import { useRouter } from "next/navigation"
import { useReflect } from "@/components/reflect/reflect-context"
import { useProjectScope } from "@/hooks/use-projects"
import { ReviewPanel } from "../lens-panels"
import { lensHrefs } from "../routes"

export default function LensReviewPage() {
  const router = useRouter()
  const { lens } = useReflect()
  const hrefs = lensHrefs(useProjectScope().projectId, lens.id)

  return (
    <ReviewPanel
      onBack={() => router.push(hrefs.prompt(0))}
      onJumpToPrompt={(promptId) => {
        const idx = lens.prompts.findIndex((p) => p.id === promptId)
        router.push(hrefs.prompt(idx >= 0 ? idx : 0))
      }}
    />
  )
}
