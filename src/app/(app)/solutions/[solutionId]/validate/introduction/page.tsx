"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Gauge, Target, Coins, Clock } from "lucide-react"
import { getAdjacentSteps, useSolutionValidation } from "../context"

const METRICS = [
  { icon: Gauge, title: "Feasibility", description: "How realistic is it to build this solution with the resources and skills available?", bg: "bg-blue-100", color: "text-blue-600" },
  { icon: Target, title: "Impact", description: "How much value does this solution deliver to the customer and to the business?", bg: "bg-green-100", color: "text-green-600" },
  { icon: Coins, title: "Cost", description: "What will this solution cost to build, maintain, and deliver?", bg: "bg-amber-100", color: "text-amber-600" },
  { icon: Clock, title: "Time to Implement", description: "How long will it take to get this solution from idea to delivery?", bg: "bg-purple-100", color: "text-purple-600" },
]

export default function IntroductionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionId, solution, problem } = useSolutionValidation()
  const { nextPath } = getAdjacentSteps(pathname, solutionId)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={BookOpen}>Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-md leading-relaxed">
          Validation helps you decide whether this solution is worth pursuing. You&apos;ll work through four metrics one at a time, each with guidance and case studies to help you reason about it. At the end, you&apos;ll mark the solution as valid, invalid, or unsure.
        </p>

        {solution && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solution</p>
              <p className="text-md font-medium">{solution.title || "Untitled solution"}</p>
              {solution.description && (
                <p className="text-sm text-muted-foreground">{solution.description}</p>
              )}
            </div>
            {problem?.description && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p>
                <p className="text-sm">{problem.description}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-foreground mb-1">What you&apos;ll evaluate</h3>
          <div className="flex flex-col">
            {METRICS.map(({ icon: Icon, title, description, bg, color }, index) => (
              <div key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  {index < METRICS.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-5">
                  <p className="text-md font-medium leading-8">{title}</p>
                  <p className="text-md leading-relaxed">{description}</p>
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
