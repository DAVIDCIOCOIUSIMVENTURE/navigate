"use client"

import { useParams, useRouter } from "next/navigation"
import { useReflect } from "@/components/reflect/reflect-context"
import { PromptsPanel } from "../../../reflect-panels"
import { reflectPickHref, reflectPromptHref, reflectReviewHref } from "../../../routes"

export default function ReflectPromptPage() {
  const router = useRouter()
  const { lens } = useReflect()
  const { promptNumber } = useParams<{ promptNumber: string }>()
  const index = Number(promptNumber) - 1

  // The layout redirects out-of-range numbers; render nothing until it lands.
  if (!Number.isInteger(index) || index < 0 || index >= lens.prompts.length) return null

  return (
    <PromptsPanel
      index={index}
      onIndexChange={(next) => router.push(reflectPromptHref(lens.id, next))}
      onBackToPick={() => router.push(reflectPickHref())}
      onReview={() => router.push(reflectReviewHref(lens.id))}
    />
  )
}
