"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSolution, getAdjacentSteps } from "../context"
import { BookOpen, Search, Shuffle, BarChart2 } from "lucide-react"

const STEPS = [
  {
    icon: Search,
    title: "Root Cause Analysis",
    description: "Dig deeper into the problem. Identify root causes using techniques like the 5 Whys, and map out who is most affected.",
    bg: "bg-indigo-100 dark:bg-indigo-950",
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Shuffle,
    title: "Solution Discovery",
    description: "Use creative brainstorming techniques — SCAMPER, reverse brainstorming, and analogy thinking — to generate solution candidates.",
    bg: "bg-sky-100 dark:bg-sky-950",
    color: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: BarChart2,
    title: "Solution Analysis",
    description: "Score your solution candidates on feasibility, impact, cost, and time. Compare them and pick the best one to pursue.",
    bg: "bg-green-100 dark:bg-green-950",
    color: "text-green-600 dark:text-green-400",
  },
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
  const { solutionRef, problem } = useSolution()
  const { nextPath } = getAdjacentSteps(pathname, solutionRef)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={BookOpen}>Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-md leading-relaxed">
          Now that you&apos;ve validated your problem, it&apos;s time to find a solution. You&apos;ll first analyse the problem deeper to understand its root causes, then use creative techniques to brainstorm solutions, and finally evaluate which solution is worth pursuing.
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
                  <p className="text-xs leading-relaxed">{description}</p>
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
