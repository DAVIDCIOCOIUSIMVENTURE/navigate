"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LayoutTemplate, ArrowLeft, Gauge, Target, Coins, Clock,
  CheckCircle2, XCircle, HelpCircle, Circle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAdjacentSteps, useSolutionValidation } from "../context"
import type { ValidationStatus } from "@/types/idea"

const STATUS_CONFIG: Record<ValidationStatus, { icon: LucideIcon; label: string; className: string }> = {
  unvalidated: { icon: Circle, label: "Unvalidated", className: "text-muted-foreground border-muted-foreground/40" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-yellow-700 border-yellow-500 bg-yellow-50" },
  valid: { icon: CheckCircle2, label: "Valid: worth pursuing", className: "text-green-700 border-green-500 bg-green-50" },
  invalid: { icon: XCircle, label: "Invalid: not worth pursuing", className: "text-red-700 border-red-500 bg-red-50" },
  unsure: { icon: HelpCircle, label: "Unsure: needs more evidence", className: "text-orange-700 border-orange-500 bg-orange-50" },
}

function MetricRow({ icon: Icon, label, score }: { icon: LucideIcon; label: string; score: number | null }) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-sm flex-1">{label}</span>
      <span className={cn("text-sm font-semibold", score == null && "text-muted-foreground")}>
        {score == null ? "Not scored" : `${score} / 5`}
      </span>
    </div>
  )
}

export default function ValidationSummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    solutionId, solution, problem,
    feasibility, impact, cost, timeToImplement,
    validationStatus, validationReason,
  } = useSolutionValidation()
  const { prevPath } = getAdjacentSteps(pathname, solutionId)

  const statusConfig = STATUS_CONFIG[validationStatus] ?? STATUS_CONFIG.unvalidated
  const StatusIcon = statusConfig.icon

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={LayoutTemplate}>Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-8">
        <p className="text-md leading-relaxed">
          Here&apos;s the full picture of this validation. Use this as the artefact you carry forward when deciding what to build.
        </p>

        {(solution?.title || problem?.description) && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-2">
            {solution?.title && (
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solution</p>
                <p className="text-sm font-medium">{solution.title}</p>
                {solution.description && (
                  <p className="text-sm text-muted-foreground">{solution.description}</p>
                )}
              </div>
            )}
            {problem?.description && (
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Scores</h3>
          <div className="flex flex-col gap-2">
            <MetricRow icon={Gauge} label="Feasibility" score={feasibility} />
            <MetricRow icon={Target} label="Impact" score={impact} />
            <MetricRow icon={Coins} label="Cost" score={cost} />
            <MetricRow icon={Clock} label="Time to Implement" score={timeToImplement} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Verdict</h3>
          <div className={cn("flex items-center gap-3 rounded-lg border-2 p-4", statusConfig.className)}>
            <StatusIcon className="h-5 w-5 shrink-0" />
            <span className="text-md font-semibold">{statusConfig.label}</span>
          </div>
          {validationReason && (
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Reasoning</p>
              <p className="text-sm whitespace-pre-wrap">{validationReason}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          <Button onClick={() => router.push("/solutions")}>Finish</Button>
        </div>
      </CardContent>
    </Card>
  )
}
