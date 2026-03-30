"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { ProblemValidationProvider, useProblemValidation, NAV_ITEMS } from "./context"
import { useIdeas } from "@/store/ideas-hooks"
import {
  CircleDot, GitFork, ThumbsDown, Heart, BarChart2, Gavel, FileText, LayoutTemplate, BookOpen,
  ChevronDown, Eye,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  "pick-a-problem": CircleDot,
  alternatives: GitFork,
  shortcomings: ThumbsDown,
  "emotional-impact": Heart,
  "quantifiable-impact": BarChart2,
  verdict: Gavel,
  "problem-statement": LayoutTemplate,
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
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2"
              onClick={() => onNavigate(href)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-blue-500" : ""}`} aria-hidden="true" />
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
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { selectedProblemId } = useProblemValidation()
  const { getIdea } = useIdeas()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const idea = getIdea(ideaId)
  const allProblems = idea?.jobs.flatMap((j) => j.problems) ?? []
  const selectedProblem = allProblems.find((p) => p.id === selectedProblemId)
  const validatedCount = allProblems.filter(
    (p) => p.validationStatus === "valid" || p.validationStatus === "invalid"
  ).length
  const totalProblems = allProblems.filter((p) => p.text.trim()).length

  const base = `/ideas/${ideaId}/problem-validation`

  const activeItem = NAV_ITEMS.find((item) => pathname === `${base}/${item.path}`)
  const ActiveIcon = activeItem ? (NAV_ICONS[activeItem.path] ?? FileText) : BookOpen

  const handleNavigate = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full items-start">
      {/* Mobile: collapsible top bar */}
      <nav aria-label="Problem validation steps" className="lg:hidden w-full">
        <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <Card>
            <CardContent className="p-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-2 px-3"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <ActiveIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
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

                {(selectedProblem || totalProblems > 0) && (
                  <div className="border-t mt-2 pt-2 px-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Validating Problem
                    </p>
                    <div className="flex items-start gap-2 py-1">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      {selectedProblem ? (
                        <span className="text-sm line-clamp-2">{selectedProblem.text}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Not selected</span>
                      )}
                    </div>
                    {totalProblems > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {validatedCount} of {totalProblems} validated
                      </p>
                    )}
                    {selectedProblem && (
                      <div className="mt-2">
                        <ViewProblemButton onClick={() => setDialogOpen(true)} />
                      </div>
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      </nav>

      {/* Desktop: sidebar */}
      <nav aria-label="Problem validation steps" className="hidden lg:flex w-56 sticky top-4 flex-col gap-3 shrink-0">
        <Card>
          <CardContent className="p-3">
            <NavItems base={base} pathname={pathname} onNavigate={handleNavigate} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Validating Problem
            </p>
            <div className="flex items-start gap-2 px-1 py-1">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              {selectedProblem ? (
                <span className="text-sm line-clamp-4">{selectedProblem.text}</span>
              ) : (
                <span className="text-sm text-muted-foreground italic">Not selected</span>
              )}
            </div>
            {totalProblems > 0 && (
              <p className="text-xs text-muted-foreground px-1 mt-1">
                {validatedCount} of {totalProblems} validated
              </p>
            )}
            {selectedProblem && (
              <div className="px-1 mt-2">
                <ViewProblemButton onClick={() => setDialogOpen(true)} />
              </div>
            )}
          </CardContent>
        </Card>
      </nav>

      <div className="flex-1">{children}</div>

      {selectedProblem && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Problem Summary</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Problem</p>
                <p className="text-sm">{selectedProblem.text}</p>
              </div>
              {selectedProblem.contextWhen && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Context</p>
                  <p className="text-sm">{selectedProblem.contextWhen}</p>
                </div>
              )}
              {selectedProblem.emotionalImpact && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Emotional Impact</p>
                  <p className="text-sm">{selectedProblem.emotionalImpact}</p>
                </div>
              )}
              {selectedProblem.existingSolutions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Existing Solutions</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedProblem.existingSolutions.map((sol) => (
                      <li key={sol.id}>{sol.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedProblem.impacts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Impacts</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedProblem.impacts.map((impact, i) => (
                      <li key={i}>
                        <span className="font-medium">{impact.category}:</span> {impact.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Status: {selectedProblem.validationStatus}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default function ProblemValidationLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const ideaId = Number(params.ideaId)

  return (
    <ProblemValidationProvider ideaId={ideaId}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemValidationProvider>
  )
}
