"use client"

import { type ReactNode } from "react"
import { useParams, notFound } from "next/navigation"
import { getReflectLens } from "@/data/reflectLenses"
import { ReflectProvider } from "./context"

export default function LensLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ lensId: string }>()
  const lens = getReflectLens(params.lensId)
  if (!lens) notFound()

  return (
    <ReflectProvider lens={lens}>
      <div className="flex flex-col w-full flex-1 min-h-0">{children}</div>
    </ReflectProvider>
  )
}
