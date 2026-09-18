"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { inspirationSourceLabel, type Solution } from "@/types/solution"
import { Target, Gauge, Lightbulb, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { TrafficLightPill } from "@/components/traffic-light"
import {
  COST_CONTENT,
  FEASIBILITY_CONTENT,
  IMPACT_CONTENT,
  TIME_CONTENT,
} from "@/components/solution-strategies/metric-content"
import type { MetricContent } from "@/components/solution-strategies/metric-strategy"
import { DescriptionItem, DescriptionList } from "@/components/ui/description-list"
import {
  CANVAS_DIVIDER,
  CANVAS_ICON_BG,
  Cell,
  Placeholder,
  StatusPill,
} from "./canvas-shared"
import { SolutionCardDialog, type SolutionCardId } from "./solution-card-dialog"
import { useProjectIdForSolution } from "@/hooks/use-projects"

/** The four validation metrics, each read out as "name: level". */
const METRICS: { label: string; scale: MetricContent["scale"]; read: (s: Solution) => number | null }[] = [
  { label: "Feasibility", scale: FEASIBILITY_CONTENT.scale, read: (s) => s.feasibility },
  { label: "Impact", scale: IMPACT_CONTENT.scale, read: (s) => s.impact },
  { label: "Cost", scale: COST_CONTENT.scale, read: (s) => s.cost },
  { label: "Time to implement", scale: TIME_CONTENT.scale, read: (s) => s.timeToImplement },
]

/** The level word a score stands for, e.g. 4 on feasibility reads "Achievable". */
function metricLevel(score: number | null, scale: MetricContent["scale"]) {
  if (score == null) return null
  return scale.find((s) => s.score === score)?.label ?? null
}

/**
 * Visual card grid for a Solution: header (title + status pill + optional
 * actions), description, linked-problem, method used, and one Metrics card
 * listing the four validation scores as "name: level". Used by the solution
 * canvas page, the solution validation summary, and the "View Solution"
 * dialog so the read-only view is identical everywhere. Every card carries
 * the same mustard icon tile and header rule as the problem canvas so the
 * two canvases read as one family.
 *
 * `fill` switches on the canvas-page layout: the grid stretches to fill
 * the available height and cards scroll internally. Without it, the grid
 * lays out at natural height (suited to summary cards and dialogs).
 *
 * `editable` turns every card title into a button that opens that card's edit
 * dialog. The canvas page switches it on; the read-only views (the View
 * Solution dialog, the validation review step) leave it off.
 */
export function SolutionCanvasCards({
  solution,
  fill = false,
  actions,
  editable = false,
}: {
  solution: Solution
  fill?: boolean
  actions?: React.ReactNode
  editable?: boolean
}) {
  const status = solution.validationStatus ?? "unvalidated"
  const linkedProblem = useSelector((s: RootState) =>
    s.problems.problems.find((p) => p.id === solution.problemId),
  )
  const projectId = useProjectIdForSolution(solution.id)
  const [editing, setEditing] = useState<SolutionCardId | null>(null)
  const edit = (card: SolutionCardId) => (editable ? () => setEditing(card) : undefined)

  return (
    <div className={cn("canvas-print-root flex flex-col gap-3 w-full", fill && "flex-1 min-h-0")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <p className="text-lg font-semibold leading-tight shrink-0">Solution title:</p>
            <h1 className="text-lg font-semibold leading-tight truncate">
              {solution.title || "Untitled solution"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TrafficLightPill light={solution.trafficLight} />
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
            "lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto] flex-1 lg:min-h-0",
        )}
      >
        <Cell
          icon={FileText}
          label="Description"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          className="sm:col-span-12 lg:col-span-6 lg:row-span-2"
          empty={!solution.description}
          onEdit={edit("description")}
        >
          {solution.description ? (
            <p className="whitespace-pre-wrap">{solution.description}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell
          icon={Target}
          label="Linked problem"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          className="sm:col-span-6"
          empty={!linkedProblem}
          onEdit={edit("linked-problem")}
        >
          {linkedProblem ? (
            <div className="flex flex-col gap-1">
              <p className="font-medium">{linkedProblem.title || `Problem #${linkedProblem.id}`}</p>
              {linkedProblem.description && (
                <p className="whitespace-pre-wrap">{linkedProblem.description}</p>
              )}
            </div>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell
          icon={Lightbulb}
          label="Method used"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          className="sm:col-span-6"
          empty={!solution.inspirationSource && !solution.inspirationDetail}
          onEdit={edit("method")}
        >
          <div className="flex flex-col gap-1">
            {solution.inspirationSource && (
              <p className="font-medium">{inspirationSourceLabel(solution.inspirationSource)}</p>
            )}
            {solution.inspirationDetail && (
              <p className="whitespace-pre-wrap">{solution.inspirationDetail}</p>
            )}
          </div>
        </Cell>

        <Cell
          icon={Gauge}
          label="Metrics"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          className="sm:col-span-12"
          empty={METRICS.every(({ read }) => read(solution) == null)}
          onEdit={edit("metrics")}
        >
          <DescriptionList columns={2}>
            {METRICS.map(({ label, scale, read }) => {
              const level = metricLevel(read(solution), scale)
              return (
                <DescriptionItem key={label} term={label} empty={!level}>
                  {level ?? "Not scored"}
                </DescriptionItem>
              )
            })}
          </DescriptionList>
        </Cell>
      </div>

      {editable && (
        <SolutionCardDialog
          card={editing}
          solution={solution}
          projectId={projectId}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
