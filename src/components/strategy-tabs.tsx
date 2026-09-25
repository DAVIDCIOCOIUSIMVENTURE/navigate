"use client"

import type { ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Props = {
  /** The hands-on half: the cobalt card the user works in. */
  strategy: ReactNode
  /** The read-only half, drawn on the muted case-study panel. */
  children: ReactNode
  strategyLabel?: string
  caseStudiesLabel?: string
  /** Classes for the whole block, for a flow that has to fit the viewport. */
  className?: string
  /** Classes for both content panels, for example to let them scroll. */
  contentClassName?: string
}

/**
 * A tab pair with the active tab attached to the card below it, like the
 * tab on a folder: the tab takes the card's colour and sits flush on its
 * top edge, and the other tab waits in grey beside it. The strategy tab is
 * cobalt to match the strategy cards; the case-study tab is the case-study
 * panel colour (`CASE_STUDY_PANEL_CLASS`), so it runs into the panel underneath.
 */
/**
 * The panel the case-study tab opens. A shade darker than the idle tab
 * (`bg-muted`), so the open panel and its tab tell apart from the tab that
 * is waiting beside it. Add the gap at the call site.
 */
export const CASE_STUDY_PANEL_CLASS = "rounded-xl border bg-border p-8 flex flex-col"

const TAB_CLASS = cn(
  "relative z-[1] rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted px-8 py-3 text-base font-medium text-foreground shadow-none transition-colors",
  // Only the active tab reaches 1px into the panel below, to cover the panel's top border so the two read as one shape.
  // The inactive tab stops at the panel's edge, or its grey would show against the card.
  "data-[state=inactive]:hover:bg-border/70 data-[state=active]:-mb-px data-[state=active]:shadow-none",
)

export function StrategyTabs({
  strategy,
  children,
  strategyLabel = "Your Strategy",
  caseStudiesLabel = "Case Studies",
  className,
  contentClassName,
}: Props) {
  return (
    <Tabs defaultValue="strategy" className={cn("flex flex-col", className)}>
      <TabsList className="h-auto shrink-0 items-end gap-1 self-center rounded-none bg-transparent p-0">
        <TabsTrigger
          value="strategy"
          className={cn(TAB_CLASS, "data-[state=active]:border-secondary-brand data-[state=active]:bg-secondary-brand data-[state=active]:text-secondary-brand-foreground")}
        >
          {strategyLabel}
        </TabsTrigger>
        <TabsTrigger
          value="case-studies"
          className={cn(TAB_CLASS, "data-[state=active]:border-border data-[state=active]:bg-border data-[state=active]:text-foreground")}
        >
          {caseStudiesLabel}
        </TabsTrigger>
      </TabsList>
      {/* No display class on a TabsContent: it would override the `hidden` attribute Radix gives the inactive panel. */}
      <TabsContent value="strategy" className={cn("mt-0", contentClassName)}>
        {strategy}
      </TabsContent>
      <TabsContent value="case-studies" className={cn("mt-0", contentClassName)}>
        {children}
      </TabsContent>
    </Tabs>
  )
}
