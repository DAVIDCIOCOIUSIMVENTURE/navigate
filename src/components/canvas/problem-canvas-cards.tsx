"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { Problem } from "@/store/problems-model"
import { resolveDimensionLabel } from "@/lib/dimension-labels"
import {
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
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Cell,
  MetricRow,
  Placeholder,
  StatusPill,
  STATUS_CONFIG,
} from "./canvas-shared"

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

/**
 * Visual card grid for a Problem: header (description + status pill +
 * optional actions slot), 9-card grid, and a collapsible linked-solutions
 * list. Used by the problem canvas page, the problem validation summary,
 * and the "View Problem" dialog so the read-only view is identical
 * everywhere.
 *
 * `fill` switches on the canvas-page layout: the grid stretches to fill
 * the available height and cards scroll internally. Without it, the grid
 * lays out at natural height (suited to summary cards and dialogs).
 */
export function ProblemCanvasCards({
  problem,
  fill = false,
  actions,
}: {
  problem: Problem
  fill?: boolean
  actions?: React.ReactNode
}) {
  const router = useRouter()
  const status = problem.validationStatus ?? "unvalidated"
  const va = problem.validationAssessment
  const linkedSolutions = useSelector((s: RootState) =>
    s.solutions.solutions.filter((sol) => sol.problemId === problem.id),
  )
  const [solutionsOpen, setSolutionsOpen] = useState(false)

  return (
    <div className={cn("canvas-print-root flex flex-col gap-3 w-full", fill && "flex-1 min-h-0")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <p className="text-lg font-semibold leading-tight shrink-0">Problem description:</p>
            <h1 className="text-lg font-semibold leading-tight truncate">
              {problem.description || "Untitled problem"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusPill status={status} />
          {actions && (
            <div className="flex items-center gap-2" data-canvas-no-print>
              {actions}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-12 gap-3",
          fill &&
            "lg:grid-rows-[minmax(0,1.2fr)_minmax(0,0.95fr)_minmax(0,1.1fr)] flex-1 lg:min-h-0",
        )}
      >
        <Cell
          icon={Users}
          label="Customer"
          iconBg="bg-tertiary"
          className="sm:col-span-6 lg:col-span-4"
          empty={problem.customers.length === 0 && !problem.customerDescription && !problem.segmentSize}
        >
          <div className="flex flex-col gap-2">
            <DimensionList columnId="customers" ids={problem.customers} />
            {problem.customerDescription && (
              <p className="whitespace-pre-wrap">{problem.customerDescription}</p>
            )}
            {problem.segmentSize != null && (
              <p className="text-base">Segment size: {problem.segmentSize.toLocaleString()}</p>
            )}
          </div>
        </Cell>

        <Cell
          icon={MapPin}
          label="Context"
          iconBg="bg-tertiary"
          className="sm:col-span-6 lg:col-span-4"
          empty={problem.contexts.length === 0 && !problem.contextWhen}
        >
          <div className="flex flex-col gap-2">
            <DimensionList columnId="contexts" ids={problem.contexts} />
            {problem.contextWhen && (
              <p className="whitespace-pre-wrap">{problem.contextWhen}</p>
            )}
          </div>
        </Cell>

        <Cell
          icon={TriangleAlert}
          label="Problem types"
          iconBg="bg-tertiary"
          className="sm:col-span-12 lg:col-span-4"
          empty={problem.problems.length === 0}
        >
          <DimensionList columnId="problems" ids={problem.problems} />
        </Cell>

        <Cell
          icon={Heart}
          label="Emotional impact"
          iconBg="bg-secondary-brand"
          className="sm:col-span-6 lg:col-span-3"
          empty={!va.emotionalImpact.level && va.emotionalImpact.value == null}
        >
          <MetricRow label="Severity" metric={va.emotionalImpact} />
        </Cell>

        <Cell
          icon={Repeat}
          label="Frequency"
          iconBg="bg-secondary-brand"
          className="sm:col-span-6 lg:col-span-3"
          empty={!va.howOften.level && va.howOften.value == null}
        >
          <MetricRow label="How often" metric={va.howOften} />
        </Cell>

        <Cell
          icon={DollarSign}
          label="Worth"
          iconBg="bg-secondary-brand"
          className="sm:col-span-6 lg:col-span-3"
          empty={!va.worthToThem.level && va.worthToThem.value == null}
        >
          <div className="flex flex-col gap-1">
            <MetricRow label="Per person" metric={va.worthToThem} />
            <div className="flex justify-between gap-2">
              <span>Obtainable share</span>
              <span className="font-medium">{va.obtainableShare}%</span>
            </div>
          </div>
        </Cell>

        <Cell
          icon={Sparkles}
          label="Market reach"
          iconBg="bg-secondary-brand"
          className="sm:col-span-6 lg:col-span-3"
          empty={!va.howManyPeople.level && va.howManyPeople.value == null}
        >
          <MetricRow label="People affected" metric={va.howManyPeople} />
        </Cell>

        <Cell
          icon={GitFork}
          label="Existing solutions"
          iconBg="bg-secondary-brand"
          className="sm:col-span-12 lg:col-span-8"
          empty={problem.existingSolutions.length === 0}
        >
          <ul className="flex flex-col gap-2">
            {problem.existingSolutions.map((s) => (
              <li key={s.id}>
                <p className="font-medium">{s.text || "Untitled solution"}</p>
                {s.shortcomings.length > 0 && (
                  <ul className="list-disc list-inside">
                    {s.shortcomings.map((sc) => (
                      <li key={sc.id}>{sc.text}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Cell>

        <Cell
          icon={Swords}
          label="Competition"
          iconBg="bg-secondary-brand"
          className="sm:col-span-12 lg:col-span-4"
          empty={!va.competitorSize.level && va.competitorSize.value == null}
        >
          <div className="flex flex-col gap-1">
            <MetricRow label="Competitor size" metric={va.competitorSize} />
            <MetricRow label="Cost of switching" metric={va.costOfSwitching} />
            <MetricRow label="Effectiveness" metric={va.solutionEffectiveness} />
          </div>
        </Cell>
      </div>

      <Collapsible
        open={solutionsOpen}
        onOpenChange={setSolutionsOpen}
        className="rounded-xl border bg-card shadow-sm shrink-0"
      >
        <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left">
          <span
            className="flex items-center justify-center h-7 w-7 rounded-lg shrink-0 text-white bg-primary"
            aria-hidden="true"
          >
            <Lightbulb className="h-3.5 w-3.5" />
          </span>
          <h3 className="flex-1 font-semibold text-base">Solutions</h3>
          <span className="text-base">{linkedSolutions.length}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              solutionsOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 text-base">
          {linkedSolutions.length === 0 ? (
            <span className="italic opacity-60">Not yet captured</span>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {linkedSolutions.map((sol) => {
                const sStatus = sol.validationStatus ?? "unvalidated"
                const sCfg = STATUS_CONFIG[sStatus]
                return (
                  <li key={sol.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/solutions/${sol.id}/canvas`)}
                      className="flex items-center gap-2 w-full text-left rounded-md px-2 py-1 -mx-2 hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-canvas-no-print
                    >
                      <StatusPill status={sStatus} size="sm" />
                      <span className="truncate">
                        {sol.title || `Solution #${sol.id}`}
                      </span>
                    </button>
                    <span className="hidden print:flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-full border shrink-0",
                          sCfg.className,
                        )}
                      >
                        <sCfg.icon className="h-3 w-3" />
                        {sCfg.label}
                      </span>
                      <span className="truncate">
                        {sol.title || `Solution #${sol.id}`}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
