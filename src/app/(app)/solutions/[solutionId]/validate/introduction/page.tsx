"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, Gauge, Target, Coins, Clock } from "lucide-react"
import { getAdjacentSteps, useSolution } from "../context"

const METRICS = [
  { icon: Gauge, title: "Feasibility", description: "How realistic is it to build this solution with the resources and skills available?" },
  { icon: Target, title: "Impact", description: "How much value does this solution deliver to the customer and to the business?" },
  { icon: Coins, title: "Cost", description: "What will this solution cost to build, maintain, and deliver?" },
  { icon: Clock, title: "Time to Implement", description: "How long will it take to get this solution from idea to delivery?" },
]

export default function IntroductionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionId, solution, problem } = useSolution()
  const { nextPath } = getAdjacentSteps(pathname, solutionId)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={ClipboardCheck} iconBg="bg-secondary-brand">Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="@container">
          <div className="flex flex-col gap-6 @[800px]:flex-row @[800px]:items-center">
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <p className="text-base leading-relaxed">
                Validation helps you decide whether this solution is worth pursuing. You&apos;ll work through four metrics one at a time, each with guidance and case studies to help you reason about it. At the end, you&apos;ll mark the solution as valid, invalid, or unsure.
              </p>
              <p className="text-base leading-relaxed">
                The aim is not to fall in love with the solution; it is to stress-test it against feasibility, impact, cost, and time so you can commit to building it (or walk away) with your eyes open.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/16-success.svg"
              alt=""
              className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
            />
          </div>
        </div>

        {solution && (
          <div className="rounded-lg border-2 border-secondary-brand/20 bg-secondary-brand/5 p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold uppercase tracking-wide">Solution</p>
              <p className="text-base font-medium">{solution.title || "Untitled solution"}</p>
              {solution.description && (
                <p className="text-base">{solution.description}</p>
              )}
            </div>
            {problem && (problem.title || problem.description) && (
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold uppercase tracking-wide">Problem</p>
                <p className="text-base font-medium">{problem.title || "Untitled problem"}</p>
                {problem.description && (
                  <p className="text-base">{problem.description}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-foreground mb-1">What you&apos;ll evaluate</h3>
          <div className="flex flex-col">
            {METRICS.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-brand">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  {index < METRICS.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-5">
                  <p className="text-base font-medium leading-8">{title}</p>
                  <p className="text-base leading-relaxed">{description}</p>
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
