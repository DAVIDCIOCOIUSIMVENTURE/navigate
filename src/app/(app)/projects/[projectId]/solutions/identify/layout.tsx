"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IdentifySolutionsProvider, useIdentifySolutions, NAV_ITEMS, STEPS_REQUIRING_PROBLEM } from "./context"
import { SolutionsDrawer } from "./solutions-drawer"
import { ProblemContextCard } from "@/components/context-card"
import { Lightbulb, Lock, Check, ChevronDown, RotateCcw } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { FocusChromeButtons } from "@/components/focus-chrome-buttons"
import { projectRoutes } from "@/lib/projects"
import { cn } from "@/lib/utils"
import {
  NAV_ITEM_ACTIVE_CLASS,
  NAV_ITEM_ACTIVE_FOCUS_CLASS,
  NAV_ITEM_HOVER_CLASS,
  navStepBadgeClass,
} from "@/lib/nav-item-styles"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { JourneyProgressCard } from "@/components/journey-progress"
import { CardSectionTitle, SectionTitle } from "@/components/section-title"
import { FOCUS_COLUMN_MAX_HEIGHT_CLASS, FOCUS_COLUMN_WIDTH_CLASS } from "@/components/flow-shell"

function StepBadge({
  index,
  state,
}: {
  index: number
  state: "active" | "completed" | "locked" | "default"
}) {
  return (
    <span className={navStepBadgeClass(state)}>
      {state === "completed" ? (
        <Check className="h-3.5 w-3.5" />
      ) : state === "locked" ? (
        <Lock className="h-3 w-3" />
      ) : (
        index + 1
      )}
    </span>
  )
}

function getStepState(
  i: number,
  activeIdx: number,
  locked: boolean
): "active" | "completed" | "locked" | "default" {
  if (i === activeIdx) return "active"
  if (activeIdx >= 0 && i < activeIdx) return "completed"
  if (locked) return "locked"
  return "default"
}

function StepList({
  pathname,
  base,
  problemSelected,
  onNavigate,
}: {
  pathname: string
  base: string
  problemSelected: boolean
  onNavigate: (path: string) => void
}) {
  const activeIdx = NAV_ITEMS.findIndex(
    (item) => pathname === `${base}/${item.path}`
  )
  return (
    <div className="flex flex-col gap-1">
      {NAV_ITEMS.map((item, i) => {
        const locked = STEPS_REQUIRING_PROBLEM.has(item.path) && !problemSelected
        const state = getStepState(i, activeIdx, locked)
        const isActive = state === "active"
        return (
          <Button
            key={item.path}
            type="button"
            variant="ghost"
            disabled={locked}
            onClick={() => {
              if (locked) return
              onNavigate(`${base}/${item.path}`)
            }}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2 disabled:opacity-100",
              NAV_ITEM_HOVER_CLASS,
              isActive && NAV_ITEM_ACTIVE_CLASS,
              locked && "text-muted-foreground/60"
            )}
          >
            <StepBadge index={i} state={state} />
            <span className="flex-1 text-left">{item.label}</span>
          </Button>
        )
      })}
    </div>
  )
}

function MobileStepper({
  pathname,
  base,
  problemSelected,
  onNavigate,
}: {
  pathname: string
  base: string
  problemSelected: boolean
  onNavigate: (path: string) => void
}) {
  const [open, setOpen] = useState(false)
  const activeIdx = NAV_ITEMS.findIndex(
    (item) => pathname === `${base}/${item.path}`
  )
  const activeItem = activeIdx >= 0 ? NAV_ITEMS[activeIdx] : null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-2 px-3 bg-white"
        >
          <span className="flex items-center gap-2 text-sm font-medium min-w-0">
            <StepBadge
              index={activeIdx >= 0 ? activeIdx : 0}
              state={activeItem ? "active" : "default"}
            />
            <span className="truncate">
              {activeItem
                ? `Step ${activeIdx + 1} of ${NAV_ITEMS.length}: ${activeItem.label}`
                : "Identify Solutions"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[16rem] p-1 bg-white"
      >
        {NAV_ITEMS.map((item, i) => {
          const locked = STEPS_REQUIRING_PROBLEM.has(item.path) && !problemSelected
          const state = getStepState(i, activeIdx, locked)
          const isActive = state === "active"
          return (
            <DropdownMenuItem
              key={item.path}
              disabled={locked}
              onSelect={(e) => {
                if (locked) {
                  e.preventDefault()
                  return
                }
                onNavigate(`${base}/${item.path}`)
              }}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 py-2 px-3 text-sm",
                isActive && cn(NAV_ITEM_ACTIVE_CLASS, NAV_ITEM_ACTIVE_FOCUS_CLASS)
              )}
            >
              <StepBadge index={i} state={state} />
              <span
                className={cn(
                  "whitespace-normal text-left",
                  isActive
                    ? "font-semibold"
                    : locked
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { projectId, problemId, problem, candidates, resetWorkspace } = useIdentifySolutions()
  const [mounted, setMounted] = useState(false)
  const [solutionsDrawerOpen, setSolutionsDrawerOpen] = useState(false)
  const problemSelected = problemId != null
  const isWide = useContainerSize() === "wide"
  const base = projectRoutes.identifySolutionsBase(projectId)

  useEffect(() => {
    setMounted(true)
  }, [])

  const railActions = problemSelected && (
    <div className="shrink-0 flex flex-col gap-2">
      <ProblemContextCard problem={problem} compact />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSolutionsDrawerOpen(true)}
        className="w-full gap-2 bg-card"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        Show all solutions ({candidates.length})
      </Button>
      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm" className="w-full gap-2 bg-card text-destructive hover:text-destructive hover:bg-destructive/10">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        }
        title="Reset your progress?"
        description="This will clear your analysis tool choice, method, root-cause work, and all in-progress ideas for this problem. Saved solutions are not affected."
        confirmLabel="Reset"
        onConfirm={resetWorkspace}
      />
    </div>
  )

  const wideStepper = (
    <nav aria-label="Identify solutions steps" className="flex shrink-0 flex-col">
      <Card>
        <CardContent className="p-3 flex flex-col gap-3">
          <CardSectionTitle title="Identify Solutions" icon={Lightbulb} className="px-3 pt-1.5" />
          <StepList
            pathname={pathname}
            base={base}
            problemSelected={problemSelected}
            onNavigate={(path) => router.push(path)}
          />
          {railActions}
        </CardContent>
      </Card>
    </nav>
  )

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0",
        "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
        isWide ? "flex-row gap-3 overflow-hidden max-h-[100svh]" : "flex-col gap-3",
      )}
    >
      {isWide ? (
        <div className={cn("shrink-0 flex flex-col gap-4 min-h-0", FOCUS_COLUMN_WIDTH_CLASS, FOCUS_COLUMN_MAX_HEIGHT_CLASS)}>
          <FocusChromeButtons />
          {/* The stepper keeps its natural height; the column scrolls when it and the rail outgrow the viewport. */}
          <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto">
            {wideStepper}
            <JourneyProgressCard activeId="identify-solutions" problemId={problemId} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 shrink-0">
            <FocusChromeButtons />
            <SectionTitle title="Identify Solutions" icon={Lightbulb} />
          </div>
          <MobileStepper
            pathname={pathname}
            base={base}
            problemSelected={problemSelected}
            onNavigate={(path) => router.push(path)}
          />
          {railActions}
          <JourneyProgressCard activeId="identify-solutions" problemId={problemId} orientation="horizontal" />
        </>
      )}

      <div className="flex-1 min-w-0 min-h-0 overflow-y-auto">{mounted ? children : null}</div>

      <SolutionsDrawer open={solutionsDrawerOpen} onOpenChange={setSolutionsDrawerOpen} />
    </div>
  )
}

export default function IdentifySolutionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <IdentifySolutionsProvider>
      <LayoutContent>{children}</LayoutContent>
    </IdentifySolutionsProvider>
  )
}
