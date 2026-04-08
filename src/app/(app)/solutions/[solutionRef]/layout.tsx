"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ProblemSummaryDialog, type ProblemSummaryData } from "@/components/problem-summary-dialog"
import { SolutionProvider, useSolution, NAV_ITEMS } from "./context"
import {
  Lightbulb, BookOpen, Search, Shuffle, BarChart2, LayoutTemplate,
  FileText, ChevronDown, Eye,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  "choose-refinement": Search,
  refine: Search,
  "choose-discovery": Shuffle,
  discover: Shuffle,
  analysis: BarChart2,
  summary: LayoutTemplate,
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
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2 ${isActive ? "text-primary" : ""}`}
              onClick={() => onNavigate(href)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : ""}`} aria-hidden="true" />
              {item.label}
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
  const { solutionRef, problemId } = useSolution()
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  ) ?? null
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const summaryData: ProblemSummaryData | null = problem
    ? {
        text: problem.description,
        tags: [
          { label: "Customer Segments", values: problem.customerSegments },
          { label: "Contexts", values: problem.contexts },
          { label: "Jobs to be Done", values: problem.jobsToBeDone },
          { label: "Problem Types", values: problem.problemTypes },
        ],
        context: problem.contextWhen,
        emotionalImpact: problem.emotionalImpact,
        existingSolutions: problem.existingSolutions,
        validationStatus: problem.validationStatus,
        reason: problem.validationReason,
        assessment: problem.validationAssessment,
      }
    : null

  const base = `/solutions/${solutionRef}`

  const activeItem = NAV_ITEMS.find((item) => pathname === `${base}/${item.path}`)
  const ActiveIcon = activeItem ? (NAV_ICONS[activeItem.path] ?? FileText) : BookOpen

  const handleNavigate = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  return (
    <div className="flex flex-col gap-6 flex-1 w-full">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary shrink-0">
          <Lightbulb className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Solution Discovery</h1>
          <p className="text-sm text-muted-foreground">
            Refine your problem and discover effective solutions.
          </p>
        </div>
      </div>

      {/* Mobile: collapsible top bar */}
      <nav aria-label="Solution discovery steps" className="lg:hidden w-full">
        <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <Card>
            <CardContent className="p-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-2 px-3"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <ActiveIcon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {activeItem?.label ?? "Navigation"}
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

      <div className="flex gap-6 flex-1 w-full items-start">
        {/* Desktop: sidebar */}
        <nav aria-label="Solution discovery steps" className="hidden lg:flex w-56 flex-col gap-3 shrink-0">
          <Card>
            <CardContent className="p-3">
              <NavItems base={base} pathname={pathname} onNavigate={handleNavigate} />
              <div className="border-t mt-2 pt-2">
                <ViewProblemButton onClick={() => setDialogOpen(true)} />
              </div>
            </CardContent>
          </Card>
        </nav>

        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <ProblemSummaryDialog open={dialogOpen} onOpenChange={setDialogOpen} data={summaryData} />
    </div>
  )
}

export default function SolutionRefLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const solutionRef = params.solutionRef as string

  return (
    <SolutionProvider solutionRef={solutionRef}>
      <LayoutContent>{children}</LayoutContent>
    </SolutionProvider>
  )
}
