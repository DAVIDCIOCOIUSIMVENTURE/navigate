"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DiscoveryProvider, useDiscovery, NAV_ITEMS, STEPS_REQUIRING_PROBLEM } from "./context"
import { SolutionsDrawer } from "./solutions-drawer"
import { Lightbulb, Lock, Check } from "lucide-react"
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

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { problemId, candidates } = useDiscovery()
  const [mounted, setMounted] = useState(false)
  const [solutionsDrawerOpen, setSolutionsDrawerOpen] = useState(false)
  const problemSelected = problemId != null

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-6 flex-1 w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary shrink-0">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-xl font-bold">Solution Discovery</h1>
            <p className="text-sm text-muted-foreground">
              Pick a validated problem and discover solution candidates.
            </p>
          </div>
        </div>
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
      </div>

      <Card>
        <CardContent className="px-6 py-4">
          <Stepper
            pathname={pathname}
            problemSelected={problemSelected}
            onNavigate={(path) => router.push(path)}
          />
        </CardContent>
      </Card>

      <div className="flex-1 min-w-0">{mounted ? children : null}</div>

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
