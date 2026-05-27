"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useContainerSize } from "@/context/container-size-context"
import { ResearchBuilder } from "./research-builder"

export default function ResearchPage() {
  const resetRef = useRef<(() => void) | null>(null)
  const containerSize = useContainerSize()
  const isWide = containerSize === "wide"

  return (
    <div
      className={cn(
        "flex flex-col gap-3 w-full flex-1 min-h-0 min-w-0 overflow-x-hidden",
        isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]",
      )}
    >
      <div className="flex items-center justify-between gap-3 shrink-0">
        <p className="text-base leading-relaxed">
          Hunt for problems out in the world. Pick a method and a tool, capture what you find, then save it as a problem.
        </p>
        <ConfirmDialog
          trigger={
            <Button variant="outline" size="sm" className="gap-2 bg-card shrink-0">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className={cn(containerSize === "narrow" && "sr-only")}>Reset</span>
            </Button>
          }
          title="Reset?"
          description="This will return you to the method picker and clear in-progress capture answers. Saved problems are not affected."
          confirmLabel="Reset"
          onConfirm={() => resetRef.current?.()}
        />
      </div>

      <ResearchBuilder resetRef={resetRef} />
    </div>
  )
}
