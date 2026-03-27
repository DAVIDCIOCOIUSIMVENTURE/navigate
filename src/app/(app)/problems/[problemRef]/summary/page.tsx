"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle, GitFork, Users, LayoutTemplate,
  ArrowRight, CheckCircle2, HelpCircle, XCircle, Copy, RotateCcw, Lightbulb,
  Target, BarChart2,
} from "lucide-react"
import { useProblemValidation, getAdjacentSteps } from "../context"
import type { ValidationMetric } from "@/types/idea"

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-foreground/70" />
      <span className="font-semibold text-md">{label}</span>
    </div>
  )
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-xs text-muted-foreground/60 italic">None added</span>
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((t) => (
        <span key={t} className="inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-sm border border-border">
          {t}
        </span>
      ))}
    </div>
  )
}

function EmptyText({ text = "Not provided" }: { text?: string }) {
  return <span className="text-xs text-muted-foreground/60 italic">{text}</span>
}

function MetricField({ label, metric }: { label: string; metric: ValidationMetric }) {
  const hasValue = metric.value !== null
  const hasLevel = metric.level !== ""

  const display = hasValue
    ? `${metric.value?.toLocaleString()}${metric.unit ? ` ${metric.unit}` : ""}`
    : hasLevel
      ? metric.level
      : null

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      {display ? (
        <span className="inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-sm border border-border capitalize self-start">{display}</span>
      ) : (
        <EmptyText />
      )}
    </div>
  )
}

export default function SummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()

  const {
    problemRef,
    problemId,
    segmentSize,
    customerDescription,
    existingSolutions,
    status,
    reason,
    validationAssessment,
  } = useProblemValidation()

  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  const { howManyPeople, howOften, worthToThem, costOfSwitching, solutionEffectiveness, competitorSize } = validationAssessment

  const hasAnyMetric = [howManyPeople, howOften, worthToThem, costOfSwitching, solutionEffectiveness, competitorSize]
    .some((m) => m.value !== null || m.level !== "")

  const handleDuplicate = () => {
    const problems = JSON.parse(localStorage.getItem("navigate-problems") || '{"problems":[]}')
    const original = problems.problems.find((p: { id: number }) => p.id === problemId)
    if (!original) return

    const newProblem = dispatch.problems.create({
      source: original.source,
      description: original.description,
      customerSegments: [...original.customerSegments],
      contexts: [...original.contexts],
      jobsToBeDone: [...original.jobsToBeDone],
      problemTypes: [...original.problemTypes],
      segmentSize: original.segmentSize ?? null,
      customerDescription: original.customerDescription ?? "",
    })

    if (newProblem && typeof newProblem === "object" && "id" in newProblem) {
      router.push(`/problems/${newProblem.id}/introduction`)
    }
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={LayoutTemplate}>Summary & Next Steps</CardTitle>
        <p className="text-md text-muted-foreground">A read-only overview of everything you have captured so far.</p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">

        {/* ── Row 1: Customer ── */}
        <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-3">
          <SectionHeader icon={Users} label="Customer" />
          <div className="flex flex-col sm:flex-row sm:gap-6 gap-3">
            <div className="flex flex-col gap-1 shrink-0">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Segment Size</p>
              {segmentSize !== null ? (
                <span className="inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-sm border border-border self-start">{segmentSize.toLocaleString()}</span>
              ) : (
                <EmptyText />
              )}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Description</p>
              {customerDescription ? (
                <span className="inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-sm border border-border self-start">{customerDescription}</span>
              ) : (
                <EmptyText />
              )}
            </div>
          </div>
        </div>

        {/* ── Row 2: Core Problem + Solutions ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* ── Core Problem ── */}
          <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-3">
            <SectionHeader icon={AlertCircle} label="Core Problem" />
            {problem ? (
              <>
                {problem.description ? (
                  <p className="text-md text-foreground/80 leading-relaxed">{problem.description}</p>
                ) : (
                  <EmptyText text="No description" />
                )}
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Customer Segments</p>
                  <ChipList items={problem.customerSegments} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Context</p>
                  <ChipList items={problem.contexts} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Jobs to Be Done</p>
                  <ChipList items={problem.jobsToBeDone} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Problem Types</p>
                  <ChipList items={problem.problemTypes} />
                </div>
              </>
            ) : (
              <EmptyText text="No problem selected" />
            )}
          </div>

          {/* ── Existing Solutions, Shortcomings & Impacts ── */}
          <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-3">
            <SectionHeader icon={GitFork} label="Existing Solutions, Shortcomings & Impacts" />
            {existingSolutions.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {existingSolutions.map((alt) => (
                  <li key={alt.id} className="flex flex-col gap-2 bg-white/60 rounded-lg px-3 py-2.5 border border-border">
                    <p className="text-md font-medium text-foreground/90">{alt.text || <EmptyText text="Unnamed" />}</p>
                    {alt.shortcomings.length > 0 && (
                      <div className="flex flex-col gap-0.5 pl-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Shortcomings</p>
                        <ul className="flex flex-col gap-0.5">
                          {alt.shortcomings.map((sc, j) => (
                            <li key={j} className="text-xs text-foreground/70 flex gap-1.5">
                              <span className="text-muted-foreground shrink-0">–</span>
                              {sc || <EmptyText text="Empty" />}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(alt.impacts ?? []).filter((imp) => imp.category || imp.description).length > 0 && (
                      <div className="flex flex-col gap-0.5 pl-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Impacts</p>
                        <ul className="flex flex-col gap-0.5">
                          {alt.impacts.filter((imp) => imp.category || imp.description).map((imp, k) => (
                            <li key={k} className="text-xs text-foreground/70 flex gap-2 items-baseline">
                              <BarChart2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="font-medium">{imp.category || "—"}</span>
                              {imp.description && <span>{imp.description}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyText text="No existing solutions added" />
            )}
          </div>

        </div>

        {/* ── Row 3: Validation Assessment ── */}
        <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-4">
          <SectionHeader icon={Target} label="Validation Assessment" />
          {hasAnyMetric ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <MetricField label="How Many Customers" metric={howManyPeople} />
                  <MetricField label="How Often" metric={howOften} />
                  <MetricField label="How Much Is It Worth" metric={worthToThem} />
                </div>
                <div className="flex flex-col gap-3">
                  <MetricField label="Cost of Switching" metric={costOfSwitching} />
                  <MetricField label="Solution Effectiveness" metric={solutionEffectiveness} />
                  <MetricField label="Competitor Size" metric={competitorSize} />
                </div>
              </div>
              {reason && (
                <div className="flex flex-col gap-1 border-t pt-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</p>
                  <p className="text-md text-foreground/80 leading-relaxed">{reason}</p>
                </div>
              )}
            </>
          ) : (
            <EmptyText text="No validation data yet — complete the validation step first" />
          )}

          {/* Verdict badge */}
          {(status === "valid" || status === "invalid" || status === "unsure") && (
            <div className="border-t pt-3 flex items-center gap-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Verdict:</p>
              {status === "valid" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 border border-green-200 px-2.5 py-1 text-sm font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                </span>
              )}
              {status === "unsure" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 border border-orange-200 px-2.5 py-1 text-sm font-medium text-orange-700">
                  <HelpCircle className="h-3.5 w-3.5" /> Unsure
                </span>
              )}
              {status === "invalid" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1 text-sm font-medium text-red-700">
                  <XCircle className="h-3.5 w-3.5" /> Invalid
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Next Steps ── */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <ArrowRight className="h-5 w-5" /> Next Steps
          </h2>
          <p className="text-md text-muted-foreground mb-4">
            Based on your validation verdict, here is what you can do next.
          </p>

          {status === "valid" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <h3 className="text-lg font-semibold text-foreground">Your problem is valid</h3>
              </div>
              <p className="text-md text-muted-foreground">
                You have confirmed that this problem is real, painful, and worth pursuing.
                The next step is to brainstorm and evaluate potential solutions.
              </p>
              <Button
                className="self-start"
                onClick={() => router.push("/solutions")}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Continue to Solutions
              </Button>
            </div>
          )}

          {status === "unsure" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-orange-500 shrink-0" />
                <h3 className="text-lg font-semibold text-foreground">You are unsure about this problem</h3>
              </div>
              <p className="text-md text-muted-foreground">
                Uncertainty is normal at this stage. It usually means you need more information
                before you can confidently commit to solving this problem. You have two options:
              </p>
              <div className="flex flex-col gap-4 mt-1">
                <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Duplicate and start again
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This creates a fresh copy of your problem, keeping the core description and
                    customer definition intact. The existing solutions and validation data will be
                    cleared so you can approach the problem from a different angle.
                  </p>
                  <Button
                    size="sm"
                    className="self-start mt-1"
                    onClick={handleDuplicate}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate &amp; Start Again
                  </Button>
                </div>
                <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Revisit your validation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Go back to the validation step and review your scores. Adjusting even one
                    factor can shift the overall picture.
                  </p>
                  <Button
                    size="sm"
                    className="self-start mt-1"
                    onClick={() => router.push(`/problems/${problemRef}/validate`)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Revisit Validation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                <h3 className="text-lg font-semibold text-foreground">This problem is not valid</h3>
              </div>
              <p className="text-md text-muted-foreground">
                Your validation suggests this problem is not worth solving in its current form.
                That does not mean the underlying idea is bad. Often, a problem becomes valid
                when you look at it through a different lens.
              </p>
              <div className="flex flex-col gap-4 mt-1">
                <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Duplicate and try a different angle
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This creates a fresh copy of your problem, keeping the core description and
                    customer definition but clearing all existing solutions and validation data.
                  </p>
                  <Button
                    size="sm"
                    className="self-start mt-1"
                    onClick={handleDuplicate}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate &amp; Start Again
                  </Button>
                </div>
                <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Move on to a different problem
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Go back to your problem list and pick another problem to validate. Ruling out
                    a problem is still progress.
                  </p>
                  <Button
                    size="sm"
                    className="self-start mt-1"
                    onClick={() => router.push("/problems")}
                  >
                    Back to Problems
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(status === "unvalidated" || status === "in_progress") && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                <h3 className="text-lg font-semibold text-foreground">No verdict yet</h3>
              </div>
              <p className="text-md text-muted-foreground">
                Complete the validation step first to see your next steps.
              </p>
              <Button
                className="self-start"
                onClick={() => router.push(`/problems/${problemRef}/validate`)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Go to Validation
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
        </div>

      </CardContent>
    </Card>
  )
}
