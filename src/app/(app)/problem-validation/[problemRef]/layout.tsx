"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProblemValidationProvider, useProblemValidation, NAV_ITEMS } from "./context"
import { getProblemLabel } from "@/store/problems-model"
import {
  GitFork, Clock, ThumbsDown, Heart, BarChart2, Gavel, FileText, LayoutTemplate, BookOpen,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  alternatives: GitFork,
  "context-step": Clock,
  shortcomings: ThumbsDown,
  "emotional-impact": Heart,
  "quantifiable-impact": BarChart2,
  verdict: Gavel,
  "problem-statement": LayoutTemplate,
}

const STATUS_COLORS: Record<string, string> = {
  unvalidated: "text-muted-foreground",
  in_progress: "text-yellow-600",
  valid: "text-green-600",
  invalid: "text-red-600",
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problemId, status } = useProblemValidation()
  const problems = useSelector((state: RootState) => state.problems.problems)

  const base = `/problem-validation/${problemRef}`
  const problem = problems.find((p) => p.id === problemId)
  const label = problem ? getProblemLabel(problem) : null

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
          <CardContent className="p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Validating
            </p>
            <div className="flex items-start gap-2 px-1">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm line-clamp-4">{label ?? "—"}</span>
            </div>
            <p className={`text-xs px-1 font-medium capitalize ${STATUS_COLORS[status] ?? ""}`}>
              {status.replace("_", " ")}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground h-7"
              onClick={() => router.push("/problem-validation")}
            >
              ← All problems
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function ProblemRefLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemValidationProvider problemRef={problemRef}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemValidationProvider>
  )
}
