"use client"

import { useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, FileText, PanelTop, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JourneyProgressCard } from "@/components/journey-progress"
import { useFocusChrome } from "@/context/focus-chrome-context"
import { useContainerSize } from "@/context/container-size-context"
import type { JourneyStepId } from "@/lib/journey-steps"
import { cn } from "@/lib/utils"
import {
  NAV_ITEM_ACTIVE_CLASS,
  NAV_ITEM_ACTIVE_FOCUS_CLASS,
  NAV_ITEM_HOVER_CLASS,
  navIconClass,
  navIconTileClass,
  SECTION_TITLE_ICON_CLASS,
  SECTION_TITLE_TILE_CLASS,
} from "@/lib/nav-item-styles"

export type FlowNavItem = {
  path: string
  label: string
  /** Optional heading shown above this step to group the steps that follow. */
  section?: string | null
}

/** An entry appended to the narrow-container step dropdown, after the steps. */
export type FlowMenuAction = {
  label: string
  icon: LucideIcon
  onSelect: () => void
}

/**
 * Cap for the left column of a focus flow on wide containers: the viewport
 * minus the wrapper's vertical padding (`py-4` = 2rem, `lg:py-6` = 3rem). The
 * wrapper is `max-h-[100svh] overflow-hidden`, and the column's height is not
 * otherwise constrained, so without this cap a column taller than the viewport
 * is clipped instead of scrolling. Recompute if that padding changes.
 */
export const FOCUS_COLUMN_MAX_HEIGHT_CLASS = "max-h-[calc(100svh-2rem)] lg:max-h-[calc(100svh-3rem)]"

/**
 * Shell for a stepped focus flow about one problem or solution (the problem
 * Explore and Validation flows, solution validation). Focus flows render with
 * no header or sidebar, so like Reflect this supplies the Back button, the
 * top-bar toggle and the section title, then the step nav and the journey
 * progress rail. On wide containers those sit in a scrolling left column
 * beside the step content; on narrow the nav collapses into a dropdown above
 * the content and the rail becomes a horizontal row.
 *
 * `context` is whatever reminder the flow wants under the step list (context
 * cards and View buttons); it renders inside the nav card on wide and below
 * the dropdown on narrow. `menuActions` mirrors those View buttons inside the
 * narrow dropdown. Any dialogs those actions open are the caller's to render.
 */
export function FlowShell({
  title,
  icon: Icon,
  navLabel,
  backHref,
  base,
  navItems,
  navIcons,
  journeyStep,
  context,
  menuActions = [],
  children,
}: {
  title: string
  icon: LucideIcon
  /** Accessible name for the step nav. */
  navLabel: string
  /** Where the Back button returns to. */
  backHref: string
  /** Route prefix the step paths are appended to. */
  base: string
  navItems: readonly FlowNavItem[]
  navIcons: Record<string, LucideIcon>
  journeyStep: JourneyStepId
  context?: ReactNode
  menuActions?: readonly FlowMenuAction[]
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { revealTopNav } = useFocusChrome()
  const isWide = useContainerSize() === "wide"
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const activeItem = navItems.find((item) => pathname === `${base}/${item.path}`)
  const ActiveIcon = activeItem ? (navIcons[activeItem.path] ?? FileText) : Icon

  const handleNavigate = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  const backAndPanel = (
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
  )

  const sectionTitle = (
    <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 shrink-0 text-foreground">
      <span className={SECTION_TITLE_TILE_CLASS} aria-hidden="true">
        <Icon className={SECTION_TITLE_ICON_CLASS} />
      </span>
      <span className="truncate">{title}</span>
    </h1>
  )

  const stepList = (
    <ul className="flex flex-col gap-1 list-none m-0 p-0" role="list">
      {navItems.map((item) => {
        const href = `${base}/${item.path}`
        const isActive = pathname === href
        const StepIcon = navIcons[item.path] ?? FileText
        return (
          <li key={item.path}>
            {item.section && (
              <p className="text-sm font-semibold tracking-wide px-3 pt-3 pb-1">{item.section}</p>
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2",
                NAV_ITEM_HOVER_CLASS,
                isActive && NAV_ITEM_ACTIVE_CLASS,
              )}
              onClick={() => handleNavigate(href)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={navIconTileClass(isActive)}>
                <StepIcon className={navIconClass(isActive)} aria-hidden="true" />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          </li>
        )
      })}
    </ul>
  )

  const mobileNav = (
    <nav aria-label={navLabel} className="w-full shrink-0">
      <DropdownMenu open={mobileNavOpen} onOpenChange={setMobileNavOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-auto py-2 px-3 bg-white">
            <span className="flex items-center gap-2 text-sm font-medium min-w-0">
              <span className={navIconTileClass(true)}>
                <ActiveIcon className={navIconClass(true)} aria-hidden="true" />
              </span>
              <span className="truncate">{activeItem?.label ?? "Navigation"}</span>
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", mobileNavOpen && "rotate-180")}
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[16rem] p-1 bg-white"
        >
          {navItems.map((item) => {
            const href = `${base}/${item.path}`
            const isActive = pathname === href
            const StepIcon = navIcons[item.path] ?? FileText
            return (
              <DropdownMenuItem
                key={item.path}
                onSelect={() => handleNavigate(href)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 text-sm",
                  isActive && cn(NAV_ITEM_ACTIVE_CLASS, NAV_ITEM_ACTIVE_FOCUS_CLASS),
                )}
              >
                <span className={navIconTileClass(isActive)}>
                  <StepIcon className={navIconClass(isActive)} aria-hidden="true" />
                </span>
                <span className="flex-1 text-left whitespace-normal">{item.label}</span>
              </DropdownMenuItem>
            )
          })}
          {menuActions.length > 0 && <DropdownMenuSeparator />}
          {menuActions.map((action) => {
            const ActionIcon = action.icon
            return (
              <DropdownMenuItem
                key={action.label}
                onSelect={() => {
                  setMobileNavOpen(false)
                  action.onSelect()
                }}
                className="flex items-center gap-2 py-2 px-3 text-sm"
              >
                <ActionIcon className="h-3.5 w-3.5" />
                <span>{action.label}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {context && <div className="mt-3">{context}</div>}
    </nav>
  )

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 gap-3",
          "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          isWide ? "flex-row overflow-hidden max-h-[100svh]" : "flex-col",
        )}
      >
        {isWide ? (
          <div className={cn("w-72 shrink-0 flex flex-col gap-4 min-h-0", FOCUS_COLUMN_MAX_HEIGHT_CLASS)}>
            {backAndPanel}
            {sectionTitle}
            {/* The step nav keeps its natural height; the column scrolls when it and the rail outgrow the viewport. */}
            <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto">
              <nav aria-label={navLabel} className="flex shrink-0 flex-col">
                <Card>
                  <CardContent className="p-3 flex flex-col gap-2">
                    {stepList}
                    {context}
                  </CardContent>
                </Card>
              </nav>
              <JourneyProgressCard activeId={journeyStep} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 shrink-0">
              {backAndPanel}
              {sectionTitle}
            </div>
            {mobileNav}
            <JourneyProgressCard activeId={journeyStep} orientation="horizontal" />
          </>
        )}

        <div className={cn("flex-1 min-w-0 flex flex-col", isWide && "min-h-0 overflow-y-auto")}>{children}</div>
      </div>
    </div>
  )
}
