"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Info } from "lucide-react"
import { getAdjacentSteps, useIdentifySolutions } from "../context"
import { DimensionChips } from "@/components/dimension-chips"
import type { ValidationStatus } from "@/types/validation"
import { TOUR_TARGETS } from "@/lib/tour-steps"

const STATUS_BADGE: Record<"valid" | "unsure", { label: string; icon: typeof CheckCircle2; className: string }> = {
  valid: { label: "Valid", icon: CheckCircle2, className: "text-success border-success/40 bg-success/10" },
  unsure: { label: "Unsure", icon: HelpCircle, className: "text-tertiary border-tertiary/40 bg-tertiary/10" },
}

const ELIGIBLE_STATUSES: ValidationStatus[] = ["valid", "unsure"]

export default function SelectProblemPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemId, setProblemId } = useIdentifySolutions()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)

  const eligibleProblems = useSelector((state: RootState) =>
    state.problems.problems.filter((p) => ELIGIBLE_STATUSES.includes(p.validationStatus))
  )

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Target}>Select a Problem</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-base leading-relaxed">
          Identifying solutions helps you move from a validated problem to concrete solution candidates. You&apos;ll pick a problem, then use creative techniques to generate ideas. Each candidate you capture is added to your Solution Library, where you can validate it later.
        </p>

        <p className="text-base leading-relaxed">
          Choose a problem below to anchor your search for solutions. You can continue to the next step once a problem is selected.
        </p>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-700" />
          <div className="flex flex-col gap-1 text-sm text-blue-900">
            <p>
              Only problems marked as <span className="font-semibold">Valid</span> or <span className="font-semibold">Unsure</span> appear in this list. Unsure problems can still be worth exploring while you gather more evidence.
            </p>
            <p>
              If a problem you started working on isn&apos;t showing up, it&apos;s because it hasn&apos;t been validated yet. Head to the <span className="font-semibold">Problems</span> page to finish validating it.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold">Problems</h3>
          {eligibleProblems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center flex flex-col items-center gap-3">
              <Target className="h-8 w-8 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">No eligible problems yet</p>
                <p className="text-sm">
                  Validate a problem as Valid or Unsure before identifying solutions.
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push("/problems")}>Go to Problems</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {eligibleProblems.map((problem) => {
                const selected = problemId === problem.id
                const status = (problem.validationStatus === "unsure" ? "unsure" : "valid") as "valid" | "unsure"
                const badge = STATUS_BADGE[status]
                const BadgeIcon = badge.icon
                return (
                  <button
                    key={problem.id}
                    onClick={() => setProblemId(problem.id)}
                    data-tour={TOUR_TARGETS.discoverProblem(problem.id)}
                    className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
                      selected ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                      selected ? "bg-primary" : "bg-tertiary/10"
                    }`}>
                      {selected
                        ? <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                        : <Target className="h-4 w-4 text-tertiary" />}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-base font-medium">{problem.title || "Untitled problem"}</p>
                          {problem.description && (
                            <p className="text-base line-clamp-2 opacity-70">{problem.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className={`shrink-0 gap-1 ${badge.className}`}>
                          <BadgeIcon className="h-3 w-3" />
                          {badge.label}
                        </Badge>
                      </div>
                      {(problem.customers.length > 0 || problem.contexts.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <DimensionChips columnId="customers" ids={problem.customers.slice(0, 3)} />
                          <DimensionChips columnId="contexts" ids={problem.contexts.slice(0, 3)} />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-2">
          {prevPath
            ? <Button variant="primary-outline" onClick={() => router.push(prevPath)}><ArrowLeft className="h-4 w-4" />Previous</Button>
            : <span />}
          {nextPath && (
            <Button onClick={() => router.push(nextPath)} disabled={problemId == null} data-tour={TOUR_TARGETS.discoverNext}>
              Next<ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
