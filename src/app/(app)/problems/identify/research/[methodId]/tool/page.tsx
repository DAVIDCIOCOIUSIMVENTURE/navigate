"use client"

import { useRouter } from "next/navigation"
import { useResearch } from "@/components/research/research-context"
import { ToolPickerPanel } from "../../research-panels"
import { researchCaptureHref, researchPickHref } from "../../routes"

export default function ResearchToolPage() {
  const router = useRouter()
  const { method } = useResearch()

  return (
    <ToolPickerPanel
      onBack={() => router.push(researchPickHref())}
      onContinue={() => router.push(researchCaptureHref(method.id, 0))}
    />
  )
}
