"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown, Info, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

/**
 * Shell for the Identify hubs (problems and solutions). Both render as focus
 * flows, like Reflect, so the header and sidebar are hidden and this shell
 * supplies what they would otherwise provide: a Back button, the top-bar
 * toggle and the section title. The introductory copy stays hidden until the
 * user presses the About toggle beside the title. On wide containers the card
 * is fitted to the viewport and only its content scrolls; on narrow the page
 * scrolls naturally.
 */
export function IdentifyHubShell({
  title,
  icon,
  backHref,
  intro,
  children,
}: {
  title: string
  icon: LucideIcon
  /** Where the Back button returns to (the matching library page). */
  backHref: string
  /** Introductory copy revealed at the top of the card by the About toggle beside the title. */
  intro: ReactNode
  children: ReactNode
}) {
  const isWide = useContainerSize() === "wide"
  const [introOpen, setIntroOpen] = useState(false)

  return (
    <Collapsible
      open={introOpen}
      onOpenChange={setIntroOpen}
      className="flex flex-1 min-h-0 w-full flex-col"
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 flex-col gap-3",
          "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          isWide && "overflow-hidden max-h-[100svh]",
        )}
      >
        <FocusFlowHeader title={title} icon={icon} backHref={backHref}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2 bg-white shrink-0" aria-label={`About ${title}`}>
              <Info className="h-4 w-4" aria-hidden="true" />
              About
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", introOpen && "rotate-180")}
                aria-hidden="true"
              />
            </Button>
          </CollapsibleTrigger>
        </FocusFlowHeader>

        <Card className={cn("flex w-full flex-col", isWide ? "flex-1 min-h-0 overflow-hidden" : "min-h-[320px]")}>
          <CollapsibleContent asChild>
            <CardHeader className="space-y-3">{intro}</CardHeader>
          </CollapsibleContent>
          <CardContent
            className={cn("flex flex-col gap-3", !introOpen && "pt-6", isWide && "flex-1 min-h-0 overflow-y-auto")}
          >
            {children}
          </CardContent>
        </Card>
      </div>
    </Collapsible>
  )
}
