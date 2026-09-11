"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ProblemHubDialog } from "@/components/problem-hub/problem-hub-dialog"
import { SolutionHubDialog } from "@/components/solution-hub/solution-hub-dialog"
import { ProblemContextCard, SolutionContextCard } from "@/components/context-card"
import { FlowShell } from "@/components/flow-shell"
import { SolutionProvider, useSolution, NAV_ITEMS } from "./context"
import {
  ClipboardCheck, Gauge, Target, Coins, Clock, CheckCircle2, LayoutTemplate, Eye, Lightbulb,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: ClipboardCheck,
  feasibility: Gauge,
  impact: Target,
  cost: Coins,
  "time-to-implement": Clock,
  verdict: CheckCircle2,
  review: LayoutTemplate,
}

/**
 * Solution validation is a focus flow like problem validation: the generic
 * `FlowShell` with Back set to the solution canvas and, under the step list,
 * reminders of both the solution and its linked problem with a View button
 * for each.
 */
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { solutionId, solution, problem } = useSolution()
  const [solutionDialogOpen, setSolutionDialogOpen] = useState(false)
  const [problemDialogOpen, setProblemDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <FlowShell
        title="Validate the solution"
        icon={ClipboardCheck}
        navLabel="Solution validation steps"
        backHref={`/solutions/${solutionId}`}
        base={`/solutions/${solutionId}/validate`}
        navItems={NAV_ITEMS}
        navIcons={NAV_ICONS}
        journeyStep="validate-solutions"
        journeyProblemId={problem?.id ?? null}
        context={
          <>
            <SolutionContextCard solution={solution} compact />
            <ProblemContextCard problem={problem} compact />
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setSolutionDialogOpen(true)}>
              <Lightbulb className="h-3.5 w-3.5" />
              View Solution
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setProblemDialogOpen(true)}>
              <Eye className="h-3.5 w-3.5" />
              View Problem
            </Button>
          </>
        }
        menuActions={[
          { label: "View Solution", icon: Lightbulb, onSelect: () => setSolutionDialogOpen(true) },
          { label: "View Problem", icon: Eye, onSelect: () => setProblemDialogOpen(true) },
        ]}
      >
        {mounted ? children : null}
      </FlowShell>

      <SolutionHubDialog
        open={solutionDialogOpen}
        onOpenChange={setSolutionDialogOpen}
        solutionId={solutionId}
      />
      <ProblemHubDialog
        open={problemDialogOpen}
        onOpenChange={setProblemDialogOpen}
        problemRef={problem ? String(problem.id) : null}
      />
    </>
  )
}

export default function ValidateLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const solutionId = Number(params.solutionId)

  return (
    <SolutionProvider solutionId={solutionId}>
      <LayoutContent>{children}</LayoutContent>
    </SolutionProvider>
  )
}
