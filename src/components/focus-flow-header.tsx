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
 * `className` when the header sits in a narrow column and must stack. A page
 * that keeps the app header (the project page) passes `chromeButtons={false}`
 * to get the title row alone, since Home and the menu are already on screen.
 */
export function FocusFlowHeader({
  title,
  icon: Icon,
  className,
  chromeButtons = true,
  children,
}: {
  title: string
  icon: LucideIcon
  className?: string
  /** Render the Home and Open menu buttons before the title; off when the app header is visible. */
  chromeButtons?: boolean
  children?: ReactNode
}) {
  return (
    <div className={cn("flex items-center gap-3 shrink-0", className)}>
      {chromeButtons && <FocusChromeButtons />}
      {/* The title shrinks and truncates: a project's name can be longer than the narrow column it sits in. */}
      <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 text-foreground">
        <span className={SECTION_TITLE_TILE_CLASS} aria-hidden="true">
          <Icon className={SECTION_TITLE_ICON_CLASS} />
        </span>
        <span className="truncate">{title}</span>
      </h1>
      {children}
    </div>
  )
}
