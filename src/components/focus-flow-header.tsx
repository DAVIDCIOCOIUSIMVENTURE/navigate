"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, PanelTop, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFocusChrome } from "@/context/focus-chrome-context"
import { SECTION_TITLE_ICON_CLASS, SECTION_TITLE_TILE_CLASS } from "@/lib/nav-item-styles"
import { cn } from "@/lib/utils"

/**
 * Header row for a focus page that has no stepper rail (the Identify hubs and
 * the Canvas Builder). It supplies what the hidden app chrome would otherwise
 * provide: the Back button, the top-bar toggle and the tile section title.
 * Extra actions passed as children sit after the title. Pass `flex-wrap` in
 * `className` when the header sits in a narrow column and must stack.
 */
export function FocusFlowHeader({
  title,
  icon: Icon,
  backHref,
  className,
  children,
}: {
  title: string
  icon: LucideIcon
  /** Where the Back button returns to. */
  backHref: string
  className?: string
  children?: ReactNode
}) {
  const router = useRouter()
  const { revealTopNav } = useFocusChrome()

  return (
    <div className={cn("flex items-center gap-3 shrink-0", className)}>
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
      {children}
    </div>
  )
}
