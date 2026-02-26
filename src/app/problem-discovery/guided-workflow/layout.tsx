"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { WorkflowProvider, useWorkflow, NAV_ITEMS, BASE } from "./context"
import {
  BookOpen,
  Users,
  Briefcase,
  CircleDot,
  GitFork,
  Clock,
  ThumbsDown,
  Heart,
  BarChart2,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  customers: Users,
  "jobs-to-be-done": Briefcase,
  problems: AlertCircle,
  "pick-a-problem": CircleDot,
  alternatives: GitFork,
  context: Clock,
  shortcomings: ThumbsDown,
  "emotional-impact": Heart,
  "quantifiable-impact": BarChart2,
  summary: CheckCircle2,
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { problems, selectedProblemId } = useWorkflow()

  const selectedProblem = problems.find((p) => p.id === selectedProblemId)

  return (
    <div className="flex gap-6 flex-1 w-full items-start">
      <div className="w-56 sticky top-4 flex flex-col gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === `${BASE}/${item.path}`
                const Icon = NAV_ICONS[item.path] ?? FileText
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2"
                    onClick={() => router.push(`${BASE}/${item.path}`)}
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
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Problem</p>
            <div className="flex items-start gap-2 px-1 py-1">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              {selectedProblem ? (
                <span className="text-sm line-clamp-4">{selectedProblem.text}</span>
              ) : (
                <span className="text-sm text-muted-foreground italic">Not set</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function GuidedWorkflowLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkflowProvider>
      <LayoutContent>{children}</LayoutContent>
    </WorkflowProvider>
  )
}
