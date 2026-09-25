"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { FocusChromeButtons } from "@/components/focus-chrome-buttons"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { JourneyProgressCard } from "@/components/journey-progress"
import { CardSectionTitle } from "@/components/section-title"
import { FOCUS_COLUMN_MAX_HEIGHT_CLASS, FOCUS_COLUMN_WIDTH_CLASS } from "@/components/problem-flow-shell"
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
 * Layout for a page about one project, problem or solution (the project page,
 * a canvas or an edit page) with the left column every focus flow shares
 * (`FOCUS_COLUMN_WIDTH_CLASS`). These pages have no
 * stepper, so on wide containers the title (with any `actions` at the right
 * of its row, such as the project page's Settings button) sits at the head of
 * the journey rail card,
 * with the content beside it fitted to the viewport; on narrow ones the title
 * stays in a header row on top, the rail becomes a horizontal row and the
 * page scrolls naturally.
 *
 * With the default `chrome="focus"` the header and sidebar are hidden, so the
 * column starts with the page's own Home and Open menu buttons and the shell
 * adds the page padding the layout would otherwise give it. The project page
 * passes `chrome="app"`: it keeps the header (the sidebar is hidden there),
 * so the column starts straight with the card, the layout already pads it and
 * the viewport cap allows for the header.
 *
 * Pages that are not about one problem or solution omit `journeyStep` and get
 * the title in a card of its own with no rail.
 */
export function FocusPageShell({
  title,
  icon,
  actions,
  journeyStep,
  journeyProblemId,
  chrome = "focus",
  children,
}: {
  title: string
  icon: LucideIcon
  /** Icon buttons that belong to the page's title, drawn at the right of its row (the project page's Settings button). */
  actions?: ReactNode
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

  const cardTitle = (
    <CardSectionTitle title={title} icon={icon}>
      {actions}
    </CardSectionTitle>
  )

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
          <div className={cn("flex shrink-0 flex-col gap-3 min-h-0 overflow-y-auto", FOCUS_COLUMN_WIDTH_CLASS, columnMaxHeight)}>
            {!inApp && <FocusChromeButtons />}
            {journeyStep ? (
              <JourneyProgressCard activeId={journeyStep} problemId={journeyProblemId} header={cardTitle} />
            ) : (
              <Card className="shrink-0">
                <CardContent className="p-5">
                  <CardSectionTitle title={title} icon={icon} className="border-b-0 pb-0">
                    {actions}
                  </CardSectionTitle>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <>
            <FocusFlowHeader title={title} icon={icon} className="flex-wrap" chromeButtons={!inApp}>
              {actions}
            </FocusFlowHeader>
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
