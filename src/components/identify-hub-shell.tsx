"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AboutDialog } from "@/components/about-toggle"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { JourneyProgressCard } from "@/components/journey-progress"
import { useContainerSize } from "@/context/container-size-context"
import type { JourneyStepId } from "@/lib/journey-steps"
import { cn } from "@/lib/utils"

/**
 * Shell for the Identify problems hub. It renders as a focus flow, like
 * Reflect, so the header and sidebar are hidden and this shell
 * supplies what they would otherwise provide: a Back button, the top-bar
 * toggle and the section title. The introductory copy opens in a dialog from
 * the About button beside the title; a one-line `description` sits at the top
 * of the card to say what to do. On wide containers the card is fitted to the
 * viewport and only its content scrolls; on narrow the page scrolls naturally.
 *
 * When `journeyStep` is given, wide containers get a left column holding the
 * header (Back, top-bar toggle, title, About) stacked above the journey
 * progress rail, with the content card beside it. Narrow containers keep the
 * header on top and show the rail as a compact row above the card.
 */
export function IdentifyHubShell({
  title,
  icon,
  backHref,
  intro,
  aboutTitle,
  description,
  journeyStep,
  children,
}: {
  title: string
  icon: LucideIcon
  /** Where the Back button returns to (the matching library page). */
  backHref: string
  /** Introductory copy shown in the About dialog. */
  intro: ReactNode
  /** Heading of the About dialog. Defaults to "About <title>". */
  aboutTitle?: string
  /** Short instruction shown at the top of the card, above the tool list. */
  description?: ReactNode
  /** The journey milestone this hub belongs to; shows the progress rail when set. */
  journeyStep?: JourneyStepId
  children: ReactNode
}) {
  const isWide = useContainerSize() === "wide"
  const sideColumn = journeyStep !== undefined && isWide

  const header = (
    <FocusFlowHeader title={title} icon={icon} backHref={backHref} className={cn(sideColumn && "flex-wrap")}>
      <AboutDialog subject={title} title={aboutTitle}>
        {intro}
      </AboutDialog>
    </FocusFlowHeader>
  )

  const content = (
    <Card className={cn("flex w-full min-w-0 flex-col", isWide ? "flex-1 min-h-0 overflow-hidden" : "min-h-[320px]")}>
      <CardContent className={cn("flex flex-col gap-3 pt-6", isWide && "flex-1 min-h-0 overflow-y-auto")}>
        {description && <p className="text-base leading-relaxed">{description}</p>}
        {children}
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 gap-3",
          "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          sideColumn ? "flex-row items-stretch" : "flex-col",
          isWide && "overflow-hidden max-h-[100svh]",
        )}
      >
        {sideColumn ? (
          <div className="flex w-72 shrink-0 flex-col gap-3 min-h-0 overflow-y-auto">
            {header}
            <JourneyProgressCard activeId={journeyStep} />
          </div>
        ) : (
          <>
            {header}
            {journeyStep && <JourneyProgressCard activeId={journeyStep} orientation="horizontal" />}
          </>
        )}

        {content}
      </div>
    </div>
  )
}
