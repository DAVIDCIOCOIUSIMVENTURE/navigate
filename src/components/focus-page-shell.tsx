"use client"

import type { ReactNode } from "react"
import { JourneyProgressCard } from "@/components/journey-progress"
import { FOCUS_COLUMN_MAX_HEIGHT_CLASS } from "@/components/problem-flow-shell"
import { useContainerSize } from "@/context/container-size-context"
import type { JourneyStepId } from "@/lib/journey-steps"
import { cn } from "@/lib/utils"

/**
 * The viewport cap for a page shown with the app chrome: the `h-16` header
 * plus the layout's inner padding (`py-6`, `lg:py-8`). Recompute if either
 * changes (see "Page height & internal scrolling" in CLAUDE.md).
 */
const APP_CHROME_MAX_HEIGHT_CLASS = "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]"

/**
 * Layout for a page about one problem or solution (its canvas or its edit
 * page) with a `w-72` left column: the `header` (a `FocusFlowHeader` with the
 * title) above the journey progress rail, with the content beside it fitted
 * to the viewport on wide containers; on narrow ones the header stays on top,
 * the rail becomes a horizontal row and the page scrolls naturally.
 *
 * With the default `chrome="focus"` the header and sidebar are hidden, so the
 * page supplies its own Home and Open menu buttons in the header and the
 * shell adds the page padding the layout would otherwise give it. The project
 * page passes `chrome="app"`: it keeps the header (the sidebar is hidden
 * there), so the layout already pads it and the viewport cap allows for the
 * header.
 *
 * Pass `flex-wrap` to the header so it stacks inside the narrow column.
 * Pages that are not about one problem or solution (Compare solutions) omit
 * `journeyStep` and get the same layout without the rail.
 */
export function FocusPageShell({
  header,
  journeyStep,
  journeyProblemId,
  chrome = "focus",
  children,
}: {
  header: ReactNode
  /** The journey milestone the page belongs to; omit to render no rail. */
  journeyStep?: JourneyStepId
  /** The problem the page is about (a solution's linked problem on solution pages); the rail shows its real progress. */
  journeyProblemId?: number | null
  /** Whether the page renders without the app header and sidebar (`focus`, the default) or inside them (`app`). */
  chrome?: "focus" | "app"
  children: ReactNode
}) {
  const isWide = useContainerSize() === "wide"
  const inApp = chrome === "app"
  const columnMaxHeight = inApp ? APP_CHROME_MAX_HEIGHT_CLASS : FOCUS_COLUMN_MAX_HEIGHT_CLASS

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 gap-3",
          !inApp && "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          isWide ? "flex-row items-stretch overflow-hidden" : "flex-col",
          isWide && (inApp ? APP_CHROME_MAX_HEIGHT_CLASS : "max-h-[100svh]"),
        )}
      >
        {isWide ? (
          <div className={cn("flex w-72 shrink-0 flex-col gap-3 min-h-0 overflow-y-auto", columnMaxHeight)}>
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
