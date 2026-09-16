"use client"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { getResearchMethod, type ResearchMethodId } from "@/data/researchMethods"
import { useProjectScope } from "@/hooks/use-projects"
import { selectResearchProject } from "@/store/research-sessions-model"
import { PickMethodPanel } from "./research-panels"
import { researchHrefs } from "./routes"

export default function ResearchPickPage() {
  const router = useRouter()
  const { projectId } = useProjectScope()
  const hrefs = researchHrefs(projectId)
  const storedMethodId = useSelector((s: RootState) => selectResearchProject(s, projectId).lastPickedMethodId)
  const selectedMethodId =
    storedMethodId && getResearchMethod(storedMethodId) ? (storedMethodId as ResearchMethodId) : null

  return (
    <PickMethodPanel
      selectedMethodId={selectedMethodId}
      onPick={(id) => router.push(hrefs.tool(id))}
    />
  )
}
