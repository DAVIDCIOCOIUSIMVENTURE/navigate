"use client"

import { useState, type ComponentProps, type ReactNode } from "react"
import { Eye, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProblemHubDialog } from "@/components/problem-hub/problem-hub-dialog"
import { ProblemContextCard } from "@/components/context-card"
import { FlowShell, type FlowNavItem } from "@/components/flow-shell"
import type { JourneyStepId } from "@/lib/journey-steps"

export { FOCUS_COLUMN_MAX_HEIGHT_CLASS } from "@/components/flow-shell"

export type ProblemFlowNavItem = FlowNavItem

/**
 * Shell for the two per-problem flows, Explore and Validation: the generic
 * `FlowShell` with Back set to the problem canvas and the problem reminder
 * (context card plus a View Problem button that opens the problem hub dialog)
 * under the step list.
 */
export function ProblemFlowShell({
  title,
  icon,
  navLabel,
  problemRef,
  problem,
  base,
  navItems,
  navIcons,
  journeyStep,
  children,
}: {
  title: string
  icon: LucideIcon
  /** Accessible name for the step nav. */
  navLabel: string
  problemRef: string
  problem: ComponentProps<typeof ProblemContextCard>["problem"]
  /** Route prefix the step paths are appended to. */
  base: string
  navItems: readonly ProblemFlowNavItem[]
  navIcons: Record<string, LucideIcon>
  journeyStep: JourneyStepId
  children: ReactNode
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <FlowShell
        title={title}
        icon={icon}
        navLabel={navLabel}
        backHref={`/problems/${problemRef}`}
        base={base}
        navItems={navItems}
        navIcons={navIcons}
        journeyStep={journeyStep}
        context={
          <>
            <ProblemContextCard problem={problem} compact />
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setDialogOpen(true)}>
              <Eye className="h-3.5 w-3.5" />
              View Problem
            </Button>
          </>
        }
        menuActions={[{ label: "View Problem", icon: Eye, onSelect: () => setDialogOpen(true) }]}
      >
        {children}
      </FlowShell>
      <ProblemHubDialog open={dialogOpen} onOpenChange={setDialogOpen} problemRef={problemRef} />
    </>
  )
}
