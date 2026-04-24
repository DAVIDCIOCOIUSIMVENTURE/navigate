"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAdjacentSteps } from "../context"
import { BookOpen, Target, Search, Lightbulb } from "lucide-react"

const STEPS = [
  {
    icon: Target,
    title: "Select a Problem",
    description: "Pick a validated problem from your Problem Bank to anchor the discovery process.",
    bg: "bg-primary/10",
    color: "text-primary",
  },
  {
    icon: Search,
    title: "Refine",
    description: "Choose a refinement technique (Root Causes, 5 Whys, or Affected Groups) to dig deeper into why the problem exists and who it impacts.",
    bg: "bg-indigo-100",
    color: "text-indigo-600",
  },
  {
    icon: Lightbulb,
    title: "Discover",
    description: "Pick a creative method (SCAMPER, Reverse Brainstorming, Analogy Thinking, or Improve Existing Solutions) to generate candidates.",
    bg: "bg-sky-100",
    color: "text-sky-600",
  },
]

export default function IntroductionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { nextPath } = getAdjacentSteps(pathname)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={BookOpen}>Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-md leading-relaxed">
          Solution discovery helps you move from a validated problem to concrete solution candidates. You&apos;ll pick a problem, refine your understanding of it, then use creative techniques to generate ideas. Each candidate you capture is added to your Solution Bank, where you can validate it later.
        </p>

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-foreground mb-1">What you&apos;ll work through</h3>
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
