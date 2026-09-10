"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, PanelTop, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFocusChrome } from "@/context/focus-chrome-context"
import { useContainerSize } from "@/context/container-size-context"
import { SECTION_TITLE_ICON_CLASS, SECTION_TITLE_TILE_CLASS } from "@/lib/nav-item-styles"
import { cn } from "@/lib/utils"

/**
 * Shell for the Identify hubs (problems and solutions). Both render as focus
 * flows, like Reflect, so the header and sidebar are hidden and this shell
 * supplies what they would otherwise provide: a Back button, the top-bar
 * toggle and the section title. On wide containers the card is fitted to the
 * viewport and only its content scrolls; on narrow the page scrolls naturally.
 */
export function IdentifyHubShell({
  title,
  icon: Icon,
  backHref,
  intro,
  children,
}: {
  title: string
  icon: LucideIcon
  /** Where the Back button returns to (the matching library page). */
  backHref: string
  /** Introductory copy shown at the top of the card, above the tool picker. */
  intro: ReactNode
  children: ReactNode
}) {
  const router = useRouter()
  const { revealTopNav } = useFocusChrome()
  const isWide = useContainerSize() === "wide"

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 flex-col gap-3",
          "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          isWide && "overflow-hidden max-h-[100svh]",
        )}
      >
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="tertiary-outline" onClick={() => router.push(backHref)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white"
              onClick={revealTopNav}
              aria-label="Show top bar"
              title="Top bar"
            >
              <PanelTop className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 shrink-0 text-foreground">
            <span className={SECTION_TITLE_TILE_CLASS} aria-hidden="true">
              <Icon className={SECTION_TITLE_ICON_CLASS} />
            </span>
            <span className="truncate">{title}</span>
          </h1>
        </div>

        <Card className={cn("flex w-full flex-col", isWide ? "flex-1 min-h-0 overflow-hidden" : "min-h-[320px]")}>
          <CardHeader className="space-y-3">{intro}</CardHeader>
          <CardContent className={cn("flex flex-col gap-3", isWide && "flex-1 min-h-0 overflow-y-auto")}>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
