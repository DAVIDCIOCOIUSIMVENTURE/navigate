"use client"

import { useRouter } from "next/navigation"
import { useReflect } from "@/components/reflect/reflect-context"
import { ReviewPanel } from "../../reflect-panels"
import { reflectPickHref, reflectPromptHref } from "../../routes"

export default function ReflectReviewPage() {
  const router = useRouter()
  const { lens } = useReflect()

  return (
    <ReviewPanel
      onBack={() => router.push(reflectPromptHref(lens.id, 0))}
      onJumpToPrompt={(promptId) => {
        const idx = lens.prompts.findIndex((p) => p.id === promptId)
        router.push(reflectPromptHref(lens.id, idx >= 0 ? idx : 0))
      }}
      onKeepIdentifying={() => router.push(reflectPickHref())}
    />
  )
}
