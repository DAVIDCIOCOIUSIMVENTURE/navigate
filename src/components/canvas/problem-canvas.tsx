"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { Problem } from "@/store/problems-model"
import { Button } from "@/components/ui/button"
import { resolveDimensionLabel } from "@/lib/dimension-labels"
import {
  Target,
  Users,
  MapPin,
  TriangleAlert,
  Heart,
  Repeat,
  DollarSign,
  Sparkles,
  Swords,
  GitFork,
  Lightbulb,
  ShieldCheck,
  Printer,
  Pencil,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Circle,
  Clock,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<Problem["validationStatus"], { label: string; className: string; icon: LucideIcon }> = {
  valid: { label: "Valid", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  invalid: { label: "Invalid", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  unsure: { label: "Unsure", className: "bg-amber-100 text-amber-800 border-amber-200", icon: HelpCircle },
  in_progress: { label: "In progress", className: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  unvalidated: { label: "Unvalidated", className: "bg-gray-100 text-gray-800 border-gray-200", icon: Circle },
}

function Cell({
  icon: Icon,
  label,
  iconBg = "bg-tertiary",
  className,
  children,
  empty,
}: {
  icon: LucideIcon
  label: string
  iconBg?: string
  className?: string
  empty?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col rounded-lg border bg-card overflow-hidden", className)}>
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        <span className={cn("flex items-center justify-center h-6 w-6 rounded text-white shrink-0", iconBg)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-base font-semibold leading-none">{label}</h3>
      </div>
      <div className={cn("p-3 flex-1 text-base", empty && "italic opacity-60")}>
        {children}
      </div>
    </div>
  )
}

function Placeholder() {
  return <span>Not yet captured</span>
}

function DimensionList({ columnId, ids }: { columnId: string; ids: string[] }) {
  const customByColumn = useSelector((s: RootState) => s.customDimensionItems.byColumn)
  const selfDiscoveryItems = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  if (!ids || ids.length === 0) return <Placeholder />
  const labels = ids.map((id) => resolveDimensionLabel(columnId, id, customByColumn, selfDiscoveryItems))
  return (
    <ul className="flex flex-col gap-1">
      {labels.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  )
}

function MetricRow({ label, metric }: { label: string; metric: { value: number | null; unit: string; level: string } }) {
  const hasValue = metric.value !== null && metric.value !== undefined
  const hasLevel = metric.level && metric.level !== ""
  if (!hasValue && !hasLevel) {
    return (
      <div className="flex justify-between gap-2 italic opacity-60">
        <span>{label}</span><span>-</span>
      </div>
    )
  }
  const right = [
    hasValue ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}` : null,
    hasLevel ? metric.level : null,
  ].filter(Boolean).join(" / ")
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="font-medium capitalize">{right}</span>
    </div>
  )
}

export function ProblemCanvas({ problem, editHref }: { problem: Problem; editHref: string }) {
  const router = useRouter()
  const status = problem.validationStatus ?? "unvalidated"
  const statusConfig = STATUS_CONFIG[status]
  const va = problem.validationAssessment
  const linkedSolutions = useSelector((s: RootState) =>
    s.solutions.solutions.filter((sol) => sol.problemId === problem.id),
  )

  useEffect(() => {
    return () => {
      document.body.classList.remove("canvas-printing")
    }
  }, [])

  const handlePrint = () => {
    document.body.classList.add("canvas-printing")
    setTimeout(() => {
      window.print()
      document.body.classList.remove("canvas-printing")
    }, 50)
  }

  return (
    <div className="canvas-print-root flex flex-col gap-4 w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-tertiary text-white shrink-0">
            <Target className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-base opacity-70">Problem canvas #{problem.id}</p>
            <h1 className="text-2xl font-semibold leading-tight">
              {problem.description || "Untitled problem"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-base font-medium px-3 py-1.5 rounded-full border",
              statusConfig.className,
            )}
          >
            <statusConfig.icon className="h-4 w-4" />
            {statusConfig.label}
          </span>
          <div className="flex items-center gap-2" data-canvas-no-print>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => router.push(editHref)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 auto-rows-fr">
        <Cell icon={Users} label="Customer" iconBg="bg-green-800" className="col-span-4 row-span-2" empty={problem.customers.length === 0 && !problem.customerDescription && !problem.segmentSize}>
          <div className="flex flex-col gap-2">
            <DimensionList columnId="customers" ids={problem.customers} />
            {problem.customerDescription && (
              <p className="opacity-80 whitespace-pre-wrap">{problem.customerDescription}</p>
            )}
            {problem.segmentSize != null && (
              <p className="text-base opacity-70">Segment size: {problem.segmentSize.toLocaleString()}</p>
            )}
          </div>
        </Cell>

        <Cell icon={MapPin} label="Context" iconBg="bg-blue-900" className="col-span-4 row-span-2" empty={problem.contexts.length === 0 && !problem.contextWhen}>
          <div className="flex flex-col gap-2">
            <DimensionList columnId="contexts" ids={problem.contexts} />
            {problem.contextWhen && (
              <p className="opacity-80 whitespace-pre-wrap">{problem.contextWhen}</p>
            )}
          </div>
        </Cell>

        <Cell icon={TriangleAlert} label="Problem types" iconBg="bg-red-800" className="col-span-4 row-span-2" empty={problem.problems.length === 0}>
          <DimensionList columnId="problems" ids={problem.problems} />
        </Cell>

        <Cell icon={Heart} label="Emotional impact" iconBg="bg-rose-800" className="col-span-3" empty={!va.emotionalImpact.level && va.emotionalImpact.value == null}>
          <MetricRow label="Severity" metric={va.emotionalImpact} />
        </Cell>

        <Cell icon={Repeat} label="Frequency" iconBg="bg-teal-700" className="col-span-3" empty={!va.howOften.level && va.howOften.value == null}>
          <MetricRow label="How often" metric={va.howOften} />
        </Cell>

        <Cell icon={DollarSign} label="Worth" iconBg="bg-yellow-600" className="col-span-3" empty={!va.worthToThem.level && va.worthToThem.value == null}>
          <div className="flex flex-col gap-1">
            <MetricRow label="Per person" metric={va.worthToThem} />
            <div className="flex justify-between gap-2">
              <span>Obtainable share</span>
              <span className="font-medium">{va.obtainableShare}%</span>
            </div>
          </div>
        </Cell>

        <Cell icon={Sparkles} label="Market reach" iconBg="bg-emerald-800" className="col-span-3" empty={!va.howManyPeople.level && va.howManyPeople.value == null}>
          <MetricRow label="People affected" metric={va.howManyPeople} />
        </Cell>

        <Cell icon={GitFork} label="Existing solutions" iconBg="bg-indigo-800" className="col-span-6" empty={problem.existingSolutions.length === 0}>
          <ul className="flex flex-col gap-2">
            {problem.existingSolutions.map((s) => (
              <li key={s.id}>
                <p className="font-medium">{s.text || "Untitled solution"}</p>
                {s.shortcomings.length > 0 && (
                  <ul className="list-disc list-inside opacity-80">
                    {s.shortcomings.map((sc) => (
                      <li key={sc.id}>{sc.text}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Cell>

        <Cell icon={Swords} label="Competition" iconBg="bg-violet-800" className="col-span-3" empty={!va.competitorSize.level && va.competitorSize.value == null}>
          <div className="flex flex-col gap-1">
            <MetricRow label="Competitor size" metric={va.competitorSize} />
            <MetricRow label="Cost of switching" metric={va.costOfSwitching} />
            <MetricRow label="Effectiveness" metric={va.solutionEffectiveness} />
          </div>
        </Cell>

        <Cell icon={ShieldCheck} label="Verdict & reasoning" iconBg="bg-tertiary" className="col-span-3" empty={!problem.validationReason}>
          {problem.validationReason ? (
            <p className="whitespace-pre-wrap">{problem.validationReason}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell icon={Lightbulb} label="Solutions" iconBg="bg-primary" className="col-span-12" empty={linkedSolutions.length === 0}>
          {linkedSolutions.length === 0 ? (
            <Placeholder />
          ) : (
            <ul className="flex flex-col gap-1.5">
              {linkedSolutions.map((sol) => {
                const sStatus = sol.validationStatus ?? "unvalidated"
                const sCfg = STATUS_CONFIG[sStatus]
                return (
                  <li key={sol.id} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-base px-2 py-0.5 rounded-full border shrink-0",
                        sCfg.className,
                      )}
                    >
                      <sCfg.icon className="h-3.5 w-3.5" />
                      {sCfg.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => router.push(`/solutions/${sol.id}/summary`)}
                      className="text-left underline-offset-2 hover:underline truncate"
                      data-canvas-no-print
                    >
                      {sol.title || `Solution #${sol.id}`}
                    </button>
                    <span className="hidden print:inline truncate">
                      {sol.title || `Solution #${sol.id}`}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Cell>
      </div>
    </div>
  )
}
