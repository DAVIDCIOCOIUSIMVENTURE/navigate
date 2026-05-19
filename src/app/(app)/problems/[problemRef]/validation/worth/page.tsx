"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { VALIDATE_CASE_STUDIES } from "@/components/problem-strategies/validate-case-studies"
import { WorthStrategy } from "@/components/problem-strategies/validation-strategy"
import { cn } from "@/lib/utils"
import { DollarSign, Wallet, Scale, PieChart } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"

export default function WorthPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const containerSize = useContainerSize()

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={DollarSign} iconBg="bg-secondary-brand">How much is it worth</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <p>
            Before you count customers or annualise frequencies, you need to be honest about the value of solving the problem each time it happens. The market sizing step that comes next multiplies this figure across a population, so being a few times off here compounds into a wildly misleading number.
          </p>
          <p>
            Two questions matter on this page. First, what is one instance of the problem actually worth to a customer? Second, of the gross market that produces, how much can your venture realistically capture? A huge market you can only nibble at can still be a worse opportunity than a smaller market where you can plausibly become the default.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">How to estimate the worth per occurrence</h3>
          <div className={cn("grid gap-3", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-3")}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 shrink-0 mt-0.5">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Money already spent</p>
                <p className="text-base">Look at what customers are actively paying for today: subscriptions to weaker tools, contractor fees, late fines, replacement parts. Revealed spend is the strongest evidence that the problem is worth solving.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-600 shrink-0 mt-0.5">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Time, risk, and missed value</p>
                <p className="text-base">Translate the soft costs into money. An hour of a professional&apos;s time, a missed sale, a delayed launch, or an avoidable refund all have a defensible monetary value. If the problem causes risk, factor in the expected cost of the bad outcome.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-900 shrink-0 mt-0.5">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Willingness to pay you</p>
                <p className="text-base">The number you want is what a customer would happily pay to make this single occurrence go away, not what it would cost you to build a solution. If you cannot picture a customer signing off on the figure, round it down.</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-base">
            A useful sense check: pick the lowest of the three angles above. If money already spent is small but the time cost is high, your number sits between them. Aggressive estimates feel motivating in private and embarrassing in front of investors, so err toward the conservative read.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">How much of the market can you realistically capture</h3>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0 mt-0.5">
              <PieChart className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Treat the slider as your obtainable share, not a wish</p>
              <p className="text-base">The slider on this page lets you keep a percentage of the full addressable market: a focused niche entrant typically reaches 1 to 5 percent, a strong differentiated play 5 to 20 percent, and a dominant category winner 20 to 40 percent. Most early ventures land in the 5 to 15 percent band. Ask yourself who already owns the market, how fast you can reach customers, and how easy switching really is. If you cannot defend a higher number to a sceptical friend, slide it down.</p>
            </div>
          </div>
          <p className="mt-2 text-base">
            Your worth-per-occurrence and your obtainable share both flow into the total addressable market calculation on the next step, so any change here will move that number directly.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            Enter the monetary value of a single occurrence of the problem in the currency that matches your customer, then drag the slider to the share of the market you can realistically defend. Both numbers carry forward to the total addressable market calculation on the next step, so capture them with the same level of honesty you would use in front of a sceptical investor.
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Estimate the worth and the share you can capture</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <WorthStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
              <p className="text-base text-foreground">
                See how successful companies reasoned about willingness to pay before working out how many customers and how often.
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
                        <div>
                          <span className="text-base font-semibold text-foreground">How Much Is It Worth</span>
                          <p className="mt-1 text-base text-foreground">
                            <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-base font-semibold text-foreground mr-1">{cs.worthToThem.value} {cs.worthToThem.unit}</span>
                            {cs.worthToThem.detail}
                          </p>
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
