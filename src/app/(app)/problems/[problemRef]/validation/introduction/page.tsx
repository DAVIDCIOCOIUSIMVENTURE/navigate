"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAdjacentSteps, useProblem } from "../context"
import { DimensionChips } from "@/components/dimension-chips"
import {
  ClipboardCheck, GitFork, ShieldCheck, LayoutTemplate, Users, Search, TrendingUp, Building2, DollarSign, Sparkles,
} from "lucide-react"

const STEPS = [
  { icon: Users, title: "Define your customer", description: "Pin down exactly who experiences this problem so the rest of the validation work has a real person at its centre." },
  { icon: Search, title: "Refine your problem", description: "Dig into why this problem exists and who it affects using Root Causes, 5 Whys, or Affected Groups." },
  { icon: GitFork, title: "Explore existing solutions & shortcomings", description: "Identify how customers currently deal with this problem, capture shortcomings, and measure the quantifiable impact of each solution." },
  { icon: Sparkles, title: "Jobs your customer is trying to get done", description: "List the tangible tasks they need to complete, how they want to feel, and how they want to be seen. The strongest pull anchors the price on the next step." },
  { icon: DollarSign, title: "What they would pay to solve it", description: "Anchored on the strongest job from the previous step, estimate the price a single customer would happily pay each time the problem hits." },
  { icon: TrendingUp, title: "Size the market", description: "Estimate how many customers have the problem and the share you can realistically reach in your launch. The page combines those with the price to produce a total and a reachable market figure." },
  { icon: Building2, title: "Assess the competition", description: "Read the cost of switching, how good existing solutions are, and how big the incumbents are. Then set the realistic share you could win out of the reachable market." },
  { icon: ShieldCheck, title: "Record your verdict", description: "Weigh the seven factors together against a colour-coded summary and lean indicator, then commit to Valid, Unsure, or Invalid with reasoning in the notes." },
  { icon: LayoutTemplate, title: "Summary", description: "Review the problem statement assembled from your discovery and validation work." },
]

function FieldRow({ label, columnId, ids }: { label: string; columnId: string; ids: string[] }) {
  if (ids.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <p className="text-base font-semibold uppercase tracking-wide">{label}</p>
      <DimensionChips columnId={columnId} ids={ids} />
    </div>
  )
}

export default function IntroductionPage() {
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
        <CardTitle icon={ClipboardCheck} iconBg="bg-secondary-brand">Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">

        <div className="@container">
          <div className="flex flex-col gap-6 @[800px]:flex-row @[800px]:items-center">
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <p className="text-base leading-relaxed">
                It&apos;s time to validate whether this problem is truly worth solving. You&apos;ll work through your customer, the way the problem really shows up, the alternatives people already use, the jobs the customer is trying to get done, the price they would pay, the size of the market, and the competitive landscape, then commit to a verdict you can defend with the evidence in front of you.
              </p>
              <p className="text-base leading-relaxed">
                The goal is not to prove yourself right; it is to gather enough to make an honest call before you invest in a solution.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/14-validate-solution.svg"
              alt=""
              className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
            />
          </div>
        </div>

        {mounted && problem && (
          <div className="rounded-lg border-2 border-red-800/20 bg-red-800/5 p-4 flex flex-col gap-3">
            {problem.title && (
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold uppercase tracking-wide text-red-800">Problem Title</p>
                <p className="text-base font-medium">{problem.title}</p>
              </div>
            )}
            {problem.description && (
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold uppercase tracking-wide text-red-800">Problem Description</p>
                <p className="text-base font-medium">{problem.description}</p>
              </div>
            )}
            <FieldRow label="Customer" columnId="customers" ids={problem.customers} />
            <FieldRow label="Context" columnId="contexts" ids={problem.contexts} />
            <FieldRow label="Problem" columnId="problems" ids={problem.problems} />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-foreground">What you&apos;ll work through</h3>
          <div className="flex flex-col">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-brand">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  {index < STEPS.length - 1 && (
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
