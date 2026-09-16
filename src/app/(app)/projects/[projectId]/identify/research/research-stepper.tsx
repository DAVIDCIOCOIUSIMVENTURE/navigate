"use client"

import { useState, type ReactNode } from "react"
import { Check, ChevronDown, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useContainerSize } from "@/context/container-size-context"
import type { ResearchStep } from "@/store/research-sessions-model"
import {
  NAV_ITEM_ACTIVE_CLASS,
  NAV_ITEM_HOVER_CLASS,
  navStepBadgeClass,
} from "@/lib/nav-item-styles"

export const RESEARCH_STEPS: { id: ResearchStep; label: string }[] = [
  { id: "pick", label: "Pick a method" },
  { id: "tool", label: "Pick a tool" },
  { id: "capture", label: "Capture" },
  { id: "review", label: "Review" },
]

export function ResearchStepper({
  activeId,
  onStepClick,
  isStepEnabled,
  promptsProgress,
  onReset,
  resetDescription,
  contextCard,
}: {
  activeId: ResearchStep
  onStepClick: (id: ResearchStep) => void
  isStepEnabled: (id: ResearchStep) => boolean
  promptsProgress?: { current: number; total: number } | null
  onReset: () => void
  resetDescription: string
  /** Reminder of what the session is anchored on, shown above the Reset button. */
  contextCard?: ReactNode
}) {
  const steps = RESEARCH_STEPS
  const isWide = useContainerSize() === "wide"
  const [open, setOpen] = useState(false)
  const activeIdx = steps.findIndex((s) => s.id === activeId)
  const active = steps[activeIdx] ?? steps[0]

  const stepLabel = (id: ResearchStep, baseLabel: string) => {
    if (id === "capture" && activeId === "capture" && promptsProgress) {
      return `Prompt ${promptsProgress.current} of ${promptsProgress.total}`
    }
    return baseLabel
  }

  const resetButton = (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="w-full gap-2 bg-card text-destructive hover:text-destructive hover:bg-destructive/10">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      }
      title="Reset?"
      description={resetDescription}
      confirmLabel="Reset"
      onConfirm={onReset}
    />
  )

  const navList = (
    <div className="flex flex-col gap-1">
      {steps.map((s, i) => {
        const isActive = s.id === activeId
        const isCompleted = i < activeIdx
        const enabled = isStepEnabled(s.id)
        return (
          <Button
            key={s.id}
            type="button"
            variant="ghost"
            disabled={!enabled}
            onClick={() => {
              if (!enabled) return
              setOpen(false)
              onStepClick(s.id)
            }}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2 disabled:opacity-100",
              NAV_ITEM_HOVER_CLASS,
              isActive && NAV_ITEM_ACTIVE_CLASS,
            )}
          >
            <span className={navStepBadgeClass(isActive ? "active" : isCompleted ? "completed" : enabled ? "default" : "locked")}>
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="flex-1 text-left">{stepLabel(s.id, s.label)}</span>
          </Button>
        )
      })}
    </div>
  )

  if (isWide) {
    return (
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardContent className="p-3 flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">{navList}</div>
          <div className="shrink-0 flex flex-col gap-2">
            {contextCard}
            {resetButton}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <nav aria-label="Research steps" className="w-full shrink-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card>
          <CardContent className="p-2 flex flex-col gap-2">
            {contextCard}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-3">
                <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                  <span className={navStepBadgeClass("active")}>
                    {activeIdx + 1}
                  </span>
                  <span className="truncate">
                    Step {activeIdx + 1} of {steps.length}: {stepLabel(active.id, active.label)}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                    open && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="px-1 flex flex-col gap-3">
                {navList}
                {resetButton}
              </div>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    </nav>
  )
}
