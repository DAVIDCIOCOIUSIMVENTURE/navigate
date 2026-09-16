"use client"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { getReflectLens, type LensId } from "@/data/reflectLenses"
import { useProjectScope } from "@/hooks/use-projects"
import { selectReflectProject } from "@/store/reflect-sessions-model"
import { PickMethodPanel } from "./reflect-panels"
import { reflectHrefs } from "./routes"

export default function ReflectPickPage() {
  const router = useRouter()
  const { projectId } = useProjectScope()
  const hrefs = reflectHrefs(projectId)
  const storedLensId = useSelector((s: RootState) => selectReflectProject(s, projectId).lastPickedLensId)
  const selectedLensId =
    storedLensId && getReflectLens(storedLensId) ? (storedLensId as LensId) : null

  return (
    <PickMethodPanel
      selectedLensId={selectedLensId}
      onPick={(id) => router.push(hrefs.prompt(id, 0))}
    />
  )
}
