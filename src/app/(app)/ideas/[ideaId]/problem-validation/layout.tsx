"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProblemValidationProvider, useProblemValidation, NAV_ITEMS } from "./context"
import { useIdeas } from "@/store/ideas-hooks"
import {
  CircleDot, GitFork, Clock, ThumbsDown, Heart, BarChart2, Gavel, FileText, LayoutTemplate, BookOpen,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  "pick-a-problem": CircleDot,
  alternatives: GitFork,
  "context-step": Clock,
  shortcomings: ThumbsDown,
  "emotional-impact": Heart,
  "quantifiable-impact": BarChart2,
  verdict: Gavel,
  "problem-statement": LayoutTemplate,
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { selectedProblemId } = useProblemValidation()
  const { getIdea } = useIdeas()

  const idea = getIdea(ideaId)
  const selectedProblem = idea?.problems.find((p) => p.id === selectedProblemId)
  const validatedCount = idea?.validations.filter(
    (v) => v.status === "valid" || v.status === "invalid"
  ).length ?? 0
  const totalProblems = idea?.problems.filter((p) => p.text.trim()).length ?? 0

  const base = `/ideas/${ideaId}/problem-validation`

  return (
    <div className="flex gap-6 flex-1 w-full items-start">
      <div className="w-56 sticky top-4 flex flex-col gap-3 shrink-0">
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === `${base}/${item.path}`
                const Icon = NAV_ICONS[item.path] ?? FileText
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2"
                    onClick={() => router.push(`${base}/${item.path}`)}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-blue-500" : ""}`} />
                    {item.label}
                  </Button>
                )
              })}
            </div>
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
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">{children}</div>
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
