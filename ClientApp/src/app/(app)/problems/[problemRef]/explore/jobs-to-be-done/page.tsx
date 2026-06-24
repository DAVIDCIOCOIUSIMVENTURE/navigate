"use client"

import { usePathname, useRouter } from "@/lib/router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { JobsToBeDoneStrategy } from "@/components/problem-strategies/validation-strategy"
import { VALIDATE_CASE_STUDIES } from "@/components/problem-strategies/validate-case-studies"
import { cn } from "@/lib/utils"
import { Briefcase, Heart, Eye, Sparkles } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"

export default function JobsToBeDonePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const containerSize = useContainerSize()

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Sparkles} iconBg="bg-tertiary">Jobs your customer is trying to get done</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <p>
            Before you can guess what a customer would pay, you need a clear picture of what they are really hiring a solution to do. People do not buy products: they buy progress on something they are trying to get done. Some of that progress is a tangible task. Some of it is a feeling they want to have, or stop having. Some of it is how they want to be seen by others.
          </p>
          <p>
            The trap is collapsing all of these into one short phrase like &quot;help me move house&quot;. Keep them separate. Later, in Problem Validation, you will pick one of these jobs to anchor the price on: usually the strongest emotional or social pull rather than the tangible task, though not always. A house move with no chain risk is the same job functionally as one with a fragile chain, but the price someone will pay to make the chain anxiety disappear is far higher than the price they will pay for a tidier solicitor portal.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">Three kinds of job to capture</h3>
          <div className={cn("grid gap-3", containerSize === "narrow" ? "grid-cols-1" : "grid-cols-3")}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 shrink-0 mt-0.5">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">What they need to get done</p>
                <p className="text-base">The tangible tasks. Phrase them as outcomes the customer wants, not as your features. For a house move: complete the sale and purchase on the same day, find a place inside budget, manage the solicitors and surveys without something slipping through the cracks.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-800 shrink-0 mt-0.5">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">How they want to feel</p>
                <p className="text-base">The emotional pulls. These usually justify a higher price than the tangible tasks. For a house move: stop lying awake worrying the chain will collapse, feel in control of an opaque process, avoid the dread of being gazumped. Rate each one as mild, strong, or unbearable, drawing on what real customers have said.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-900 shrink-0 mt-0.5">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">How they want to be seen</p>
                <p className="text-base">The social pulls. How the customer wants to be perceived by family, peers, colleagues, or counterparties. Often unspoken but real. For a house move: be seen as having made a smart move, not look disorganised in front of the estate agent.</p>
              </div>
            </div>
          </div>

          <h3 className="mt-4 text-xl font-bold text-foreground">How to read intensity</h3>
          <p>
            For emotional and social jobs, mark the intensity from what customers have said and done, not from how strongly you feel about it. <strong className="text-foreground">Mild</strong> is &quot;mildly annoying, forgotten within the hour&quot;. <strong className="text-foreground">Strong</strong> is &quot;makes the customer rearrange their day to avoid it&quot;. <strong className="text-foreground">Unbearable</strong> is &quot;will switch tools, jobs, or providers to make it stop&quot;.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            Add at least one job under each of the three headings. Lean into emotional and social jobs even if they feel softer than the tangible tasks: those are usually where the price comes from. Later, in Problem Validation, you will choose one of these jobs as the anchor for the price, then put a number on what a customer would pay to make the problem go away. Pick whichever job truly drives the decision to buy, whatever its type.
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> List the jobs the customer is trying to get done</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <JobsToBeDoneStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
              <p className="text-base text-foreground">
                See the kinds of jobs successful companies recognised in their customers before settling on a price.
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
                            <span className="text-base font-semibold text-foreground">What they need to get done</span>
                            <ul className="mt-1 text-base text-foreground list-disc pl-5 space-y-1">
                              {cs.jobs.functional.map((j, i) => <li key={i}>{j}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="text-base font-semibold text-foreground">How they want to feel</span>
                            <ul className="mt-1 text-base text-foreground list-disc pl-5 space-y-1">
                              {cs.jobs.emotional.map((j, i) => (
                                <li key={i}>
                                  <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-base font-semibold text-foreground capitalize mr-1">{j.intensity}</span>
                                  {j.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-base font-semibold text-foreground">How they want to be seen</span>
                            <ul className="mt-1 text-base text-foreground list-disc pl-5 space-y-1">
                              {cs.jobs.social.map((j, i) => (
                                <li key={i}>
                                  <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-base font-semibold text-foreground capitalize mr-1">{j.intensity}</span>
                                  {j.text}
                                </li>
                              ))}
                            </ul>
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
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
