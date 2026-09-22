"use client"

import type { ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { FocusChromeButtons } from "@/components/focus-chrome-buttons"
import { SECTION_TITLE_ICON_CLASS, SECTION_TITLE_TILE_CLASS } from "@/lib/nav-item-styles"
import { cn } from "@/lib/utils"

/**
 * Header row for a focus page that has no stepper rail (the Identify hubs and
 * the Canvas Builder). It supplies what the hidden app chrome would otherwise
 * provide: the Home button, the Open menu toggle and the tile section title.
 * Extra actions passed as children sit after the title. Pass `flex-wrap` in
 * `className` when the header sits in a narrow column and must stack.
 */
export function FocusFlowHeader({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string
  icon: LucideIcon
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={cn("flex items-center gap-3 shrink-0", className)}>
      <FocusChromeButtons />
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
