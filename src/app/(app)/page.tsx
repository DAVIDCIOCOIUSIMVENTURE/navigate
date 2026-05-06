"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Target,
  Trophy,
  Award,
  Star,
  Crown,
  Compass,
  Zap,
  CheckCircle2,
  FlaskConical,
  Crosshair,
  BookOpen,
  Plus,
} from "lucide-react"
import { AchievementItem } from "@/components/achievement-item"
import { SearchProblemDialog } from "@/components/search-problem-dialog"
import { SearchSolutionDialog } from "@/components/search-solution-dialog"
import Link from "next/link"
import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { getProblemLabel } from "@/store/problems-model"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const triggers = useSelector((state: RootState) => state.selfDiscoveryItems.items)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const customByColumn = useSelector((state: RootState) => state.customBrainstormItems.byColumn)
  const [expandedProblemIds, setExpandedProblemIds] = useState<Set<number>>(new Set())
  const [problemDialogOpen, setProblemDialogOpen] = useState(false)
  const [solutionDialogOpen, setSolutionDialogOpen] = useState(false)

  const validProblems = problems.filter((p) => p.validationStatus === "valid")
  const validatedProblems = problems.filter(
    (p) => p.validationStatus === "valid" || p.validationStatus === "invalid"
  )
  const completeSolutions = solutions.filter((s) => s.validationStatus === "valid")
  const validatedSolutions = solutions.filter(
    (s) => s.validationStatus === "valid" || s.validationStatus === "invalid"
  )

  const sortedProblems = [...problems].sort(
    (a, b) =>
      new Date(b.editedAt || b.createdAt).getTime() -
      new Date(a.editedAt || a.createdAt).getTime()
  )

  const toggleProblemExpanded = (id: number) => {
    setExpandedProblemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Dynamic achievements
  const achievements = [
    { icon: Compass, title: "Explorer", description: "Add your first self-discovery trigger", unlocked: triggers.length >= 1, iconBgColor: "bg-teal-100", iconColor: "text-teal-600" },
    { icon: Zap, title: "Trigger Happy", description: "Collect 10 problem triggers", unlocked: triggers.length >= 10, iconBgColor: "bg-amber-100", iconColor: "text-amber-600" },
    { icon: Target, title: "Problem Spotter", description: "Create your first problem", unlocked: problems.length >= 1, iconBgColor: "bg-blue-100", iconColor: "text-blue-600" },
    { icon: Crosshair, title: "Sharp Shooter", description: "Identify 5 distinct problems", unlocked: problems.length >= 5, iconBgColor: "bg-indigo-100", iconColor: "text-indigo-600" },
    { icon: Trophy, title: "Verdict Reached", description: "Validate your first problem", unlocked: validatedProblems.length >= 1, iconBgColor: "bg-green-100", iconColor: "text-green-600" },
    { icon: CheckCircle2, title: "Validated Thinker", description: "Get 3 problems to a verdict", unlocked: validatedProblems.length >= 3, iconBgColor: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: FlaskConical, title: "Solution Seeker", description: "Start your first solution exploration", unlocked: solutions.length >= 1, iconBgColor: "bg-purple-100", iconColor: "text-purple-600" },
    { icon: Award, title: "Innovator", description: "Validate a solution as valid", unlocked: completeSolutions.length >= 1, iconBgColor: "bg-rose-100", iconColor: "text-rose-600" },
    { icon: Star, title: "Full Cycle", description: "Trigger, problem, validation, and solution", unlocked: triggers.length >= 1 && validProblems.length >= 1 && completeSolutions.length >= 1, iconBgColor: "bg-yellow-100", iconColor: "text-yellow-600" },
    { icon: Crown, title: "Innovation Master", description: "Validate 3 or more solutions as valid", unlocked: completeSolutions.length >= 3, iconBgColor: "bg-red-100", iconColor: "text-red-600" },
  ]
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  const isWide = useContainerSize() === "wide"

  return (
    <div className={cn("flex flex-col gap-4 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      {/* Foundations prompt + action buttons */}
      <div className="flex items-stretch gap-3 shrink-0">
        <Link href="/foundations" className="flex-1 min-w-0 flex">
          <Card className="hover:shadow-md transition-shadow w-full">
            <CardContent className="p-4 h-full flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">New here? Start with Why It Matters</p>
                <p className="text-xs text-muted-foreground mt-0.5">Optional reading on why validating ideas, problems, and solutions is worth the time.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <div className="flex flex-col gap-2 shrink-0">
          <Button onClick={() => setProblemDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Identify problems
          </Button>
          <Button onClick={() => setSolutionDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Identify solutions
          </Button>
        </div>
      </div>

      {/* Journey Overview: Problems, Validated Problems, Solutions, Validated Solutions */}
      <div className={cn("grid gap-3 shrink-0", isWide ? "grid-cols-4" : "grid-cols-2")}>
        <StageCard
          icon={Target}
          title="Problems"
          value={problems.length}
          href="/problems"
          color="blue"
        />
        <StageCard
          icon={CheckCircle2}
          title="Validated Problems"
          value={validatedProblems.length}
          href="/problems"
          color="green"
        />
        <StageCard
          icon={Lightbulb}
          title="Solutions"
          value={solutions.length}
          href="/solutions"
          color="purple"
        />
        <StageCard
          icon={CheckCircle2}
          title="Validated Solutions"
          value={validatedSolutions.length}
          href="/solutions"
          color="green"
        />
      </div>

      {/* Problems list (expandable) and Achievements */}
      <div className={cn("grid gap-4 flex-1 min-h-0", isWide ? "grid-cols-3 grid-rows-1" : "grid-cols-1")}>
        <Card className={cn("flex flex-col", isWide ? "min-h-0 col-span-2" : "min-h-[320px] max-h-[640px]")}>
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">Problems &amp; Solutions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto">
            {sortedProblems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No problems yet.{" "}
                <Link href="/problems" className="font-medium text-foreground underline underline-offset-2">
                  Add a problem
                </Link>{" "}
                to get going.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedProblems.map((p) => {
                  const linkedSolutions = solutions.filter((s) => s.problemId === p.id)
                  const hasSolutions = linkedSolutions.length > 0
                  const expanded = expandedProblemIds.has(p.id)
                  const label = p.description || getProblemLabel(p, customByColumn, triggers) || `Problem #${p.id}`
                  return (
                    <div key={p.id} className="rounded-md border border-border">
                      <div className="flex items-center gap-2 px-3 py-2">
                        {hasSolutions ? (
                          <button
                            type="button"
                            onClick={() => toggleProblemExpanded(p.id)}
                            className="shrink-0 flex items-center justify-center w-5 h-5 rounded hover:bg-muted text-muted-foreground"
                            aria-label={expanded ? "Collapse solutions" : "Expand solutions"}
                            aria-expanded={expanded}
                          >
                            {expanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                        ) : (
                          <div className="w-5 h-5 shrink-0" />
                        )}
                        <Target className="h-4 w-4 text-primary shrink-0" />
                        <Link
                          href={`/problems/${p.id}`}
                          className="flex-1 min-w-0 text-sm truncate hover:underline"
                        >
                          {label}
                        </Link>
                        {hasSolutions && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {linkedSolutions.length} solution{linkedSolutions.length === 1 ? "" : "s"}
                          </span>
                        )}
                        <StatusBadge status={p.validationStatus.replace("_", " ")} />
                      </div>
                      {hasSolutions && expanded && (
                        <div className="border-t border-border bg-muted/30 px-3 py-2 space-y-1.5">
                          {linkedSolutions.map((s) => {
                            const solutionLabel = s.title || `Solution #${s.id}`
                            return (
                              <Link
                                key={s.id}
                                href={`/solutions/${s.id}`}
                                className="flex items-center gap-2 group pl-7"
                              >
                                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="flex-1 min-w-0 text-sm truncate group-hover:underline">
                                  {solutionLabel}
                                </span>
                                <StatusBadge status={s.validationStatus.replace("_", " ")} />
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn("flex flex-col", isWide ? "min-h-0" : "min-h-[320px] max-h-[640px]")}>
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Achievements</CardTitle>
              <span className="text-xs text-muted-foreground">{unlockedCount}/{achievements.length}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-3">
              {achievements.map((a) => (
                <AchievementItem
                  key={a.title}
                  icon={a.icon}
                  title={a.title}
                  description={a.description}
                  iconBgColor={a.iconBgColor}
                  iconColor={a.iconColor}
                  unlocked={a.unlocked}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <SearchProblemDialog open={problemDialogOpen} onOpenChange={setProblemDialogOpen} />
      <SearchSolutionDialog open={solutionDialogOpen} onOpenChange={setSolutionDialogOpen} />
    </div>
  )
}

function StageCard({
  icon: Icon,
  title,
  value,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: number
  href: string
  color: string
}) {
  const bgMap: Record<string, string> = {
    teal: "bg-teal-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  }

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${value > 0 ? bgMap[color] : "bg-muted"}`}>
            <Icon className={`h-4 w-4 ${value > 0 ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const statusColors: Record<string, string> = {
  unvalidated: "bg-gray-100 text-gray-700",
  "in progress": "bg-amber-100 text-amber-700",
  valid: "bg-green-100 text-green-700",
  invalid: "bg-red-100 text-red-700",
  unsure: "bg-yellow-100 text-yellow-700",
  "not started": "bg-gray-100 text-gray-700",
  pursue: "bg-green-100 text-green-700",
  revisit: "bg-amber-100 text-amber-700",
  abandon: "bg-red-100 text-red-700",
}

function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] ?? "bg-gray-100 text-gray-700"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize shrink-0 ${colors}`}>
      {status}
    </span>
  )
}
