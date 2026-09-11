"use client"

import type { ReactNode } from "react"
import { JourneyProgressCard } from "@/components/journey-progress"
import { FOCUS_COLUMN_MAX_HEIGHT_CLASS } from "@/components/problem-flow-shell"
import { useContainerSize } from "@/context/container-size-context"
import type { JourneyStepId } from "@/lib/journey-steps"
import { cn } from "@/lib/utils"

/**
 * Layout for a focus page about one problem or solution (its canvas or its
 * edit page). Like the Identify hubs, the header and sidebar are hidden, so
 * the page supplies its own `header` (a `FocusFlowHeader` with Back, the
 * top-bar toggle and the title). On wide containers that header sits in a
 * `w-72` left column above the journey progress rail, with the content beside
 * it fitted to the viewport; on narrow ones the header stays on top, the rail
 * becomes a horizontal row and the page scrolls naturally.
 *
 * Pass `flex-wrap` to the header so it stacks inside the narrow column.
 * Pages that are not about one problem or solution (Compare solutions) omit
 * `journeyStep` and get the same layout without the rail.
 */
export function FocusPageShell({
  header,
  journeyStep,
  journeyProblemId,
  children,
}: {
  header: ReactNode
  /** The journey milestone the page belongs to; omit to render no rail. */
  journeyStep?: JourneyStepId
  /** The problem the page is about (a solution's linked problem on solution pages); the rail shows its real progress. */
  journeyProblemId?: number | null
  children: ReactNode
}) {
  const isWide = useContainerSize() === "wide"

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 gap-3",
          "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          isWide ? "flex-row items-stretch overflow-hidden max-h-[100svh]" : "flex-col",
        )}
      >
        {isWide ? (
          <div className={cn("flex w-72 shrink-0 flex-col gap-3 min-h-0 overflow-y-auto", FOCUS_COLUMN_MAX_HEIGHT_CLASS)}>
            {header}
            {journeyStep && <JourneyProgressCard activeId={journeyStep} problemId={journeyProblemId} />}
          </div>
        ) : (
          <>
            {header}
            {journeyStep && (
              <JourneyProgressCard activeId={journeyStep} problemId={journeyProblemId} orientation="horizontal" />
            )}
          </>
        )}

        <div className="flex flex-1 min-w-0 min-h-0 flex-col">{children}</div>
      </div>
    </div>
  )
}
