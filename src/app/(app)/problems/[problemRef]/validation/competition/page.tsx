"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { VALIDATE_CASE_STUDIES } from "@/components/problem-strategies/validate-case-studies"
import { CompetitionStrategy } from "@/components/problem-strategies/validation-strategy"
import { cn } from "@/lib/utils"
import { Building2, ArrowRightLeft, Target } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"

export default function CompetitionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const containerSize = useContainerSize()

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Building2} iconBg="bg-secondary-brand">Assess the competition</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <p>
            A big market alone is not enough. The next question is whether you can realistically win in it. Most problems that look attractive on paper are already being addressed (well or badly) by someone, and customers have already made choices about how to live with them.
          </p>
          <p>
            Three angles tell you most of what you need: how hard it is for customers to leave their current setup, how good the existing options actually are, and how much firepower the incumbents bring. Use the notes field to capture anything that does not fit into the toggles, especially evidence behind your judgements.
          </p>
          <h3 className="mt-4 text-xl font-bold text-foreground">How to read each signal</h3>
          <div className={cn("grid gap-3", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-3")}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-900 shrink-0 mt-0.5">
                <ArrowRightLeft className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Cost of switching</p>
                <p className="text-base">Look at the time, money, and habits a customer has to give up to move. Migrating data, retraining a team, or breaking a long contract are all switching costs. The higher these are, the more compelling your solution needs to be to pull anyone away.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 shrink-0 mt-0.5">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Existing solution effectiveness</p>
                <p className="text-base">Be honest: do current solutions mostly work, or do customers complain, churn, or build workarounds? Poor existing solutions create the gap you can fill. Excellent ones mean you need a 10x improvement, not a marginal one.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-600 shrink-0 mt-0.5">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Competitor size</p>
                <p className="text-base">Map who is in the market and how well-funded they are. Giants can outspend you; micro players signal an underserved space. A crowded mid-tier with no clear leader often hides the best opportunities.</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-base">
            Strong opportunities tend to combine low or moderate switching costs, average-or-worse existing solutions, and competitors that are either small or distracted by adjacent markets. If all three signals point against you, that is your cue to rethink the problem rather than push harder.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            Pick the level that best describes each of the three signals: cost of switching, existing solution effectiveness, and competitor size. Then use the notes field to record the evidence behind your judgements and anything that does not fit cleanly into the toggles. The colour-coded summary on the verdict step will read directly from what you capture here.
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Assess the competitive landscape</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <CompetitionStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
              <p className="text-base text-foreground">
                See how successful companies read the competitive landscape: switching costs, the quality of existing alternatives, and the size of the incumbents they were taking on.
              </p>
              <Tabs defaultValue={VALIDATE_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
                <TabsList className="self-center bg-background">
                  {VALIDATE_CASE_STUDIES.map((cs) => {
                    const Icon = cs.icon
                    return (
                      <TabsTrigger
                        key={cs.company}
                        value={cs.company}
                        className="gap-1.5"
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
                  <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${cs.iconBg}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-base font-semibold text-foreground">{cs.company}</p>
                    </div>
                    <div className={cn(
                      "grid gap-3 text-base",
                      containerSize === "narrow" ? "grid-cols-1" : "grid-cols-3",
                    )}>
                      <div>
                        <span className="text-base font-semibold text-foreground">Cost of Switching</span>
                        <p className="mt-1 text-base text-foreground">
                          <span className={cn(
                            "inline-block rounded px-1.5 py-0.5 text-base font-semibold text-foreground mr-1 capitalize",
                            cs.costOfSwitching.level === "none" ? "bg-emerald-500/30" : cs.costOfSwitching.level === "low" ? "bg-green-500/30" : cs.costOfSwitching.level === "medium" ? "bg-amber-500/30" : cs.costOfSwitching.level === "high" ? "bg-red-500/30" : "bg-red-700/30"
                          )}>{cs.costOfSwitching.level}</span>
                          {cs.costOfSwitching.detail}
                        </p>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-foreground">Solution Effectiveness</span>
                        <p className="mt-1 text-base text-foreground">
                          <span className={cn(
                            "inline-block rounded px-1.5 py-0.5 text-base font-semibold text-foreground mr-1 capitalize",
                            cs.solutionEffectiveness.level === "terrible" || cs.solutionEffectiveness.level === "poor" ? "bg-green-500/30" : cs.solutionEffectiveness.level === "average" ? "bg-amber-500/30" : "bg-red-500/30"
                          )}>{cs.solutionEffectiveness.level}</span>
                          {cs.solutionEffectiveness.detail}
                        </p>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-foreground">Competitor Size</span>
                        <p className="mt-1 text-base text-foreground">
                          <span className={cn(
                            "inline-block rounded px-1.5 py-0.5 text-base font-semibold text-foreground mr-1 capitalize",
                            cs.competitorSize.level === "micro" ? "bg-emerald-500/30" : cs.competitorSize.level === "small" ? "bg-green-500/30" : cs.competitorSize.level === "medium" ? "bg-amber-500/30" : cs.competitorSize.level === "large" ? "bg-red-500/30" : "bg-red-700/30"
                          )}>{cs.competitorSize.level}</span>
                          {cs.competitorSize.detail}
                        </p>
                      </div>
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
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          {nextPath && (
            <Button onClick={() => router.push(nextPath)}>Next</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
