"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { VALIDATE_CASE_STUDIES } from "@/components/problem-strategies/validate-case-studies"
import { VerdictStrategy } from "@/components/problem-strategies/validation-strategy"
import { cn } from "@/lib/utils"
import { ShieldCheck, CheckCircle2, HelpCircle, XCircle, Scale, Layers } from "lucide-react"
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
        <CardTitle icon={ShieldCheck} iconBg="bg-orange-700">Record your verdict</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <p>
                You have done the hard work of sizing the market and reading the competitive landscape. Now step back and decide what those numbers actually mean for this problem. The point of a verdict is not to commit forever, it is to be honest with yourself today so you can spend the next month on something worth your time.
              </p>
              <p>
                A useful verdict is grounded in evidence, not enthusiasm. Look across all six factors together: a single weak signal is rarely a deal-breaker, but two or three pointing the same direction usually is. Capture your reasoning in the notes so future-you (or a teammate) can see why you decided what you did, and revise the verdict if new evidence comes in.
              </p>
            </div>
            <img
              src="/illustrations/14-validate-solution.svg"
              alt=""
              className="hidden lg:block w-96 h-auto shrink-0 rounded-lg"
            />
          </div>
          <h3 className="mt-4 text-xl font-bold text-foreground">How to weigh the factors together</h3>
          <p>
            The six factors split naturally into two halves. The market sizing inputs (how many, how often, how much) tell you whether the prize is worth pursuing. The competitive inputs (cost of switching, existing solution effectiveness, competitor size) tell you whether you can realistically capture it. A strong opportunity needs at least decent scores on both halves: a huge market you cannot win is no better than a small market you can dominate.
          </p>
          <p>
            The total addressable market figure is a sanity check, not the verdict. A very large total addressable market with no demonstrated willingness to pay is a mirage, the arithmetic is real but the assumption that customers will hand over that money is not. Equally, a modest total addressable market is fine if willingness to pay is rock-solid and the competitive landscape is friendly.
          </p>
          <p>
            When signals point in different directions, weight evidence over guesses. A &quot;large competitor&quot; you confirmed by reading their financials is worth more than a &quot;weekly frequency&quot; you wrote down without talking to anyone. If your strongest negative signal comes from data and your strongest positive comes from intuition, the data should usually win.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">Patterns that point to each verdict</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-800 shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Lean Valid: the prize and the path both look clear</p>
                <p className="text-base">A market in the tens of thousands or more, weekly-or-more frequency, customers already paying for workarounds, low-to-medium switching costs, average-or-worse alternatives, and competitors that are small or distracted. You should be able to point to at least four favourable signals out of six, and any negatives should be ones you can plausibly work around.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-600 shrink-0 mt-0.5">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Lean Unsure: the picture is genuinely mixed</p>
                <p className="text-base">Two or three signals each way, or one or two inputs are guesses you cannot defend yet. The right move here is rarely another round of desk research: pick the assumption that would most change your mind and design a small experiment (five customer interviews, a fake pricing page, a competitor audit). Use the notes to write down which specific question you are going to answer next.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-800 shrink-0 mt-0.5">
                <XCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Lean Invalid: the evidence is stacked against pursuing this</p>
                <p className="text-base">A small or rare market, low willingness to pay, effective incumbents, high switching costs, or any combination thereof. A single bad signal rarely kills a problem, but four or five together usually do. Calling a problem invalid is a feature, not a failure: it frees you to look for a stronger one rather than spend months pushing uphill against the data.</p>
              </div>
            </div>
          </div>

          <h3 className="mt-4 text-xl font-bold text-foreground">Use the data on this page</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0 mt-0.5">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Read the colour-coded signals first</p>
                <p className="text-base">Each captured factor in the summary below carries a green / amber / red dot based on a rough heuristic. The lean indicator above the verdict buttons tells you which way the evidence is pointing once at least four signals are in. Treat both as a hint, not a verdict, and override them in the notes if you disagree with how a signal is being read.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0 mt-0.5">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Write your reasoning, not just your conclusion</p>
                <p className="text-base">Use the notes to record the two or three signals that drove your decision, plus the strongest counter-argument you considered. Future-you (or a teammate) should be able to read the notes alone and understand why this verdict was reached, and revise it cheaply if new evidence comes in.</p>
              </div>
            </div>
          </div>

          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            Read the colour-coded summary of every signal you have captured, weigh the evidence rather than the enthusiasm, and choose Valid, Unsure, or Invalid. Use the notes field on the form to record the two or three signals that drove your decision and the strongest counter-argument you considered, so the verdict is defensible weeks from now.
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Record your verdict</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <VerdictStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
              <p className="text-base text-foreground">
                See how successful companies weighed all of the signals together to reach a verdict on whether the problem was worth pursuing.
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
                      containerSize === "narrow" ? "grid-cols-1" : "grid-cols-2",
                    )}>
                      <div>
                        <span className="text-base font-semibold text-foreground">Market signals</span>
                        <ul className="mt-1 text-base text-foreground list-disc pl-5 space-y-1">
                          <li>{cs.howManyPeople.value.toLocaleString()} customers</li>
                          <li>{cs.howOften.value} {cs.howOften.unit}</li>
                          <li>{cs.worthToThem.value} {cs.worthToThem.unit}</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-foreground">Competitive signals</span>
                        <ul className="mt-1 text-base text-foreground list-disc pl-5 space-y-1">
                          <li>Cost of switching: <span className="capitalize">{cs.costOfSwitching.level}</span></li>
                          <li>Solution effectiveness: <span className="capitalize">{cs.solutionEffectiveness.level}</span></li>
                          <li>Competitor size: <span className="capitalize">{cs.competitorSize.level}</span></li>
                        </ul>
                      </div>
                    </div>
                    <div className="border-t pt-3 mt-1">
                      <span className="text-base font-semibold text-foreground">Verdict: {cs.verdict}</span>
                      <p className="mt-1 text-base text-foreground">{cs.reasoning}</p>
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
