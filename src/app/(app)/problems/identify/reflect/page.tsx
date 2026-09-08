"use client"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { getReflectLens, type LensId } from "@/data/reflectLenses"
import { PickMethodPanel } from "./reflect-panels"
import { reflectPromptHref } from "./routes"

export default function ReflectPickPage() {
  const router = useRouter()
  const storedLensId = useSelector((s: RootState) => s.reflectSessions.lastPickedLensId)
  const selectedLensId =
    storedLensId && getReflectLens(storedLensId) ? (storedLensId as LensId) : null

  return (
    <PickMethodPanel
      selectedLensId={selectedLensId}
      onPick={(id) => router.push(reflectPromptHref(id, 0))}
    />
  )
}
