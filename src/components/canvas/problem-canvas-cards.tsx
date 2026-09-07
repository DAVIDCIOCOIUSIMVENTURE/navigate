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
  TrendingUp,
  GitFork,
  Lightbulb,
  ChevronDown,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { computeMarket, formatMoney } from "@/lib/market"
import { DEFAULT_REACHABLE_SHARE } from "@/types/validation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Cell,
  CELL_TONE_CLASSES,
  MetricRow,
  Placeholder,
  StatusPill,
  STATUS_CONFIG,
  type CellTone,
} from "./canvas-shared"

/** Mustard tile behind every icon on the problem canvas cards. */
const CANVAS_ICON_BG = "bg-yellow-600"

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
 *
 * `tone` picks the card surface: `card` (default cream) or `brand`, which
 * paints every card in the cobalt secondary brand colour with white text.
 */
export function ProblemCanvasCards({
  problem,
  fill = false,
  actions,
  tone = "card",
}: {
  problem: Problem
  fill?: boolean
  actions?: React.ReactNode
  tone?: CellTone
}) {
  const router = useRouter()
  const brand = tone === "brand"
  const sectionHeading = cn(
    "text-base font-semibold uppercase tracking-wide pb-1 border-b",
    brand ? "border-white/30" : "border-border/40",
  )
  const status = problem.validationStatus ?? "unvalidated"
  const va = problem.validationAssessment
  const linkedSolutions = useSelector((s: RootState) =>
    s.solutions.solutions.filter((sol) => sol.problemId === problem.id),
  )
  const [solutionsOpen, setSolutionsOpen] = useState(false)

  const currency = va.worthToThem.unit || "GBP"
  const {
    totalMarket, reachableMarket, realisticShare: realisticShareValue,
    reachPct, obtainPct, ready: marketReady,
  } = computeMarket({
    customers: va.howManyPeople.value ?? 0,
    frequency: va.howOften.value ?? 0,
    price: va.worthToThem.value ?? 0,
    reachableShare: va.reachableShare ?? DEFAULT_REACHABLE_SHARE,
    obtainableShare: va.obtainableShare,
  })

  const marketEmpty =
    !va.howManyPeople.level && va.howManyPeople.value == null &&
    !va.howOften.level && va.howOften.value == null &&
    !va.worthToThem.level && va.worthToThem.value == null &&
    !va.competitorSize.level && va.competitorSize.value == null &&
    !va.costOfSwitching.level && va.costOfSwitching.value == null &&
    !va.solutionEffectiveness.level && va.solutionEffectiveness.value == null

  return (
    <div className={cn("canvas-print-root flex flex-col gap-3 w-full", fill && "flex-1 min-h-0")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <p className="text-lg font-semibold leading-tight shrink-0">Problem title:</p>
            <h1 className="text-lg font-semibold leading-tight truncate">
              {problem.title || "Untitled problem"}
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
            "lg:grid-rows-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.1fr)] flex-1 lg:min-h-0",
        )}
      >
        <Cell
          icon={FileText}
          label="Description"
          iconBg={CANVAS_ICON_BG}
          tone={tone}
          className="sm:col-span-12 lg:col-span-3"
          empty={!problem.description}
        >
          {problem.description ? (
            <p className="whitespace-pre-wrap">{problem.description}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell
          icon={Users}
          label="Customer"
          iconBg={CANVAS_ICON_BG}
          tone={tone}
          className="sm:col-span-6 lg:col-span-3"
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
          iconBg={CANVAS_ICON_BG}
          tone={tone}
          className="sm:col-span-6 lg:col-span-3"
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
          iconBg={CANVAS_ICON_BG}
          tone={tone}
          className="sm:col-span-12 lg:col-span-3"
          empty={problem.problems.length === 0}
        >
          <DimensionList columnId="problems" ids={problem.problems} />
        </Cell>

        <Cell
          icon={TrendingUp}
          label="Market opportunity"
          iconBg={CANVAS_ICON_BG}
          tone={tone}
          className="sm:col-span-12"
          empty={marketEmpty}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4">
            <div className="flex flex-col gap-1">
              <p className={sectionHeading}>Your estimates</p>
              <MetricRow label="People affected" metric={va.howManyPeople} />
              <MetricRow label="How often" metric={va.howOften} />
              <MetricRow label="Price per occurrence" metric={va.worthToThem} />
              <div className="flex justify-between gap-2">
                <span>Reachable share</span>
                <span className="font-medium">{reachPct}%</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Realistic share</span>
                <span className="font-medium">{obtainPct}%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className={sectionHeading}>Competition</p>
              <MetricRow label="Competitor size" metric={va.competitorSize} />
              <MetricRow label="Cost of switching" metric={va.costOfSwitching} />
              <MetricRow label="Effectiveness" metric={va.solutionEffectiveness} />
            </div>
            <div className="flex flex-col gap-1">
              <p className={sectionHeading}>Market size</p>
              <div className="flex justify-between gap-2">
                <span>Total market</span>
                <span className="font-medium">{marketReady ? formatMoney(totalMarket, { currency, compact: true }) : "Not captured"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Reachable market</span>
                <span className="font-medium">{marketReady ? formatMoney(reachableMarket, { currency, compact: true }) : "Not captured"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Realistic share of the market</span>
                <span className="font-medium">{marketReady ? formatMoney(realisticShareValue, { currency, compact: true }) : "Not captured"}</span>
              </div>
            </div>
          </div>
        </Cell>

        <Cell
          icon={GitFork}
          label="Existing solutions"
          iconBg={CANVAS_ICON_BG}
          tone={tone}
          className="sm:col-span-12"
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

      </div>

      <Collapsible
        open={solutionsOpen}
        onOpenChange={setSolutionsOpen}
        className={cn("rounded-xl shrink-0", CELL_TONE_CLASSES[tone])}
      >
        <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left">
          <span
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-lg shrink-0 text-white",
              CANVAS_ICON_BG,
            )}
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
                      onClick={() => router.push(`/solutions/${sol.id}/edit`)}
                      className={cn(
                        "flex items-center gap-2 w-full text-left rounded-md px-2 py-1 -mx-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        brand ? "hover:bg-white/10" : "hover:bg-muted/60",
                      )}
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
