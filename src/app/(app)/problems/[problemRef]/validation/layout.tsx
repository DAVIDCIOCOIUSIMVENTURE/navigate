"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ProblemHubDialog } from "@/components/problem-hub/problem-hub-dialog"
import { ProblemProvider, useProblem, NAV_ITEMS } from "./context"
import {
  GitFork, Clock, ShieldCheck, FileText, LayoutTemplate, ClipboardCheck, Users, ChevronDown, Eye, Search,
  TrendingUp, Building2, DollarSign,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: ClipboardCheck,
  "customer": Users,
  "existing-solutions": GitFork,
  "context-step": Clock,
  "choose-refinement": Search,
  refine: Search,
  worth: DollarSign,
  market: TrendingUp,
  competition: Building2,
  verdict: ShieldCheck,
  summary: LayoutTemplate,
}

const NAV_ICON_BG: Record<string, string> = {
  introduction: "bg-violet-800",
  customer: "bg-teal-700",
  "choose-refinement": "bg-blue-900",
  refine: "bg-blue-900",
  "existing-solutions": "bg-yellow-600",
  worth: "bg-green-800",
  market: "bg-emerald-800",
  competition: "bg-red-800",
  verdict: "bg-orange-700",
  summary: "bg-violet-800",
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
        const bgClass = NAV_ICON_BG[item.path] ?? "bg-primary"
        return (
          <li key={item.path}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2 hover:text-secondary-brand ${isActive ? "text-secondary-brand" : ""}`}
              onClick={() => onNavigate(href)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", bgClass)}>
                <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

function ViewProblemButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="w-full gap-2" onClick={onClick}>
      <Eye className="h-3.5 w-3.5" />
      View Problem
    </Button>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isWide = useContainerSize() === "wide"

  const base = `/problems/${problemRef}/validation`

  const activeItem = NAV_ITEMS.find((item) => pathname === `${base}/${item.path}`)
  const ActiveIcon = activeItem ? (NAV_ICONS[activeItem.path] ?? FileText) : ClipboardCheck
  const activeBgClass = activeItem ? (NAV_ICON_BG[activeItem.path] ?? "bg-primary") : "bg-violet-800"

  const handleNavigate = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  return (
    <div className={cn("flex flex-col gap-3 flex-1 w-full min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
    {!isWide && (
    <nav aria-label="Problem validation steps" className="w-full">
      <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Card>
          <CardContent className="p-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-2 px-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                  <span className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", activeBgClass)}>
                    <ActiveIcon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
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
                <ViewProblemButton onClick={() => setDialogOpen(true)} />
              </div>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    </nav>
    )}

    <div className={cn("flex gap-6 flex-1 w-full min-h-0", isWide ? "items-stretch" : "items-start")}>
      {isWide && (
      <nav aria-label="Problem validation steps" className="flex w-56 flex-col gap-3 shrink-0">
        <Card>
          <CardContent className="p-3">
            <NavItems base={base} pathname={pathname} onNavigate={handleNavigate} />
            <div className="border-t mt-2 pt-2">
              <ViewProblemButton onClick={() => setDialogOpen(true)} />
            </div>
          </CardContent>
        </Card>
      </nav>
      )}

      <div className={cn("flex-1 min-w-0 flex flex-col", isWide && "min-h-0 overflow-y-auto")}>{children}</div>
    </div>

    <ProblemHubDialog open={dialogOpen} onOpenChange={setDialogOpen} problemRef={problemRef} />
    </div>
  )
}

export default function ProblemRefLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemProvider problemRef={problemRef}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemProvider>
  )
}
