"use client"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { getResearchMethod, type ResearchMethodId } from "@/data/researchMethods"
import { PickMethodPanel } from "./research-panels"
import { researchToolHref } from "./routes"

export default function ResearchPickPage() {
  const router = useRouter()
  const storedMethodId = useSelector((s: RootState) => s.researchSessions.lastPickedMethodId)
  const selectedMethodId =
    storedMethodId && getResearchMethod(storedMethodId) ? (storedMethodId as ResearchMethodId) : null

  return (
    <PickMethodPanel
      selectedMethodId={selectedMethodId}
      onPick={(id) => router.push(researchToolHref(id))}
    />
  )
}
