"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { EXISTING_SOLUTIONS_CASE_STUDIES } from "./case-studies"
import { ExistingSolutionsStrategy } from "@/components/problem-strategies/existing-solutions-strategy"
import { GitFork, Monitor, Wrench, Users, Ban } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function ExistingSolutionsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const isNarrow = useContainerSize() === "narrow"

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={GitFork}>Explore existing solutions &amp; shortcomings</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-md text-muted-foreground">
          <p>
            How are people currently solving, or living with, this problem? List every existing solution
            they reach for today, even if it&apos;s imperfect or informal.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 shrink-0 mt-0.5">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Existing tools &amp; software</p>
                <p className="text-md">Products already on the market</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0 mt-0.5">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Manual workarounds</p>
                <p className="text-md">Spreadsheets, sticky notes, email threads</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shrink-0 mt-0.5">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Hiring or outsourcing</p>
                <p className="text-md">Paying someone else to handle it</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 shrink-0 mt-0.5">
                <Ban className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Doing nothing</p>
                <p className="text-md">Ignoring or tolerating the problem</p>
              </div>
            </div>
          </div>
          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            For each existing solution, capture its <strong className="text-foreground">shortcomings</strong> and
            its <strong className="text-foreground">impact</strong>, both <strong className="text-foreground">quantifiable</strong> (time lost,
            money wasted, error rates, etc.) and <strong className="text-foreground">emotional</strong> (frustration,
            anxiety, loss of trust, etc.).
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <div className="flex flex-col gap-2 items-center text-center">
          <h3 className="text-xl font-bold"><span className="text-primary">Your Turn:</span> What existing solutions are there?</h3>
          <p className="text-md text-muted-foreground max-w-xl">
            Add every existing solution your customer uses today. For each one, capture its shortcomings and the impact those gaps have on them.
          </p>
        </div>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <ExistingSolutionsStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
              <p className="text-sm text-white">
                See how successful companies mapped out the existing solutions their customers were already using, and identified the shortcomings that created the opportunity.
              </p>
              <Tabs defaultValue={EXISTING_SOLUTIONS_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
                <TabsList className="self-center bg-white/10">
                  {EXISTING_SOLUTIONS_CASE_STUDIES.map((cs) => {
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
                {EXISTING_SOLUTIONS_CASE_STUDIES.map((cs) => {
                  const Icon = cs.icon
                  return (
                    <TabsContent key={cs.company} value={cs.company}>
                      <div className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${cs.iconBg}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-sm font-semibold text-white">{cs.company}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                          {cs.solutions.map((sol) => (
                            <div key={sol.name} className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/5 p-3">
                              <p className="text-sm font-medium text-white">{sol.name}</p>
                              <div className="flex flex-col divide-y divide-white/10">
                                {sol.shortcomings.map((sc, j) => (
                                  <div key={j} className={cn("grid gap-3 text-sm py-3 first:pt-0 last:pb-0", isNarrow ? "grid-cols-1" : "grid-cols-2")}>
                                    <div>
                                      <span className="text-xs font-medium text-white uppercase tracking-wide">Shortcoming</span>
                                      <p className="mt-1 text-white">{sc.text}</p>
                                    </div>
                                    <div>
                                      <span className="text-xs font-medium text-white uppercase tracking-wide">Impact</span>
                                      <p className="mt-1 text-white">{sc.impact}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
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
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
