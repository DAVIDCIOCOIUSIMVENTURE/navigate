"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Lightbulb,
  Target,
  Trophy,
  Award,
  Star,
  Crown,
  Search,
  Compass,
  Zap,
  CheckCircle2,
  FlaskConical,
} from "lucide-react"
import { AchievementItem } from "@/components/achievement-item"
import Link from "next/link"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { getProblemLabel } from "@/store/problems-model"

export default function DashboardPage() {
  const triggers = useSelector((state: RootState) => state.problemTriggers.triggers)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)

  const validProblems = problems.filter((p) => p.validationStatus === "valid")
  const validatedProblems = problems.filter(
    (p) => p.validationStatus === "valid" || p.validationStatus === "invalid"
  )
  const completeSolutions = solutions.filter((s) => s.verdict === "pursue")
  // Build recent activity feed sorted by date
  const recentActivity: { id: string; label: string; detail: string; date: string; href: string; type: "problem" | "solution" }[] = []

  for (const p of problems) {
    recentActivity.push({
      id: `p-${p.id}`,
      label: getProblemLabel(p) || p.description || `Problem #${p.id}`,
      detail: p.validationStatus.replace("_", " "),
      date: p.editedAt || p.createdAt,
      href: `/problems/${p.id}`,
      type: "problem",
    })
  }
  for (const s of solutions) {
    const linked = problems.find((p) => p.id === s.problemId)
    recentActivity.push({
      id: `s-${s.id}`,
      label: linked ? (getProblemLabel(linked) || linked.description || `Problem #${linked.id}`) : `Solution #${s.id}`,
      detail: s.verdict === "none" ? (s.status === "not_started" ? "not started" : s.status.replace("_", " ")) : s.verdict,
      date: s.editedAt || s.createdAt,
      href: `/solutions/${s.id}`,
      type: "solution",
    })
  }
  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Dynamic achievements
  const achievements = [
    { icon: Compass, title: "Explorer", description: "Add your first self-discovery trigger", unlocked: triggers.length >= 1, iconBgColor: "bg-teal-100", iconColor: "text-teal-600" },
    { icon: Zap, title: "Trigger Happy", description: "Collect 10 problem triggers", unlocked: triggers.length >= 10, iconBgColor: "bg-amber-100", iconColor: "text-amber-600" },
    { icon: Search, title: "Problem Spotter", description: "Create your first problem", unlocked: problems.length >= 1, iconBgColor: "bg-blue-100", iconColor: "text-blue-600" },
    { icon: Target, title: "Sharp Shooter", description: "Identify 5 distinct problems", unlocked: problems.length >= 5, iconBgColor: "bg-indigo-100", iconColor: "text-indigo-600" },
    { icon: Trophy, title: "Verdict Reached", description: "Validate your first problem", unlocked: validatedProblems.length >= 1, iconBgColor: "bg-green-100", iconColor: "text-green-600" },
    { icon: CheckCircle2, title: "Validated Thinker", description: "Get 3 problems to a verdict", unlocked: validatedProblems.length >= 3, iconBgColor: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: FlaskConical, title: "Solution Seeker", description: "Start your first solution exploration", unlocked: solutions.length >= 1, iconBgColor: "bg-purple-100", iconColor: "text-purple-600" },
    { icon: Award, title: "Innovator", description: "Complete a solution with a pursue verdict", unlocked: completeSolutions.length >= 1, iconBgColor: "bg-rose-100", iconColor: "text-rose-600" },
    { icon: Star, title: "Full Cycle", description: "Trigger, problem, validation, and solution", unlocked: triggers.length >= 1 && validProblems.length >= 1 && completeSolutions.length >= 1, iconBgColor: "bg-yellow-100", iconColor: "text-yellow-600" },
    { icon: Crown, title: "Innovation Master", description: "Pursue 3 or more solutions", unlocked: completeSolutions.length >= 3, iconBgColor: "bg-red-100", iconColor: "text-red-600" },
  ]
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  const activityIcons = { problem: Search, solution: Lightbulb }

  return (
    <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your innovation journey at a glance</p>
        </div>
        <Button asChild>
          <Link href="/problems">
            {problems.length === 0 ? "Start Your Journey" : "Continue Your Journey"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Journey Overview: 4 stage cards in a row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <StageCard
          icon={Compass}
          title="Triggers"
          value={triggers.length}
          href="/self-discovery"
          color="teal"
        />
        <StageCard
          icon={Search}
          title="Problems"
          value={problems.length}
          href="/problems"
          color="blue"
        />
        <StageCard
          icon={Target}
          title="Validated"
          value={validatedProblems.length}
          subtitle={validProblems.length > 0 ? `${validProblems.length} valid` : undefined}
          href="/problems"
          color="indigo"
        />
        <StageCard
          icon={Lightbulb}
          title="Solutions"
          value={solutions.length}
          subtitle={completeSolutions.length > 0 ? `${completeSolutions.length} pursuing` : undefined}
          href="/solutions"
          color="purple"
        />
      </div>

      {/* Recent Activity and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col min-h-[300px] lg:min-h-0">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet.{" "}
                  <Link href="/self-discovery" className="font-medium text-foreground underline underline-offset-2">
                    Start with self discovery
                  </Link>{" "}
                  to get going.
                </p>
              ) : (
                recentActivity.slice(0, 6).map((item) => {
                  const Icon = activityIcons[item.type]
                  return (
                    <Link key={item.id} href={item.href} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate group-hover:underline">{item.label}</p>
                      </div>
                      <StatusBadge status={item.detail} />
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-[300px] lg:min-h-0">
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
    </div>
  )
}

function StageCard({
  icon: Icon,
  title,
  value,
  subtitle,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: number
  subtitle?: string
  href: string
  color: string
}) {
  const bgMap: Record<string, string> = {
    teal: "bg-teal-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
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
            <p className="text-xs text-muted-foreground mt-0.5">{title}{subtitle && <span className="ml-1">({subtitle})</span>}</p>
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
