"use client"

import { useParams, useRouter } from "next/navigation"
import { useReflect } from "@/components/reflect/reflect-context"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { PromptsPanel } from "../../lens-panels"
import { lensHrefs } from "../../routes"

export default function LensPromptPage() {
  const router = useRouter()
  const { lens } = useReflect()
  const { projectId } = useProjectScope()
  const hrefs = lensHrefs(projectId, lens.id)
  const { promptNumber } = useParams<{ promptNumber: string }>()
  const index = Number(promptNumber) - 1

  // The layout redirects out-of-range numbers; render nothing until it lands.
  if (!Number.isInteger(index) || index < 0 || index >= lens.prompts.length) return null

  return (
    <PromptsPanel
      index={index}
      onIndexChange={(next) => router.push(hrefs.prompt(next))}
      onLeave={() => router.push(projectRoutes.identify(projectId))}
      onReview={() => router.push(hrefs.review())}
    />
  )
}
