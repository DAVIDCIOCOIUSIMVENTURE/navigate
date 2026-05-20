"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ChevronRight,
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
import { ProblemsTable } from "@/components/problems-table"
import { SolutionsTable } from "@/components/solutions-table"
import Link from "next/link"
import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const triggers = useSelector((state: RootState) => state.selfDiscoveryItems.items)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const [problemDialogOpen, setProblemDialogOpen] = useState(false)
  const [solutionDialogOpen, setSolutionDialogOpen] = useState(false)
  const [view, setView] = useState<"problems" | "solutions">("problems")

  const validProblems = problems.filter((p) => p.validationStatus === "valid")
  const validatedProblems = problems.filter(
    (p) => p.validationStatus === "valid" || p.validationStatus === "invalid"
  )
  const completeSolutions = solutions.filter((s) => s.validationStatus === "valid")
  const validatedSolutions = solutions.filter(
    (s) => s.validationStatus === "valid" || s.validationStatus === "invalid"
  )

  // Dynamic achievements
  const achievements = [
    { icon: Compass, title: "Explorer", description: "Add your first self-discovery trigger", unlocked: triggers.length >= 1, iconBgColor: "bg-teal-700", iconColor: "text-white" },
    { icon: Zap, title: "Trigger Happy", description: "Collect 10 problem triggers", unlocked: triggers.length >= 10, iconBgColor: "bg-yellow-600", iconColor: "text-white" },
    { icon: Target, title: "Problem Spotter", description: "Create your first problem", unlocked: problems.length >= 1, iconBgColor: "bg-blue-900", iconColor: "text-white" },
    { icon: Crosshair, title: "Sharp Shooter", description: "Identify 5 distinct problems", unlocked: problems.length >= 5, iconBgColor: "bg-indigo-800", iconColor: "text-white" },
    { icon: Trophy, title: "Verdict Reached", description: "Validate your first problem", unlocked: validatedProblems.length >= 1, iconBgColor: "bg-green-800", iconColor: "text-white" },
    { icon: CheckCircle2, title: "Validated Thinker", description: "Get 3 problems to a verdict", unlocked: validatedProblems.length >= 3, iconBgColor: "bg-emerald-800", iconColor: "text-white" },
    { icon: FlaskConical, title: "Solution Seeker", description: "Start your first solution exploration", unlocked: solutions.length >= 1, iconBgColor: "bg-violet-800", iconColor: "text-white" },
    { icon: Award, title: "Innovator", description: "Validate a solution as valid", unlocked: completeSolutions.length >= 1, iconBgColor: "bg-rose-800", iconColor: "text-white" },
    { icon: Star, title: "Full Cycle", description: "Trigger, problem, validation, and solution", unlocked: triggers.length >= 1 && validProblems.length >= 1 && completeSolutions.length >= 1, iconBgColor: "bg-orange-700", iconColor: "text-white" },
    { icon: Crown, title: "Innovation Master", description: "Validate 3 or more solutions as valid", unlocked: completeSolutions.length >= 3, iconBgColor: "bg-red-800", iconColor: "text-white" },
  ]
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  const isWide = useContainerSize() === "wide"

  return (
    <div className={cn("flex flex-col gap-4 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      {/* Foundations + Self Discovery prompts + action buttons */}
      <div className={cn("flex gap-3 shrink-0", isWide ? "flex-row items-stretch" : "flex-col items-stretch")}>
        <div className={cn("flex gap-3 flex-1 min-w-0", isWide ? "flex-row" : "flex-col")}>
          <Link href="/foundations" className="flex-1 min-w-0 flex">
            <Card className="hover:shadow-md transition-shadow w-full">
              <CardContent className="p-4 h-full flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold">New here? Start with Why It Matters</p>
                  <p className="text-sm mt-0.5">Optional reading on why validating ideas, problems, and solutions is worth the time.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/self-discovery" className="flex-1 min-w-0 flex">
            <Card className="hover:shadow-md transition-shadow w-full">
              <CardContent className="p-4 h-full flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-700/10 shrink-0">
                  <Compass className="h-4 w-4 text-teal-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold">Explore Self Discovery</p>
                  <p className="text-sm mt-0.5">Surface interests, skills, and experiences that point you toward problems worth solving.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className={cn("flex gap-2 shrink-0", isWide ? "flex-col" : "flex-row")}>
          <Button onClick={() => setProblemDialogOpen(true)} className={cn("gap-2", !isWide && "flex-1")}>
            <Plus className="h-4 w-4" />
            Identify problems
          </Button>
          <Button onClick={() => setSolutionDialogOpen(true)} className={cn("gap-2", !isWide && "flex-1")}>
            <Plus className="h-4 w-4" />
            Identify solutions
          </Button>
        </div>
      </div>

      {/* Journey Overview: Problems, Validated Problems, Solutions, Validated Solutions */}
      <div className={cn("grid gap-3 shrink-0", isWide ? "grid-cols-4" : "grid-cols-1")}>
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

      {/* Problems / Solutions table (toggleable) and Achievements */}
      <div className={cn("grid gap-4 flex-1 min-h-0", isWide ? "grid-cols-3 grid-rows-1" : "grid-cols-1")}>
        {(() => {
          const tableClassName = cn(isWide ? "min-h-0 col-span-2" : "min-h-[320px] max-h-[640px]")
          const viewToggle = (
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => {
                if (value === "problems" || value === "solutions") setView(value)
              }}
              size="sm"
              className="shrink-0 bg-card border-border divide-x divide-border"
            >
              <ToggleGroupItem
                value="problems"
                aria-label="Show problems"
                className="gap-1.5 px-3 rounded-none bg-card data-[state=on]:bg-secondary-brand data-[state=on]:text-secondary-brand-foreground"
              >
                <Target className="h-3.5 w-3.5" />
                <span>Problems</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="solutions"
                aria-label="Show solutions"
                className="gap-1.5 px-3 rounded-none bg-card data-[state=on]:bg-secondary-brand data-[state=on]:text-secondary-brand-foreground"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Solutions</span>
              </ToggleGroupItem>
            </ToggleGroup>
          )
          return view === "problems" ? (
            <ProblemsTable
              problems={problems}
              showStatus
              showEditDelete
              showSource={false}
              className={tableClassName}
              headerExtra={viewToggle}
            />
          ) : (
            <SolutionsTable
              solutions={solutions}
              showStatus
              showEditDelete
              className={tableClassName}
              headerExtra={viewToggle}
            />
          )
        })()}

        <Card className={cn("flex flex-col", isWide ? "min-h-0" : "min-h-[320px] max-h-[640px]")}>
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Achievements</CardTitle>
              <span className="text-sm">{unlockedCount}/{achievements.length}</span>
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
    teal: "bg-teal-700",
    blue: "bg-blue-900",
    indigo: "bg-indigo-800",
    purple: "bg-violet-800",
    green: "bg-green-800",
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
            <p className="text-sm mt-0.5">{title}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

