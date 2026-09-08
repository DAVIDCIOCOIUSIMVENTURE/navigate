"use client"

import { useEffect, useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ProblemHubDialog } from "@/components/problem-hub/problem-hub-dialog"
import { SolutionHubDialog } from "@/components/solution-hub/solution-hub-dialog"
import { SolutionProvider, useSolution, NAV_ITEMS } from "./context"
import {
  ClipboardCheck, Gauge, Target, Coins, Clock, CheckCircle2, LayoutTemplate,
  FileText, ChevronDown, Eye, Lightbulb,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { NAV_ITEM_ACTIVE_CLASS, NAV_ITEM_HOVER_CLASS, navIconClass, navIconTileClass } from "@/lib/nav-item-styles"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: ClipboardCheck,
  feasibility: Gauge,
  impact: Target,
  cost: Coins,
  "time-to-implement": Clock,
  verdict: CheckCircle2,
  review: LayoutTemplate,
}

function NavItems({
  base,
  pathname,
  onNavigate,
}: {
  base: string
  pathname: string
  onNavigate: (path: string) => void
}) {
  return (
    <ul className="flex flex-col gap-1 list-none m-0 p-0" role="list">
      {NAV_ITEMS.map((item) => {
        const href = `${base}/${item.path}`
        const isActive = pathname === href
        const Icon = NAV_ICONS[item.path] ?? FileText
        return (
          <li key={item.path}>
            {item.section && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">
                {item.section}
              </p>
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2",
                NAV_ITEM_HOVER_CLASS,
                isActive && NAV_ITEM_ACTIVE_CLASS,
              )}
              onClick={() => onNavigate(href)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={navIconTileClass(isActive)}>
                <Icon className={navIconClass(isActive)} aria-hidden="true" />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

function SidebarActions({ onOpenSolution, onOpenProblem }: { onOpenSolution: () => void; onOpenProblem: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="sm" className="w-full gap-2" onClick={onOpenSolution}>
        <Lightbulb className="h-3.5 w-3.5" />
        View Solution
      </Button>
      <Button variant="outline" size="sm" className="w-full gap-2" onClick={onOpenProblem}>
        <Eye className="h-3.5 w-3.5" />
        View Problem
      </Button>
    </div>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionId, problem } = useSolution()
  const [solutionDialogOpen, setSolutionDialogOpen] = useState(false)
  const [problemDialogOpen, setProblemDialogOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isWide = useContainerSize() === "wide"

  useEffect(() => {
    setMounted(true)
  }, [])

  const base = `/solutions/${solutionId}/validate`

  const activeItem = NAV_ITEMS.find((item) => pathname === `${base}/${item.path}`)
  const ActiveIcon = activeItem ? (NAV_ICONS[activeItem.path] ?? FileText) : ClipboardCheck

  const handleNavigate = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  return (
    <div className={cn("flex flex-col gap-3 flex-1 w-full min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      {!isWide && (
      <nav aria-label="Solution validation steps" className="w-full">
        <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <Card>
            <CardContent className="p-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-2 px-3"
                >
                  <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                    <span className={navIconTileClass(true)}>
                      <ActiveIcon className={navIconClass(true)} aria-hidden="true" />
                    </span>
                    <span className="truncate">{activeItem?.label ?? "Navigation"}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      mobileNavOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1">
                <NavItems base={base} pathname={pathname} onNavigate={handleNavigate} />
                <div className="border-t mt-2 pt-2 px-1">
                  <SidebarActions
                    onOpenSolution={() => setSolutionDialogOpen(true)}
                    onOpenProblem={() => setProblemDialogOpen(true)}
                  />
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      </nav>
      )}

      <div className={cn("flex gap-6 flex-1 w-full min-h-0", isWide ? "items-stretch" : "items-start")}>
        {isWide && (
        <nav aria-label="Solution validation steps" className="flex w-56 flex-col gap-3 shrink-0 min-h-0">
          <Card className="flex flex-col min-h-0 flex-1">
            <CardContent className="p-3 flex flex-col min-h-0 flex-1">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <NavItems base={base} pathname={pathname} onNavigate={handleNavigate} />
              </div>
              <div className="border-t mt-2 pt-2 shrink-0">
                <SidebarActions
                  onOpenSolution={() => setSolutionDialogOpen(true)}
                  onOpenProblem={() => setProblemDialogOpen(true)}
                />
              </div>
            </CardContent>
          </Card>
        </nav>
        )}

        <div className={cn("flex-1 min-w-0 flex flex-col", isWide && "min-h-0 overflow-y-auto")}>{mounted ? children : null}</div>
      </div>

      <SolutionHubDialog
        open={solutionDialogOpen}
        onOpenChange={setSolutionDialogOpen}
        solutionId={solutionId}
      />
      <ProblemHubDialog
        open={problemDialogOpen}
        onOpenChange={setProblemDialogOpen}
        problemRef={problem ? String(problem.id) : null}
      />
    </div>
  )
}

export default function ValidateLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const solutionId = Number(params.solutionId)

  return (
    <SolutionProvider solutionId={solutionId}>
      <LayoutContent>{children}</LayoutContent>
    </SolutionProvider>
  )
}
