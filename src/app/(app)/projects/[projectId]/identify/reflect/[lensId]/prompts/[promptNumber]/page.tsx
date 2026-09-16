"use client"

import { useParams, useRouter } from "next/navigation"
import { useReflect } from "@/components/reflect/reflect-context"
import { useProjectScope } from "@/hooks/use-projects"
import { PromptsPanel } from "../../../reflect-panels"
import { reflectHrefs } from "../../../routes"

export default function ReflectPromptPage() {
  const router = useRouter()
  const { lens } = useReflect()
  const hrefs = reflectHrefs(useProjectScope().projectId)
  const { promptNumber } = useParams<{ promptNumber: string }>()
  const index = Number(promptNumber) - 1

  // The layout redirects out-of-range numbers; render nothing until it lands.
  if (!Number.isInteger(index) || index < 0 || index >= lens.prompts.length) return null

  return (
    <PromptsPanel
      index={index}
      onIndexChange={(next) => router.push(hrefs.prompt(lens.id, next))}
      onBackToPick={() => router.push(hrefs.pick())}
      onReview={() => router.push(hrefs.review(lens.id))}
    />
  )
}
