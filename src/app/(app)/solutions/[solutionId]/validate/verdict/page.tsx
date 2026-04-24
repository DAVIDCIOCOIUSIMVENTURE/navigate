"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft, CheckCircle2, XCircle, HelpCircle, Gauge, Target, Coins, Clock,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAdjacentSteps, useSolutionValidation } from "../context"
import type { ValidationStatus } from "@/types/idea"

type VerdictKey = "valid" | "unsure" | "invalid"

const VERDICTS: { key: VerdictKey; label: string; description: string; icon: LucideIcon; accent: string }[] = [
  {
    key: "valid",
    label: "Valid: worth pursuing",
    description: "The metrics support moving forward. Promote this solution into a build plan.",
    icon: CheckCircle2,
    accent: "border-green-500 bg-green-50 text-green-700",
  },
  {
    key: "unsure",
    label: "Unsure: needs more evidence",
    description: "Promising but with open questions. Capture what you would need to learn next.",
    icon: HelpCircle,
    accent: "border-orange-500 bg-orange-50 text-orange-700",
  },
  {
    key: "invalid",
    label: "Invalid: not worth pursuing",
    description: "The metrics don't support it. Park the solution and focus effort elsewhere.",
    icon: XCircle,
    accent: "border-red-500 bg-red-50 text-red-700",
  },
]

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

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    solutionId, solution, problem,
    feasibility, impact, cost, timeToImplement,
    validationStatus, setValidationStatus,
    validationReason, setValidationReason,
  } = useSolutionValidation()
  const { prevPath } = getAdjacentSteps(pathname, solutionId)

  const currentKey = (["valid", "unsure", "invalid"] as const).includes(validationStatus as VerdictKey)
    ? (validationStatus as VerdictKey)
    : null

  const handleChoose = (key: VerdictKey) => {
    setValidationStatus(key as ValidationStatus)
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={CheckCircle2}>Verdict</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-md leading-relaxed">
          Based on the four metrics, decide whether this solution is worth pursuing. A high-impact, feasible, low-cost, fast solution is an easy yes. A low-impact, expensive, slow one is an easy no. Most sit somewhere in between.
        </p>

        {(solution?.title || problem?.description) && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-2">
            {solution?.title && (
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solution</p>
                <p className="text-sm font-medium">{solution.title}</p>
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your scores</h3>
          <div className="flex flex-col gap-2">
            <MetricRow icon={Gauge} label="Feasibility" score={feasibility} />
            <MetricRow icon={Target} label="Impact" score={impact} />
            <MetricRow icon={Coins} label="Cost" score={cost} />
            <MetricRow icon={Clock} label="Time to Implement" score={timeToImplement} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Decision</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {VERDICTS.map(({ key, label, description, icon: Icon, accent }) => {
              const selected = currentKey === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChoose(key)}
                  aria-pressed={selected}
                  className={cn(
                    "relative flex flex-col gap-2 rounded-xl border-2 p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? accent + " shadow-md"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <Icon className={cn("h-5 w-5", selected ? "" : "text-muted-foreground")} />
                  <span className="text-md font-semibold">{label}</span>
                  <span className={cn("text-sm leading-relaxed", selected ? "" : "text-muted-foreground")}>
                    {description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="verdict-reason">
            Reasoning (optional)
          </label>
          <Textarea
            id="verdict-reason"
            value={validationReason}
            onChange={(e) => setValidationReason(e.target.value)}
            placeholder="Capture the thinking behind your verdict. What clinched it? What would change your mind?"
            rows={4}
          />
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
