"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { Solution } from "@/types/solution"
import {
  Target,
  Wrench,
  TrendingUp,
  Coins,
  Hourglass,
  Sparkles,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CANVAS_DIVIDER,
  CANVAS_ICON_BG,
  Cell,
  Placeholder,
  ScoreCell,
  StatusPill,
} from "./canvas-shared"

/**
 * Visual card grid for a Solution: header (title + status pill + optional
 * actions), description, linked-problem, inspiration, and four scoring
 * cards. Used by the solution canvas page, the solution validation
 * summary, and the "View Solution" dialog so the read-only view is
 * identical everywhere. Every card carries the same mustard icon tile and
 * header rule as the problem canvas so the two canvases read as one family.
 *
 * `fill` switches on the canvas-page layout: the grid stretches to fill
 * the available height and cards scroll internally. Without it, the grid
 * lays out at natural height (suited to summary cards and dialogs).
 */
export function SolutionCanvasCards({
  solution,
  fill = false,
  actions,
}: {
  solution: Solution
  fill?: boolean
  actions?: React.ReactNode
}) {
  const status = solution.validationStatus ?? "unvalidated"
  const linkedProblem = useSelector((s: RootState) =>
    s.problems.problems.find((p) => p.id === solution.problemId),
  )

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
            "lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)] flex-1 lg:min-h-0",
        )}
      >
        <Cell
          icon={FileText}
          label="Description"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          className="sm:col-span-12 lg:col-span-6 lg:row-span-2"
          empty={!solution.description}
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
          icon={Sparkles}
          label="Inspiration"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          className="sm:col-span-6"
          empty={!solution.inspirationSource && !solution.inspirationDetail}
        >
          <div className="flex flex-col gap-1">
            {solution.inspirationSource && (
              <p className="capitalize font-medium">
                {solution.inspirationSource.replace(/_/g, " ")}
              </p>
            )}
            {solution.inspirationDetail && (
              <p className="whitespace-pre-wrap">{solution.inspirationDetail}</p>
            )}
          </div>
        </Cell>

        <ScoreCell
          icon={Wrench}
          label="Feasibility"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          score={solution.feasibility}
          scaleNote="(1 hard, 5 easy)"
          className="sm:col-span-6 lg:col-span-3"
        />
        <ScoreCell
          icon={TrendingUp}
          label="Impact"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          score={solution.impact}
          scaleNote="(1 low, 5 high)"
          className="sm:col-span-6 lg:col-span-3"
        />
        <ScoreCell
          icon={Coins}
          label="Cost"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          score={solution.cost}
          scaleNote="(1 cheap, 5 expensive)"
          className="sm:col-span-6 lg:col-span-3"
        />
        <ScoreCell
          icon={Hourglass}
          label="Time to implement"
          iconBg={CANVAS_ICON_BG}
          divider={CANVAS_DIVIDER}
          score={solution.timeToImplement}
          scaleNote="(1 fast, 5 slow)"
          className="sm:col-span-6 lg:col-span-3"
        />
      </div>
    </div>
  )
}
