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
  ClipboardCheck, GitFork, ShieldCheck, LayoutTemplate, Users, Search, TrendingUp, Building2, DollarSign,
} from "lucide-react"

const STEPS = [
  { icon: Users, title: "Define your customer", description: "Pin down exactly who experiences this problem so the rest of the validation work has a real person at its centre.", bg: "bg-indigo-100 dark:bg-indigo-950", color: "text-indigo-600 dark:text-indigo-400" },
  { icon: Search, title: "Refine your problem", description: "Dig into why this problem exists and who it affects using Root Causes, 5 Whys, or Affected Groups.", bg: "bg-purple-100 dark:bg-purple-950", color: "text-purple-600 dark:text-purple-400" },
  { icon: GitFork, title: "Explore existing solutions & shortcomings", description: "Identify how customers currently deal with this problem, capture shortcomings, and measure the quantifiable impact of each solution.", bg: "bg-sky-100 dark:bg-sky-950", color: "text-sky-600 dark:text-sky-400" },
  { icon: DollarSign, title: "How much is it worth", description: "Estimate the monetary value of solving one occurrence of the problem and the realistic share of the market you could capture.", bg: "bg-teal-100 dark:bg-teal-950", color: "text-teal-600 dark:text-teal-400" },
  { icon: TrendingUp, title: "Size the market", description: "Estimate how many customers experience the problem and how often, then sense-check the result with a total addressable market calculation that uses the worth and share from the previous step.", bg: "bg-emerald-100 dark:bg-emerald-950", color: "text-emerald-600 dark:text-emerald-400" },
  { icon: Building2, title: "Assess the competition", description: "Read the cost of switching, how good existing solutions actually are, and how big the incumbents are. Capture supporting notes as you go.", bg: "bg-amber-100 dark:bg-amber-950", color: "text-amber-600 dark:text-amber-400" },
  { icon: ShieldCheck, title: "Record your verdict", description: "Weigh the six factors together against a colour-coded summary and lean indicator, then commit to Valid, Unsure, or Invalid with reasoning in the notes.", bg: "bg-orange-100 dark:bg-orange-950", color: "text-orange-600 dark:text-orange-400" },
  { icon: LayoutTemplate, title: "Summary", description: "Review the problem statement assembled from your discovery and validation work.", bg: "bg-green-100 dark:bg-green-950", color: "text-green-600 dark:text-green-400" },
]

function FieldRow({ label, columnId, ids }: { label: string; columnId: string; ids: string[] }) {
  if (ids.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
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
        <CardTitle icon={ClipboardCheck}>Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">

        <p className="text-base leading-relaxed">
          It&apos;s time to validate whether this problem is truly worth solving. You&apos;ll work through your customer, the way the problem really shows up, the alternatives people already use, the size of the market, and the competitive landscape, then commit to a verdict you can defend with the evidence in front of you. The goal is not to prove yourself right; it is to gather enough to make an honest call before you invest in a solution.
        </p>

        {mounted && problem && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
            {problem.description && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem Description</p>
                <p className="text-base font-medium">{problem.description}</p>
              </div>
            )}
            <FieldRow label="Customer" columnId="customers" ids={problem.customers} />
            <FieldRow label="Context" columnId="contexts" ids={problem.contexts} />
            <FieldRow label="Problem" columnId="problems" ids={problem.problems} />
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
                  <p className="text-base font-medium leading-8">{title}</p>
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
