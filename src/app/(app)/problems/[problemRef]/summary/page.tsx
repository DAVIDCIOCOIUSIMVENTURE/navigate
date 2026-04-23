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
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

const sectionToneClasses = {
  indigo: "bg-indigo-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  primary: "bg-primary",
} as const

type SectionTone = keyof typeof sectionToneClasses

function IconTile({ icon: Icon, className, size = "md" }: { icon: React.ElementType; className: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-9 w-9"
  const icon = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
  return (
    <span className={`flex items-center justify-center rounded-lg shrink-0 ${dims} ${className}`} aria-hidden="true">
      <Icon className={`${icon} text-white`} />
    </span>
  )
}

function SectionHeader({ icon: Icon, label, tone = "primary" }: { icon: React.ElementType; label: string; tone?: SectionTone }) {
  return (
    <h3 className="flex items-center gap-2.5 font-semibold text-md">
      <IconTile icon={Icon} className={sectionToneClasses[tone]} size="sm" />
      {label}
    </h3>
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

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
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
    <Field label={label}>
      {display ? (
        <span className="inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-sm border border-border capitalize">{display}</span>
      ) : (
        <EmptyText />
      )}
    </Field>
  )
}

export default function SummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const containerSize = useContainerSize()

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
          <SectionHeader icon={Users} label="Customer" tone="indigo" />
          <dl className={cn("flex gap-3", containerSize === "narrow" ? "flex-col" : "flex-row gap-6")}>
            <Field label="Segment Size" className="shrink-0">
              {segmentSize !== null ? (
                <span className="inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-sm border border-border">{segmentSize.toLocaleString()}</span>
              ) : (
                <EmptyText />
              )}
            </Field>
            <Field label="Description">
              {customerDescription ? (
                <span className="inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-sm border border-border">{customerDescription}</span>
              ) : (
                <EmptyText />
              )}
            </Field>
          </dl>
        </div>

        {/* ── Row 2: Core Problem + Solutions ── */}
        <div className={cn("grid gap-4 items-start", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-2")}>

          {/* ── Core Problem ── */}
          <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-3 min-w-0">
            <SectionHeader icon={AlertCircle} label="Core Problem" tone="amber" />
            {problem ? (
              <>
                {problem.description ? (
                  <p className="text-md text-foreground/80 leading-relaxed">{problem.description}</p>
                ) : (
                  <EmptyText text="No description" />
                )}
                <dl className="flex flex-col gap-3">
                  <Field label="Customer Segments">
                    <ChipList items={problem.customerSegments} />
                  </Field>
                  <Field label="Context">
                    <ChipList items={problem.contexts} />
                  </Field>
                  <Field label="Jobs to Be Done">
                    <ChipList items={problem.jobsToBeDone} />
                  </Field>
                  <Field label="Problem Types">
                    <ChipList items={problem.problemTypes} />
                  </Field>
                </dl>
              </>
            ) : (
              <EmptyText text="No problem selected" />
            )}
          </div>

          {/* ── Existing Solutions, Shortcomings & Impacts ── */}
          <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-3 min-w-0">
            <SectionHeader icon={GitFork} label="Existing Solutions, Shortcomings & Impacts" tone="purple" />
            {existingSolutions.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {existingSolutions.map((alt) => (
                  <li key={alt.id} className="flex flex-col gap-2 bg-white/60 rounded-lg px-3 py-2.5 border border-border min-w-0">
                    <p className="text-md font-medium text-foreground/90 break-words">{alt.text || <EmptyText text="Unnamed" />}</p>
                    {alt.shortcomings.length > 0 && (
                      <ul className="flex flex-col gap-1.5 pl-2">
                        {alt.shortcomings.map((sc) => {
                          const hasImpact = sc.impact.category || sc.impact.description
                          return (
                            <li key={sc.id} className="flex flex-col gap-0.5 min-w-0">
                              <div className="text-xs text-foreground/70 flex gap-1.5 min-w-0">
                                <span className="text-muted-foreground shrink-0">–</span>
                                <span className="break-words min-w-0">{sc.text || <EmptyText text="Empty" />}</span>
                              </div>
                              {hasImpact && (
                                <div className="text-xs text-foreground/70 flex gap-2 items-baseline pl-3.5 min-w-0">
                                  <BarChart2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                                  {sc.impact.category && <span className="font-medium break-words">{sc.impact.category}</span>}
                                  {sc.impact.description && <span className="break-words min-w-0">{sc.impact.description}</span>}
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
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
          <SectionHeader icon={Target} label="Validation Assessment" tone="emerald" />
          {hasAnyMetric ? (
            <>
              <dl className={cn("grid gap-x-4 gap-y-3", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-2")}>
                <MetricField label="How Many Customers" metric={howManyPeople} />
                <MetricField label="Cost of Switching" metric={costOfSwitching} />
                <MetricField label="How Often" metric={howOften} />
                <MetricField label="Solution Effectiveness" metric={solutionEffectiveness} />
                <MetricField label="How Much Is It Worth" metric={worthToThem} />
                <MetricField label="Competitor Size" metric={competitorSize} />
              </dl>
              {reason && (
                <dl className="border-t pt-3">
                  <Field label="Notes">
                    <p className="text-md text-foreground/80 leading-relaxed">{reason}</p>
                  </Field>
                </dl>
              )}
            </>
          ) : (
            <EmptyText text="No validation data yet. Complete the validation step first." />
          )}

          {/* Verdict banner */}
          {(status === "valid" || status === "invalid" || status === "unsure") && (() => {
            const config = status === "valid"
              ? { bg: "bg-green-50", border: "border-green-200", tile: "bg-green-500", text: "text-green-700", icon: CheckCircle2, label: "Valid" }
              : status === "unsure"
                ? { bg: "bg-orange-50", border: "border-orange-200", tile: "bg-orange-500", text: "text-orange-700", icon: HelpCircle, label: "Unsure" }
                : { bg: "bg-red-50", border: "border-red-200", tile: "bg-red-500", text: "text-red-700", icon: XCircle, label: "Invalid" }
            return (
              <dl className={`rounded-lg border p-4 flex items-center gap-3 ${config.bg} ${config.border}`}>
                <IconTile icon={config.icon} className={config.tile} size="lg" />
                <div className="flex flex-col min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verdict</dt>
                  <dd className={`text-lg font-semibold ${config.text}`}>{config.label}</dd>
                </div>
              </dl>
            )
          })()}
        </div>

        {/* ── Next Steps ── */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold flex items-center gap-2.5 mb-2">
            <IconTile icon={ArrowRight} className="bg-primary" size="sm" /> Next Steps
          </h2>
          <p className="text-md text-muted-foreground mb-4">
            Based on your validation verdict, here is what you can do next.
          </p>

          {status === "valid" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <IconTile icon={CheckCircle2} className="bg-green-500" size="md" />
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
                <IconTile icon={HelpCircle} className="bg-orange-500" size="md" />
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
                <IconTile icon={XCircle} className="bg-red-500" size="md" />
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
                <IconTile icon={HelpCircle} className="bg-muted-foreground/70" size="md" />
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
