"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { SECTION_TITLE_ICON_CLASS, SECTION_TITLE_TILE_CLASS } from "@/lib/nav-item-styles"
import { cn } from "@/lib/utils"

/**
 * The `h1` of a focus flow: the compact primary tile with the flow's icon and
 * the title beside it. The title shrinks, because a project's name can be
 * longer than the column it sits in: in a header row it truncates to keep the
 * row one line high, and at the head of a card (`wrap`) it runs onto a second
 * line before it is clipped.
 */
export function SectionTitle({
  title,
  icon: Icon,
  wrap = false,
  className,
}: {
  title: string
  icon: LucideIcon
  /** Let a long title wrap onto a second line rather than truncating it. */
  wrap?: boolean
  className?: string
}) {
  return (
    <h1 className={cn("flex items-center gap-2 text-xl font-bold min-w-0 text-foreground", className)}>
      <span className={SECTION_TITLE_TILE_CLASS} aria-hidden="true">
        <Icon className={SECTION_TITLE_ICON_CLASS} />
      </span>
      <span className={wrap ? "line-clamp-2 break-words leading-tight" : "truncate"}>{title}</span>
    </h1>
  )
}

/**
 * The section title as the head of the first card in a focus page's left
 * column: the stepper card where the page has one, otherwise the journey rail
 * card. It sits above a rule so the steps or the rail read as belonging to the
 * title. `children` sit at the right of the title row: icon-only buttons such
 * as the hub's About button or the project page's Settings button, since the
 * column is narrow and the title needs the room. Cards padded `p-3` pass
 * `px-3 pt-1.5` so the tile lines up with the icon tiles of the rows below.
 */
export function CardSectionTitle({
  title,
  icon,
  className,
  children,
}: {
  title: string
  icon: LucideIcon
  className?: string
  /** Drawn at the right of the title row. */
  children?: ReactNode
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-3 border-b border-border pb-3", className)}>
      <SectionTitle title={title} icon={icon} wrap className="flex-1" />
      {children}
    </div>
  )
}
