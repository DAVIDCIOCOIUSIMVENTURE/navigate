"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAdjacentSteps, useProblemValidation } from "../context"
import {
  BookOpen, GitFork, ShieldCheck, LayoutTemplate, Users,
} from "lucide-react"

const STEPS = [
  { icon: Users, title: "Define your customer", description: "Estimate how large the affected customer segment is, the market opportunity behind this problem.", bg: "bg-indigo-100 dark:bg-indigo-950", color: "text-indigo-600 dark:text-indigo-400" },
  { icon: GitFork, title: "Explore existing solutions", description: "Identify how customers currently deal with this problem, capture shortcomings, and measure the quantifiable impact of each solution.", bg: "bg-sky-100 dark:bg-sky-950", color: "text-sky-600 dark:text-sky-400" },
  { icon: ShieldCheck, title: "Validate your problem", description: "Weigh the economics of solving this problem and decide whether it's worth pursuing.", bg: "bg-orange-100 dark:bg-orange-950", color: "text-orange-600 dark:text-orange-400" },
  { icon: LayoutTemplate, title: "Summary", description: "Review the problem statement assembled from your discovery and validation work.", bg: "bg-green-100 dark:bg-green-950", color: "text-green-600 dark:text-green-400" },
]

function FieldRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="rounded-md bg-background px-2 py-0.5 text-xs border">{v}</span>
        ))}
      </div>
    </div>
  )
}

export default function IntroductionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problemId } = useProblemValidation()
  const { nextPath } = getAdjacentSteps(pathname, problemRef)
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={BookOpen}>Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">

        <p className="text-md text-muted-foreground leading-relaxed">
          It&apos;s time to validate whether this problem is truly worth solving. You&apos;ll stress-test it by examining the alternatives, context, emotional weight, and real-world impact, so you can make a confident, evidence-based decision before committing to a solution.
        </p>

        {problem && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
            {problem.description && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem Description</p>
                <p className="text-md font-medium">{problem.description}</p>
              </div>
            )}
            <FieldRow label="Customer Segments" values={problem.customerSegments} />
            <FieldRow label="Context" values={problem.contexts} />
            <FieldRow label="Jobs to Be Done" values={problem.jobsToBeDone} />
            <FieldRow label="Problem Types" values={problem.problemTypes} />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What you&apos;ll work through</p>
          <div className="flex flex-col">
            {STEPS.map(({ icon: Icon, title, description, bg, color }, index) => (
              <div key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-5">
                  <p className="text-md font-medium leading-8">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-2">
          {nextPath && <Button onClick={() => router.push(nextPath)}>Get Started</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
