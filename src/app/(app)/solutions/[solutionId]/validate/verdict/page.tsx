"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ArrowLeft, ArrowRight, CheckCircle2, Gauge, Target, Coins, Clock,
  Rocket, Glasses, Film,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAdjacentSteps, useSolution } from "../context"
import { VerdictStrategy } from "@/components/solution-strategies/verdict-strategy"
import { ProblemContextCard } from "@/components/problem-context-card"

type VerdictKey = "valid" | "unsure" | "invalid"

type VerdictCaseStudy = {
  company: string
  icon: LucideIcon
  iconBg: string
  context: string
  verdict: VerdictKey
  reasoning: string
  outcome: string
}

const VERDICT_LABELS: Record<VerdictKey, string> = {
  valid: "Valid",
  unsure: "Unsure",
  invalid: "Invalid",
}

const VERDICT_BADGES: Record<VerdictKey, string> = {
  valid: "bg-green-800 text-white",
  unsure: "bg-yellow-600 text-white",
  invalid: "bg-red-800 text-white",
}

const VERDICT_CASE_STUDIES: VerdictCaseStudy[] = [
  {
    company: "Netflix (DVD to streaming, 2007)",
    icon: Rocket,
    iconBg: "bg-red-800",
    context: "Netflix had a profitable DVD-by-mail business when leadership had to decide whether to commit to streaming as the next core business. The metrics: high impact, mid-feasibility, high cost, multi-year time.",
    verdict: "valid",
    reasoning: "Impact was clearly high; streaming would redefine the category. Feasibility was reasonable since bandwidth and licensing were tractable. Cost was heavy but bearable, and the time investment was justified by being early.",
    outcome: "Streaming became the core business and Netflix became one of the most valuable media companies in the world. The honest verdict justified the heavy investment.",
  },
  {
    company: "Google Glass (consumer launch, 2013)",
    icon: Glasses,
    iconBg: "bg-blue-900",
    context: "Google had a working AR headset prototype with strong hardware. The team had to decide whether to launch a consumer product or keep iterating privately. Impact was high in theory but customer acceptance, social norms, and privacy laws were all open questions.",
    verdict: "unsure",
    reasoning: "Hardware feasibility was high; social product-market fit was unproven. Mixed scores plus high uncertainty meant the right verdict was \"unsure, run more learning experiments\" rather than \"valid, scale it\".",
    outcome: "The consumer launch was premature, drew public mockery, and was shelved. An honest \"unsure\" verdict would have led to more private testing before staking the brand on it.",
  },
  {
    company: "Quibi (2018-2020)",
    icon: Film,
    iconBg: "bg-violet-800",
    context: "A $1.75B-funded short-form premium mobile video service. The team had to decide whether to spend heavily on original content for an unproven format.",
    verdict: "invalid",
    reasoning: "Impact looked high on paper (huge mobile audience) but rested on an untested assumption that people wanted premium short-form video on phones. Cost was enormous and the format was easy to copy. The verdict treated potential impact as proven.",
    outcome: "Shut down six months after launch. A more honest verdict, demanding evidence for the impact assumption first, would have saved the investment or scoped it down to a much smaller bet.",
  },
]

function MetricRow({ icon: Icon, label, score }: { icon: LucideIcon; label: string; score: number | null }) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-sm flex-1">{label}</span>
      <span className={cn("text-sm font-semibold", score == null && "text-muted-foreground")}>
        {score == null ? "Not scored" : `${score} / 5`}
      </span>
    </div>
  )
}

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    solutionId, solution, problem,
    feasibility, impact, cost, timeToImplement,
  } = useSolution()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionId)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={CheckCircle2} iconBg="bg-tertiary">Verdict</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-base leading-relaxed">
          Based on the four metrics, decide whether this solution is worth pursuing. A high-impact, feasible, low-cost, fast solution is an easy yes. A low-impact, expensive, slow one is an easy no. Most sit somewhere in between.
        </p>

        {(solution?.title || problem?.title || problem?.description) && (
          <div className="flex flex-col gap-2">
            {solution?.title && (
              <div className="rounded-lg border-2 border-tertiary/20 bg-tertiary/5 p-4 flex flex-col gap-0.5">
                <p className="text-base font-semibold uppercase tracking-wide">Solution</p>
                <p className="text-base font-medium">{solution.title}</p>
              </div>
            )}
            <ProblemContextCard problem={problem} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your scores</h3>
          <div className="flex flex-col gap-2">
            <MetricRow icon={Gauge} label="Feasibility" score={feasibility} />
            <MetricRow icon={Target} label="Impact" score={impact} />
            <MetricRow icon={Coins} label="Cost" score={cost} />
            <MetricRow icon={Clock} label="Time to Implement" score={timeToImplement} />
          </div>
        </div>

        <Tabs defaultValue="guidance" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="guidance">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="guidance">
            <VerdictStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border bg-muted p-8 flex flex-col gap-4">
              <p className="text-base text-foreground">
                See how teams have weighed their metrics into a verdict. Each example shows the call they made, the reasoning behind it, and what happened next.
              </p>
              <Tabs defaultValue={VERDICT_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
                <TabsList className="self-center bg-background">
                  {VERDICT_CASE_STUDIES.map((cs) => {
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
                {VERDICT_CASE_STUDIES.map((cs) => {
                  const Icon = cs.icon
                  return (
                    <TabsContent key={cs.company} value={cs.company}>
                      <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                            cs.iconBg,
                          )}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="text-base font-semibold text-foreground">{cs.company}</p>
                          <span className={cn(
                            "ml-auto rounded-full px-3 py-0.5 text-base font-semibold",
                            VERDICT_BADGES[cs.verdict],
                          )}>
                            {VERDICT_LABELS[cs.verdict]}
                          </span>
                        </div>
                        <div>
                          <span className="text-base font-semibold uppercase tracking-wide text-foreground">Context</span>
                          <p className="mt-0.5 text-base text-foreground">{cs.context}</p>
                        </div>
                        <div className="rounded-md border bg-muted p-3">
                          <span className="text-base font-semibold uppercase tracking-wide text-foreground">
                            Reasoning ({VERDICT_LABELS[cs.verdict]})
                          </span>
                          <p className="mt-1 text-base text-foreground">{cs.reasoning}</p>
                        </div>
                        <div className="border-t pt-3 mt-1">
                          <span className="text-base font-semibold uppercase tracking-wide text-foreground">Outcome</span>
                          <p className="mt-0.5 text-base text-foreground">{cs.outcome}</p>
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
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          {nextPath ? (
            <Button onClick={() => router.push(nextPath)}>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => router.push("/solutions")}>Finish</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
