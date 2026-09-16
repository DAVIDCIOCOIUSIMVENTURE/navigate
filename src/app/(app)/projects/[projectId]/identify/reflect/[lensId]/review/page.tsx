"use client"

import { useRouter } from "next/navigation"
import { useReflect } from "@/components/reflect/reflect-context"
import { useProjectScope } from "@/hooks/use-projects"
import { ReviewPanel } from "../../reflect-panels"
import { reflectHrefs } from "../../routes"

export default function ReflectReviewPage() {
  const router = useRouter()
  const { lens } = useReflect()
  const hrefs = reflectHrefs(useProjectScope().projectId)

  return (
    <ReviewPanel
      onBack={() => router.push(hrefs.prompt(lens.id, 0))}
      onJumpToPrompt={(promptId) => {
        const idx = lens.prompts.findIndex((p) => p.id === promptId)
        router.push(hrefs.prompt(lens.id, idx >= 0 ? idx : 0))
      }}
    />
  )
}
