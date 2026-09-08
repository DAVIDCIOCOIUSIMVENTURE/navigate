"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAdjacentSteps, useProblem } from "../context"
import { ProblemContextCard } from "@/components/context-card"
import { SHOW_REFINEMENT_STEPS } from "@/lib/feature-flags"
import {
  Compass, GitFork, LayoutTemplate, Users, Search, Sparkles,
} from "lucide-react"

const ALL_STEPS = [
  { icon: Users, title: "Define your customer", description: "Pin down exactly who experiences this problem so the rest of the work has a real person at its centre." },
  { icon: Search, title: "Choose a refinement method", description: "Pick the lens that fits: Root Causes, 5 Whys, or Affected Groups.", refinement: true },
  { icon: Search, title: "Refine your problem", description: "Dig into why this problem exists and who it affects using the method you chose.", refinement: true },
  { icon: GitFork, title: "Explore existing solutions & shortcomings", description: "Identify how customers currently deal with this problem and capture where each solution falls short." },
  { icon: Sparkles, title: "Jobs your customer is trying to get done", description: "List the tangible tasks they need to complete, how they want to feel, and how they want to be seen." },
  { icon: LayoutTemplate, title: "Review", description: "Look back over what you have uncovered, then continue to Problem Validation when you are ready." },
]

// Mirror NAV_ITEMS: the refinement pair is hidden while the switch is off.
const STEPS = SHOW_REFINEMENT_STEPS ? ALL_STEPS : ALL_STEPS.filter((step) => !step.refinement)

export default function ExploreIntroductionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problemId } = useProblem()
  const { nextPath } = getAdjacentSteps(pathname, problemRef)
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  // Avoid SSR/client mismatch: localStorage-backed Redux data only resolves
  // after mount, so defer rendering the problem block until then.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Compass}>Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">

        <div className="@container">
          <div className="flex flex-col gap-6 @[800px]:flex-row @[800px]:items-center">
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <p className="text-base leading-relaxed">
                You have identified a problem worth a closer look. Before you start sizing markets and weighing up the competition, take time to understand it properly. Who exactly has this problem, why does it really happen, how do people cope today, and what are they actually trying to get done?
              </p>
              <p className="text-base leading-relaxed">
                This is the exploring and defining stage. The clearer the picture you build here, the sharper and more honest your validation will be afterwards. Everything you capture carries forward into Problem Validation.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/23-customer.svg"
              alt=""
              className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
            />
          </div>
        </div>

        {mounted && <ProblemContextCard problem={problem} />}

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-foreground">What you&apos;ll work through</h3>
          <div className="flex flex-col">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-brand">
                    <Icon className="h-3.5 w-3.5 text-secondary-brand-foreground" />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-5">
                  <p className="text-base font-medium leading-8 text-secondary-brand">{title}</p>
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
