"use client"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
} from "lucide-react"
import type { ValidationStatus, ExistingSolutionItem, DecisionLevel, ValidationAssessment, ValidationMetric } from "@/types/validation"
import { useDimensionLabels } from "@/lib/dimension-labels"

/* ------------------------------------------------------------------ */
/*  Normalised data shape                                              */
/* ------------------------------------------------------------------ */

export type ProblemSummaryTag = { label: string; columnId: string; ids: string[] }

export type ProblemSummaryData = {
  /** Main problem text / description */
  text: string
  /** Dimension classification tags (customer segments, contexts, etc.) */
  tags?: ProblemSummaryTag[]
  context?: string
  existingSolutions?: ExistingSolutionItem[]
  validationStatus: ValidationStatus
  reason?: string
  /** Decision-factor levels (idea-scoped verdict) */
  verdict?: {
    timeLevel?: DecisionLevel
    costLevel?: DecisionLevel
    returnLevel?: DecisionLevel
    marketLevel?: DecisionLevel
  }
  /** Validation assessment metrics (standalone flow) */
  assessment?: ValidationAssessment
}

interface ProblemSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ProblemSummaryData | null
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<ValidationStatus, { label: string; icon: React.ElementType; className: string }> = {
  unvalidated: { label: "Not validated", icon: Clock,          className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In progress",  icon: Clock,          className: "bg-primary/15 text-primary" },
  valid:       { label: "Valid",         icon: CheckCircle2,   className: "bg-success/15 text-success" },
  invalid:     { label: "Invalid",       icon: XCircle,        className: "bg-destructive/15 text-destructive" },
  unsure:      { label: "Unsure",        icon: AlertTriangle,  className: "bg-tertiary/20 text-tertiary" },
}

function StatusBadge({ status }: { status: ValidationStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unvalidated
  const Icon = cfg.icon
  return (
    <Badge variant="secondary" className={`gap-1.5 ${cfg.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </Badge>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide mb-1.5">{title}</p>
      {children}
    </div>
  )
}

function TagValues({ columnId, ids }: { columnId: string; ids: string[] }) {
  const labels = useDimensionLabels(columnId, ids)
  return <p className="text-sm">{labels.join(", ")}</p>
}

function formatLevel(level: DecisionLevel | undefined): string | null {
  if (!level) return null
  return level.charAt(0).toUpperCase() + level.slice(1)
}

/* ------------------------------------------------------------------ */
/*  Assessment section                                                 */
/* ------------------------------------------------------------------ */

function formatMetricValue(value: number | null, unit: string): string | null {
  if (value === null && !unit) return null
  const parts: string[] = []
  if (value !== null) parts.push(value.toLocaleString())
  if (unit) parts.push(unit)
  return parts.join(" ") || null
}

type MetricKey = {
  [K in keyof ValidationAssessment]: ValidationAssessment[K] extends ValidationMetric ? K : never
}[keyof ValidationAssessment]

const ASSESSMENT_FIELDS: { key: MetricKey; label: string }[] = [
  { key: "howManyPeople", label: "How many customers" },
  { key: "howOften", label: "How often" },
  { key: "worthToThem", label: "What they would pay" },
  { key: "costOfSwitching", label: "Cost of switching" },
  { key: "solutionEffectiveness", label: "Solution effectiveness" },
  { key: "competitorSize", label: "Competitor size" },
]

function AssessmentSection({ assessment }: { assessment: ValidationAssessment }) {
  const entries = ASSESSMENT_FIELDS
    .map(({ key, label }) => {
      const metric = assessment[key]
      const valueText = formatMetricValue(metric.value, metric.unit)
      const levelText = formatLevel(metric.level)
      if (!valueText && !levelText) return null
      return { label, valueText, levelText }
    })
    .filter(Boolean) as { label: string; valueText: string | null; levelText: string | null }[]

  const reachPct = Math.max(0, Math.min(100, assessment.reachableShare ?? 30))
  const obtainPct = Math.max(0, Math.min(100, assessment.obtainableShare))
  const showReach = reachPct !== 30
  const showObtain = obtainPct !== 10

  if (entries.length === 0 && !showReach && !showObtain) return null

  return (
    <>
      <Separator />
      <Section title="Validation Assessment">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map((entry) => (
            <div key={entry.label} className="text-base">
              <p>{entry.label}</p>
              <p className="font-medium">
                {[entry.valueText, entry.levelText].filter(Boolean).join(", ")}
              </p>
            </div>
          ))}
          {showReach && (
            <div className="text-base">
              <p>Reachable share of the market</p>
              <p className="font-medium">{reachPct}%</p>
            </div>
          )}
          {showObtain && (
            <div className="text-base">
              <p>Realistic share you can win</p>
              <p className="font-medium">{obtainPct}%</p>
            </div>
          )}
        </div>
      </Section>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProblemSummaryDialog({ open, onOpenChange, data }: ProblemSummaryDialogProps) {
  if (!data) return null

  const hasTags = data.tags?.some((t) => t.ids.length > 0)

  const hasExistingSolutions = (data.existingSolutions?.length ?? 0) > 0
  const hasVerdict = data.verdict && Object.values(data.verdict).some((v) => v)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Problem Summary</DialogTitle>
          <DialogDescription className="sr-only">Overview of the problem and its validation status</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Two-column header: tags left, description + status right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left column: tags */}
            <div className="flex flex-col gap-3">
              {hasTags && data.tags!.filter((t) => t.ids.length > 0).map((tag) => (
                <Section key={tag.label} title={tag.label}>
                  <TagValues columnId={tag.columnId} ids={tag.ids} />
                </Section>
              ))}
            </div>

            {/* Right column: description + status */}
            <div className="flex flex-col gap-3">
              <Section title="Problem Description">
                <p className="text-sm leading-relaxed">{data.text}</p>
              </Section>
              <Section title="Validation Status">
                <StatusBadge status={data.validationStatus} />
              </Section>
            </div>
          </div>

          {/* Context */}
          {data.context && (
            <>
              <Separator />
              <Section title="Context">
                <p className="text-sm">{data.context}</p>
              </Section>
            </>
          )}

          {/* Existing Solutions & Shortcomings */}
          {hasExistingSolutions && (
            <>
              <Separator />
              <Section title="Existing Solutions">
                <ul className="space-y-3">
                  {data.existingSolutions!.map((sol) => (
                    <li key={sol.id} className="text-sm">
                      <p className="font-medium">{sol.text}</p>
                      {sol.shortcomings.length > 0 && (
                        <ul className="mt-1 ml-4 space-y-1 text-muted-foreground">
                          {sol.shortcomings.map((sc) => (
                            <li key={sc.id} className="flex gap-1.5">
                              <span className="shrink-0">&bull;</span>
                              <span>{sc.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          )}

          {/* Verdict */}
          {hasVerdict && (
            <>
              <Separator />
              <Section title="Verdict">
                <div className="grid grid-cols-2 gap-2">
                  {data.verdict!.timeLevel && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Time to solve:</span>{" "}
                      <span className="font-medium">{formatLevel(data.verdict!.timeLevel)}</span>
                    </div>
                  )}
                  {data.verdict!.costLevel && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Cost to solve:</span>{" "}
                      <span className="font-medium">{formatLevel(data.verdict!.costLevel)}</span>
                    </div>
                  )}
                  {data.verdict!.returnLevel && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Expected return:</span>{" "}
                      <span className="font-medium">{formatLevel(data.verdict!.returnLevel)}</span>
                    </div>
                  )}
                  {data.verdict!.marketLevel && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Market size:</span>{" "}
                      <span className="font-medium">{formatLevel(data.verdict!.marketLevel)}</span>
                    </div>
                  )}
                </div>
              </Section>
            </>
          )}

          {/* Validation Assessment (standalone flow) */}
          {data.assessment && <AssessmentSection assessment={data.assessment} />}

          {/* Reason / Notes */}
          {data.reason && (
            <>
              <Separator />
              <Section title="Notes">
                <p className="text-sm">{data.reason}</p>
              </Section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
