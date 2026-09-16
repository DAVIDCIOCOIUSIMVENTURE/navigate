"use client"

import { useRouter } from "next/navigation"
import { useResearch } from "@/components/research/research-context"
import { useProjectScope } from "@/hooks/use-projects"
import { ToolPickerPanel } from "../../research-panels"
import { researchHrefs } from "../../routes"

export default function ResearchToolPage() {
  const router = useRouter()
  const { method } = useResearch()
  const hrefs = researchHrefs(useProjectScope().projectId)

  return (
    <ToolPickerPanel
      onBack={() => router.push(hrefs.pick())}
      onContinue={() => router.push(hrefs.capture(method.id, 0))}
    />
  )
}
