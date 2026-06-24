"use client"

import { cn } from "@/lib/utils"
import { useContainerSize } from "@/context/container-size-context"
import { ResearchBuilder } from "./research-builder"

export default function ResearchPage() {
  const isWide = useContainerSize() === "wide"

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 flex-col gap-3",
          "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          isWide && "overflow-hidden max-h-[100svh]",
        )}
      >
        <ResearchBuilder />
      </div>
    </div>
  )
}
