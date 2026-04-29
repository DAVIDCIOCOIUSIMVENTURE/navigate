"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DiscoveryProvider, useDiscovery, NAV_ITEMS, STEPS_REQUIRING_PROBLEM } from "./context"
import { SolutionsDrawer } from "./solutions-drawer"
import { Lightbulb, Lock, Check, Maximize2, Minimize2, ChevronDown } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

function Stepper({
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
    <div className="flex items-center w-full">
      {NAV_ITEMS.map((item, i) => {
        const isActive = i === activeIdx
        const isCompleted = activeIdx >= 0 && i < activeIdx
        const locked = STEPS_REQUIRING_PROBLEM.has(item.path) && !problemSelected
        const isClickable = !locked
        return (
          <div key={item.path} className="flex items-center flex-1 last:flex-none min-w-0">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onNavigate(`/solutions/discover/${item.path}`)}
              aria-current={isActive ? "step" : undefined}
              aria-disabled={!isClickable}
              className="flex items-center gap-2 shrink-0 disabled:cursor-not-allowed text-left"
            >
              <span
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : locked
                        ? "border-muted-foreground/20 bg-transparent text-muted-foreground/50"
                        : "border-muted-foreground/30 bg-transparent text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : locked ? <Lock className="h-3 w-3" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  isActive
                    ? "font-semibold text-foreground"
                    : locked
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
            {i < NAV_ITEMS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-3 min-w-3",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

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
        "flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-colors shrink-0",
        state === "active"
          ? "border-primary bg-primary text-primary-foreground"
          : state === "completed"
            ? "border-primary bg-primary/10 text-primary"
            : state === "locked"
              ? "border-muted-foreground/20 bg-transparent text-muted-foreground/50"
              : "border-muted-foreground/30 bg-transparent text-muted-foreground"
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
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardContent className="p-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto py-2 px-3"
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
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-1">
            <ul className="flex flex-col gap-0.5 list-none m-0 p-0" role="list">
              {NAV_ITEMS.map((item, i) => {
                const locked = STEPS_REQUIRING_PROBLEM.has(item.path) && !problemSelected
                const state = getStepState(i, activeIdx, locked)
                const isActive = state === "active"
                return (
                  <li key={item.path}>
                    <Button
                      type="button"
                      variant={isActive ? "secondary" : "ghost"}
                      disabled={locked}
                      onClick={() => {
                        if (locked) return
                        setOpen(false)
                        onNavigate(`/solutions/discover/${item.path}`)
                      }}
                      aria-current={isActive ? "step" : undefined}
                      className="w-full justify-start h-auto py-2 px-3 gap-2.5"
                    >
                      <StepBadge index={i} state={state} />
                      <span
                        className={cn(
                          "text-sm whitespace-normal text-left",
                          isActive
                            ? "font-semibold text-foreground"
                            : locked
                              ? "text-muted-foreground/60"
                              : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { problemId, candidates } = useDiscovery()
  const [mounted, setMounted] = useState(false)
  const [solutionsDrawerOpen, setSolutionsDrawerOpen] = useState(false)
  const problemSelected = problemId != null
  const fullView = useSelector((state: RootState) => state.settings.fullView)
  const isWide = useContainerSize() === "wide"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Exit full view when navigating away from solution discovery
  useEffect(() => {
    if (!pathname.includes("/solutions/discover")) {
      dispatch.settings.setFullView(false)
    }
  }, [pathname, dispatch.settings])

  // Escape key exits full view
  useEffect(() => {
    if (!fullView) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch.settings.setFullView(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [fullView, dispatch.settings])

  const actionButtons = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => dispatch.settings.setFullView(!fullView)}
        className="gap-2 shrink-0"
      >
        {fullView ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        {fullView ? "Exit Full View" : "Full View"}
      </Button>
      {problemSelected && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSolutionsDrawerOpen(true)}
          className="gap-2 shrink-0"
        >
          <Lightbulb className="h-3.5 w-3.5" />
          Show All Solutions ({candidates.length})
        </Button>
      )}
    </>
  )

  return (
    <div className="flex flex-col gap-6 flex-1 w-full min-h-0">
      {isWide ? (
        <div className="flex items-center gap-4">
          <Card className="flex-1">
            <CardContent className="px-6 py-4">
              <Stepper
                pathname={pathname}
                problemSelected={problemSelected}
                onNavigate={(path) => router.push(path)}
              />
            </CardContent>
          </Card>
          {actionButtons}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <MobileStepper
            pathname={pathname}
            problemSelected={problemSelected}
            onNavigate={(path) => router.push(path)}
          />
          <div className="flex flex-wrap items-center gap-2">
            {actionButtons}
          </div>
        </div>
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
