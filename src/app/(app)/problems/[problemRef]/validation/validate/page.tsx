"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { VALIDATE_CASE_STUDIES } from "./case-studies"
import { ValidationStrategy } from "@/components/problem-strategies/validation-strategy"
import { cn } from "@/lib/utils"
import { ShieldCheck } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const containerSize = useContainerSize()

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={ShieldCheck}>Validate your problem</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <p>
            Many entrepreneurs fall in love with a problem too early, only to discover later that the market is too small, the pain too infrequent, or the competition too entrenched. Validation is the discipline of stepping back and pressure-testing your assumptions before investing real time and resources.
          </p>
          <p>
            The goal here is not to prove yourself right, but to honestly evaluate whether this problem represents a genuine opportunity. A problem worth solving sits at the intersection of large reach, high frequency, meaningful value, and a competitive landscape you can realistically enter. Use the six factors below to build a structured picture of the opportunity, and let the evidence guide your verdict, even if it means moving on to a stronger problem.
          </p>
          <h3 className="mt-4 text-xl font-bold text-foreground">Validate your problem in 4 steps</h3>
          <div className={cn("grid gap-3", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-2")}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-base font-bold shrink-0">1</span>
                <div>
                  <p className="font-semibold text-foreground">How many customers &amp; how often</p>
                  <p className="text-base">Estimate the size of the audience and how frequently they encounter this problem.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-base font-bold shrink-0">2</span>
                <div>
                  <p className="font-semibold text-foreground">How much is it worth</p>
                  <p className="text-base">Quantify how much customers would pay or benefit from a solution.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-base font-bold shrink-0">3</span>
                <div>
                  <p className="font-semibold text-foreground">Competitive landscape</p>
                  <p className="text-base">Assess the cost of switching, how effective existing solutions are, and how big the competitors are.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white text-base font-bold shrink-0">4</span>
                <div>
                  <p className="font-semibold text-foreground">Record your verdict</p>
                  <p className="text-base">Decide whether the problem is <strong className="text-foreground">Valid</strong>, <strong className="text-foreground">Unsure</strong>, or <strong className="text-foreground">Invalid</strong>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Rate the opportunity</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <ValidationStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
              <p className="text-base text-white">
                See how successful companies quantified the opportunity behind their core problem, estimating reach, frequency, value, and switching cost to decide whether to pursue it.
              </p>
              <Tabs defaultValue={VALIDATE_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
                <TabsList className="self-center bg-white/10">
                  {VALIDATE_CASE_STUDIES.map((cs) => {
                    const Icon = cs.icon
                    return (
                      <TabsTrigger
                        key={cs.company}
                        value={cs.company}
                        className="gap-1.5 text-white/60 hover:text-white data-[state=active]:bg-white data-[state=active]:text-foreground"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cs.company}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                {VALIDATE_CASE_STUDIES.map((cs) => {
                  const Icon = cs.icon
                  return (
                  <TabsContent key={cs.company} value={cs.company}>
                  <div
                    className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-3"
                  >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${cs.iconBg}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-base font-semibold text-white">{cs.company}</p>
                  </div>
                  <div className={cn(
                    "grid gap-3 text-base",
                    containerSize === "narrow" ? "grid-cols-1" : containerSize === "medium" ? "grid-cols-2" : "grid-cols-3",
                  )}>
                    <div>
                      <span className="text-base font-semibold text-white">How Many Customers</span>
                      <p className="mt-1 text-base text-white">
                        <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-base font-semibold text-white mr-1">{cs.howManyPeople.value.toLocaleString()}</span>
                        {cs.howManyPeople.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-white">How Often</span>
                      <p className="mt-1 text-base text-white">
                        <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-base font-semibold text-white mr-1">{cs.howOften.value} {cs.howOften.unit}</span>
                        {cs.howOften.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-white">How Much Is It Worth</span>
                      <p className="mt-1 text-base text-white">
                        <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-base font-semibold text-white mr-1">{cs.worthToThem.value} {cs.worthToThem.unit}</span>
                        {cs.worthToThem.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-white">Cost of Switching</span>
                      <p className="mt-1 text-base text-white">
                        <span className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-base font-semibold text-white mr-1 capitalize",
                          cs.costOfSwitching.level === "none" ? "bg-emerald-500/30" : cs.costOfSwitching.level === "low" ? "bg-green-500/30" : cs.costOfSwitching.level === "medium" ? "bg-amber-500/30" : cs.costOfSwitching.level === "high" ? "bg-red-500/30" : "bg-red-700/30"
                        )}>{cs.costOfSwitching.level}</span>
                        {cs.costOfSwitching.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-white">Solution Effectiveness</span>
                      <p className="mt-1 text-base text-white">
                        <span className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-base font-semibold text-white mr-1 capitalize",
                          cs.solutionEffectiveness.level === "terrible" || cs.solutionEffectiveness.level === "poor" ? "bg-green-500/30" : cs.solutionEffectiveness.level === "average" ? "bg-amber-500/30" : "bg-red-500/30"
                        )}>{cs.solutionEffectiveness.level}</span>
                        {cs.solutionEffectiveness.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-white">Competitor Size</span>
                      <p className="mt-1 text-base text-white">
                        <span className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-base font-semibold text-white mr-1 capitalize",
                          cs.competitorSize.level === "micro" ? "bg-emerald-500/30" : cs.competitorSize.level === "small" ? "bg-green-500/30" : cs.competitorSize.level === "medium" ? "bg-amber-500/30" : cs.competitorSize.level === "large" ? "bg-red-500/30" : "bg-red-700/30"
                        )}>{cs.competitorSize.level}</span>
                        {cs.competitorSize.detail}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-1">
                    <span className="text-base font-semibold text-white">Verdict: {cs.verdict}</span>
                    <p className="mt-1 text-base text-white">{cs.reasoning}</p>
                  </div>
                  </div>
                  </TabsContent>
                  )
                })}
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          {nextPath && (
            <Button onClick={() => router.push(nextPath)}>Next</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
