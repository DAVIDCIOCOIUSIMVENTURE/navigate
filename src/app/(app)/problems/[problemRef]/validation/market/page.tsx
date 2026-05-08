"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { VALIDATE_CASE_STUDIES } from "@/components/problem-strategies/validate-case-studies"
import { MarketSizingStrategy } from "@/components/problem-strategies/validation-strategy"
import { cn } from "@/lib/utils"
import { TrendingUp, Users, RefreshCw, DollarSign } from "lucide-react"
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
        <CardTitle icon={TrendingUp}>Size the market</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <p>
            Before deciding whether a problem is worth solving, you need a rough sense of how big the opportunity actually is. Many promising-sounding problems turn out to affect only a sliver of people, occur rarely, or have so little economic value that even a great solution would not sustain a business.
          </p>
          <p>
            Three numbers do most of the work: how many people experience the problem, how often they hit it, and how much it is worth to them when it happens. Together they let you sketch a back-of-the-envelope total addressable market, which is enough to tell signal from wishful thinking.
          </p>
          <h3 className="mt-4 text-xl font-bold text-foreground">How to estimate each input</h3>
          <div className={cn("grid gap-3", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-3")}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 shrink-0 mt-0.5">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">How many customers</p>
                <p className="text-base">Start from a public statistic for your segment (e.g. number of small businesses in the UK), then narrow it down by the filters you already chose. Round generously: precision matters less than order of magnitude.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shrink-0 mt-0.5">
                <RefreshCw className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">How often</p>
                <p className="text-base">Pick the natural cadence: daily, weekly, monthly. A problem that recurs daily compounds value quickly; an annual one needs to be unusually painful or expensive to be worth a business.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0 mt-0.5">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">How much is it worth</p>
                <p className="text-base">Look at what customers already pay for workarounds, lose in time, or miss in revenue. The right number is what they would happily pay you to make the problem disappear, not what it costs you to solve.</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-base">
            Below the inputs you will see a total addressable market calculation that combines the three figures. Treat it as a sense check: if the answer is implausibly large or vanishingly small, one of your inputs is almost certainly off.
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Estimate the market</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <MarketSizingStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
              <p className="text-base text-white">
                See how successful companies estimated reach, frequency, and value when sizing the opportunity behind their core problem.
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
                  <div className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${cs.iconBg}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-base font-semibold text-white">{cs.company}</p>
                    </div>
                    <div className={cn(
                      "grid gap-3 text-base",
                      containerSize === "narrow" ? "grid-cols-1" : "grid-cols-3",
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
