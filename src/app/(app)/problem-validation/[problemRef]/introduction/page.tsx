"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAdjacentSteps, useProblemValidation } from "../context"
import {
  BookOpen, GitFork, Clock, ThumbsDown, Heart, BarChart2, Gavel, LayoutTemplate,
} from "lucide-react"

const STEPS = [
  { icon: GitFork, title: "Alternatives", description: "Identify how customers currently deal with this problem and what workarounds or competing solutions already exist.", bg: "bg-sky-100 dark:bg-sky-950", color: "text-sky-600 dark:text-sky-400" },
  { icon: Clock, title: "Context", description: "Understand when and where the problem occurs — the specific situations that trigger it.", bg: "bg-violet-100 dark:bg-violet-950", color: "text-violet-600 dark:text-violet-400" },
  { icon: ThumbsDown, title: "Alternatives Shortcomings", description: "Explore why existing solutions fall short and where they leave customers frustrated or underserved.", bg: "bg-orange-100 dark:bg-orange-950", color: "text-orange-600 dark:text-orange-400" },
  { icon: Heart, title: "Emotional Impact", description: "Capture how the problem makes customers feel — the emotional weight that makes it genuinely meaningful to solve.", bg: "bg-pink-100 dark:bg-pink-950", color: "text-pink-600 dark:text-pink-400" },
  { icon: BarChart2, title: "Quantifiable Impact", description: "Measure the tangible cost of the problem in time, money, or other concrete terms.", bg: "bg-amber-100 dark:bg-amber-950", color: "text-amber-600 dark:text-amber-400" },
  { icon: Gavel, title: "Verdict", description: "Decide whether the problem is valid and worth pursuing — or not worth solving right now.", bg: "bg-red-100 dark:bg-red-950", color: "text-red-600 dark:text-red-400" },
  { icon: LayoutTemplate, title: "Problem Statement", description: "Review the problem statement assembled from your discovery and validation work.", bg: "bg-green-100 dark:bg-green-950", color: "text-green-600 dark:text-green-400" },
]

export default function IntroductionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblemValidation()
  const { nextPath } = getAdjacentSteps(pathname, problemRef)

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Problem Validation</h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          It&apos;s time to validate whether this problem is truly worth solving. You&apos;ll stress-test it by examining the alternatives, context, emotional weight, and real-world impact — so you can make a confident, evidence-based decision before committing to a solution.
        </p>

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
                  <p className="text-sm font-medium leading-8">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
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
