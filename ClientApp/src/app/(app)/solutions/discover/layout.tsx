"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "@/lib/router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DiscoveryProvider, useDiscovery, NAV_ITEMS, STEPS_REQUIRING_PROBLEM } from "./context"
import { SolutionsDrawer } from "./solutions-drawer"
import { Lightbulb, Lock, Check, ChevronDown, RotateCcw, ArrowLeft, PanelTop } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { useFocusChrome } from "@/context/focus-chrome-context"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

function StepBadge({
  index,
  state,
}: {
  index: number
  state: "active" | "completed" | "locked" | "default"
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center w-6 h-6 rounded-md shrink-0 text-xs font-bold transition-colors",
        state === "active" || state === "completed"
          ? "bg-tertiary text-white"
          : state === "locked"
            ? "bg-tertiary/5 text-tertiary/40"
            : "bg-tertiary/10 text-tertiary"
      )}
    >
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
  problemSelected,
  onNavigate,
}: {
  pathname: string
  problemSelected: boolean
  onNavigate: (path: string) => void
}) {
  const activeIdx = NAV_ITEMS.findIndex(
    (item) => pathname === `/solutions/discover/${item.path}`
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
            variant={isActive ? "secondary" : "ghost"}
            disabled={locked}
            onClick={() => {
              if (locked) return
              onNavigate(`/solutions/discover/${item.path}`)
            }}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2 disabled:opacity-100 hover:text-tertiary",
              isActive && "text-tertiary",
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
  problemSelected,
  onNavigate,
}: {
  pathname: string
  problemSelected: boolean
  onNavigate: (path: string) => void
}) {
  const [open, setOpen] = useState(false)
  const activeIdx = NAV_ITEMS.findIndex(
    (item) => pathname === `/solutions/discover/${item.path}`
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
                : "Solution Discovery"}
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
                onNavigate(`/solutions/discover/${item.path}`)
              }}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 py-2 px-3 text-sm",
                isActive && "bg-accent"
              )}
            >
              <StepBadge index={i} state={state} />
              <span
                className={cn(
                  "whitespace-normal text-left",
                  isActive
                    ? "font-semibold text-foreground"
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
  const { problemId, candidates, resetWorkspace } = useDiscovery()
  const { revealTopNav } = useFocusChrome()
  const [mounted, setMounted] = useState(false)
  const [solutionsDrawerOpen, setSolutionsDrawerOpen] = useState(false)
  const problemSelected = problemId != null
  const isWide = useContainerSize() === "wide"

  useEffect(() => {
    setMounted(true)
  }, [])

  const backAndPanel = (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        variant="tertiary-outline"
        onClick={() => router.push("/solutions/identify")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={revealTopNav}
        aria-label="Show top bar"
        title="Top bar"
      >
        <PanelTop className="h-4 w-4" />
      </Button>
    </div>
  )

  const sectionTitle = (
    <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 shrink-0">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-tertiary shrink-0" aria-hidden="true">
        <Lightbulb className="h-4 w-4 text-tertiary-foreground" />
      </span>
      <span className="truncate">Solution Discovery</span>
    </h1>
  )

  const railActions = problemSelected && (
    <div className="shrink-0 flex flex-col gap-2">
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
        title="Reset solution discovery?"
        description="This will clear your analysis tool choice, discovery method, root-cause work, and all in-progress ideas for this problem. Saved solutions are not affected."
        confirmLabel="Reset"
        onConfirm={resetWorkspace}
      />
    </div>
  )

  const wideStepper = (
    <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <CardContent className="p-3 flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <StepList
            pathname={pathname}
            problemSelected={problemSelected}
            onNavigate={(path) => router.push(path)}
          />
        </div>
        {railActions}
      </CardContent>
    </Card>
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
        <div className="w-72 shrink-0 h-full flex flex-col gap-4 min-h-0">
          {backAndPanel}
          {sectionTitle}
          {wideStepper}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 shrink-0">
            {backAndPanel}
            {sectionTitle}
          </div>
          <MobileStepper
            pathname={pathname}
            problemSelected={problemSelected}
            onNavigate={(path) => router.push(path)}
          />
          {railActions}
        </>
      )}

      <div className="flex-1 min-w-0 min-h-0 overflow-y-auto">{mounted ? children : null}</div>

      <SolutionsDrawer open={solutionsDrawerOpen} onOpenChange={setSolutionsDrawerOpen} />
    </div>
  )
}

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiscoveryProvider>
      <LayoutContent>{children}</LayoutContent>
    </DiscoveryProvider>
  )
}
