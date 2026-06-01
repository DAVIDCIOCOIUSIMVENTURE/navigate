"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { VALIDATE_CASE_STUDIES } from "@/components/problem-strategies/validate-case-studies"
import { WorthStrategy } from "@/components/problem-strategies/validation-strategy"
import { cn } from "@/lib/utils"
import { DollarSign, Heart, MessagesSquare, Scale } from "lucide-react"
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
        <CardTitle icon={DollarSign} iconBg="bg-tertiary">What they would pay to solve it</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <p>
            Now that you have the jobs the customer is trying to get done, you can put a number on what one customer would happily pay to make the problem go away. The next step multiplies this figure across a whole population, so being a few times off here compounds into a wildly misleading market size. Honesty beats ambition.
          </p>
          <p>
            The trick is to anchor the price on one job from your list, not on the cost of building a feature. People will pay disproportionately to stop a feeling, far more than they will pay for a tidy version of the tangible task. A house move with no chain anxiety is the same job functionally as one with a fragile chain, but the price someone will pay to make the chain anxiety disappear is a different number altogether.
          </p>
          <p>
            Why one job and one price? A customer hires a solution for a single primary job: the one that tips them into buying. The other jobs still matter, but they nudge what someone will pay rather than each stacking on as a separate charge. So you capture one price, anchored on that one dominant job, and you pick which job that is on this step. It is often an emotional or social pull, but a functional job can be the anchor when it is what truly drives the purchase.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">How to read a price off the jobs list</h3>
          <div className={cn("grid gap-3", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-3")}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-800 shrink-0 mt-0.5">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Anchor on the one job that drives the purchase</p>
                <p className="text-base">Pick the single job that tips the customer into buying. It is usually the highest-intensity emotional or social pull, since people pay disproportionately to stop a feeling, but a functional job can be the anchor when that is what really drives the decision. The price is anchored on that one job, not on what it costs you to deliver.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-600 shrink-0 mt-0.5">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Cross-check against real spend</p>
                <p className="text-base">Look at what customers are already paying for today: weaker tools, contractor fees, late fines, chain chasers, replacement parts. Revealed spend is the strongest sanity check on a number that came out of an emotional read.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-900 shrink-0 mt-0.5">
                <MessagesSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Treat the number as a hypothesis to test</p>
                <p className="text-base">The price you enter is a starting point for real conversations, not a fact. Ask customers at different price points: &quot;What would you pay for a service that took this away?&quot; and watch where their answers cluster. Update the number when reality disagrees.</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-base">
            A useful sense check: let your anchor job set the ceiling and real spend set the floor, then land between them and lean toward the lower end. Aggressive estimates feel motivating in private and embarrassing in front of investors, so err toward the conservative read.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            Pick the one job that drives the purchase, then enter the price a single customer would happily pay each time the problem occurs, in the currency that matches them. This figure carries forward to the next step where you multiply it by the population to produce the total market figure, so capture it with the same level of honesty you would use in front of a sceptical investor.
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Estimate what they would pay</h3>

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
                See how successful companies anchored a price on the one job that drives the purchase, not on the cost of building the feature.
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
                          <span className="text-base font-semibold text-foreground">What they would pay</span>
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
