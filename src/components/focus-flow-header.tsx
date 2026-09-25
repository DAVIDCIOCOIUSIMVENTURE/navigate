"use client"

import type { ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { FocusChromeButtons } from "@/components/focus-chrome-buttons"
import { SectionTitle } from "@/components/section-title"
import { cn } from "@/lib/utils"

/**
 * Header row for a focus page that has no left column to put its title in
 * (the Canvas Builder, the not-found states, and every focus page on a narrow
 * container). It supplies what the hidden app chrome would otherwise provide:
 * the Home button, the Open menu toggle and the tile section title. Extra
 * actions passed as children sit after the title. Pass `flex-wrap` in
 * `className` when the header sits in a narrow column and must stack. A page
 * that keeps the app header (the project page) passes `chromeButtons={false}`
 * to get the title row alone, since Home and the menu are already on screen.
 * On wide containers the title moves into the column's first card instead
 * (`CardSectionTitle` in `section-title.tsx`).
 */
export function FocusFlowHeader({
  title,
  icon,
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
      <SectionTitle title={title} icon={icon} />
      {children}
    </div>
  )
}
