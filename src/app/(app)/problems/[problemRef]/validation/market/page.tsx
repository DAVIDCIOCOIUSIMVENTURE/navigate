"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { VALIDATE_CASE_STUDIES } from "@/components/problem-strategies/validate-case-studies"
import { MarketSizingStrategy } from "@/components/problem-strategies/validation-strategy"
import { cn } from "@/lib/utils"
import { TrendingUp, Users, RefreshCw, PieChart } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"

export default function MarketSizingPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const containerSize = useContainerSize()

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={TrendingUp} iconBg="bg-secondary-brand">Size the market</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <p>
            You have the price one customer would happily pay. This step layers the population on top to produce two figures: the total market for the whole pie, and the reachable market for the slice you can actually serve in your launch. The third figure, your realistic share of the market, comes from the competition step that follows.
          </p>
          <p>
            The total market is the entire population that has the problem, multiplied by the price. The reachable market filters that down by what you can physically deliver to: a launch region, a language, a customer size, a platform. It is not yet about whether you can win against competitors. Be generous with the total, but be honest about what you can reach.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">How to estimate each input on this page</h3>
          <div className={cn("grid gap-3", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-3")}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-900 shrink-0 mt-0.5">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">How many customers have this problem</p>
                <p className="text-base">Start from a public statistic for your segment, e.g. annual home moves in England and Wales, or number of small businesses in the UK. Round generously: precision matters less than order of magnitude.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 shrink-0 mt-0.5">
                <RefreshCw className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">How often each customer hits the problem</p>
                <p className="text-base">For a recurring problem like a SaaS workflow, pick the natural cadence (per day, per month). For a one-off problem like a house move, leave this at 1 per year (or per however many years it recurs). One-off does not mean small: there are still a million-plus moves a year in the UK.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-600 shrink-0 mt-0.5">
                <PieChart className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Slice you can actually reach</p>
                <p className="text-base">Of the global population above, what share can you serve in your launch? Filter on geography, language, business size, distribution channel: things that gate whether your product can physically reach a customer. Do not include competition yet. A focused launch usually reaches 10 to 40 percent of the total market.</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-base">
            The panel below combines these inputs with the price from the previous step into the total and reachable market figures. If either looks implausibly large or vanishingly small, one of the inputs is almost certainly off. The price and the reachable share are usually the fastest to revisit.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            Enter how many customers have the problem in total, how often each one hits it, and the share you can realistically reach in your launch. The page then combines those with the price you captured to produce a total and a reachable market figure. Treat both as a sense check, not as proof of demand: the next step will narrow the reachable market down to a realistic share based on the competition.
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Estimate the total and reachable market</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <MarketSizingStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
              <p className="text-base text-foreground">
                See how successful companies estimated population, frequency, and the reachable slice before getting into the competition.
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
                        <span className="text-base font-semibold text-foreground">How many customers</span>
                        <p className="mt-1 text-base text-foreground">
                          <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-base font-semibold text-foreground mr-1">{cs.howManyPeople.value.toLocaleString()}</span>
                          {cs.howManyPeople.detail}
                        </p>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-foreground">How often</span>
                        <p className="mt-1 text-base text-foreground">
                          <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-base font-semibold text-foreground mr-1">{cs.howOften.value} {cs.howOften.unit}</span>
                          {cs.howOften.detail}
                        </p>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-foreground">Reachable share of the market</span>
                        <p className="mt-1 text-base text-foreground">
                          <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-base font-semibold text-foreground mr-1">{cs.reachableShare.value}%</span>
                          {cs.reachableShare.detail}
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
