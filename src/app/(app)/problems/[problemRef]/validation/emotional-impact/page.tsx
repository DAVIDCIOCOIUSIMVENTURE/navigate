"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { EmotionalImpactStrategy } from "@/components/problem-strategies/validation-strategy"
import { VALIDATE_CASE_STUDIES } from "@/components/problem-strategies/validate-case-studies"
import { Heart, Flame, ShieldAlert, Frown, Clock } from "lucide-react"

export default function EmotionalImpactPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Heart} iconBg="bg-secondary-brand">Emotional impact on the customer</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-base">
          <p>
            Money is only half the story. The previous step asked how much an occurrence is worth in cash; this one asks how much it hurts. People will pay disproportionately to make pain stop, so a problem that lands at the top of this scale can carry a verdict even when the monetary worth is modest. Equally, a problem nobody really minds is rarely worth solving, no matter how large the market looks on paper.
          </p>
          <p>
            Read the emotional weight from the customer&apos;s point of view, not yours. Lean on what real people have said: complaints, swearing, eye-rolls, late-night Google searches, the sigh when a workaround fails for the fifth time. If you cannot point to a moment where someone reacted that strongly, the level you pick is probably one notch too high.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">What to read for</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-800 shrink-0 mt-0.5">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Frustration in the moment</p>
                <p className="text-base">How aggravating is one occurrence while it is happening? Listen for swearing, repeated attempts, abandoned tasks, or workarounds picked up out of irritation rather than need.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-700 shrink-0 mt-0.5">
                <ShieldAlert className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Anxiety about the unresolved problem</p>
                <p className="text-base">Even when the problem is not actively biting, does it sit in the back of the customer&apos;s mind? Stress, dread, and avoidance behaviour all point to a stronger emotional pull than the cash number alone would suggest.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-900 shrink-0 mt-0.5">
                <Frown className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Embarrassment, shame, or status loss</p>
                <p className="text-base">Problems that make customers feel incompetent in front of colleagues, clients, or family carry far more weight than the same problem suffered in private. Watch for hidden workarounds and reluctance to discuss the issue openly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 shrink-0 mt-0.5">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">How long the bad feeling lingers</p>
                <p className="text-base">A sharp annoyance that fades in a minute is different from a knot that ruins the afternoon. Persistent emotional residue is one of the strongest indicators that the customer would pay to make the problem disappear.</p>
              </div>
            </div>
          </div>

          <h3 className="mt-4 text-xl font-bold text-foreground">How to pick a level</h3>
          <p>
            Treat the scale as anchored: <strong className="text-foreground">mild</strong> is &quot;mildly annoying, forgotten within the hour&quot;, <strong className="text-foreground">moderate</strong> is &quot;noticeably frustrating, talked about over coffee&quot;, <strong className="text-foreground">strong</strong> is &quot;makes the customer rearrange their day to avoid it&quot;, <strong className="text-foreground">severe</strong> is &quot;loses sleep, complains in writing&quot;, and <strong className="text-foreground">unbearable</strong> is &quot;will switch tools, jobs, or providers to make it stop&quot;. If your evidence does not match the anchor, pick the lower level.
          </p>

          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            Pick the level that matches what real customers have said and done, not how strongly you feel about the problem. This signal joins the six monetary and competitive signals on the verdict step, so an honest read here is what makes the final lean defensible.
          </p>
        </div>

        <hr className="border-border/40 my-4" />

        <div className="flex flex-col gap-2 items-center text-center">
          <h3 className="text-xl font-bold"><span className="text-primary">Your Turn:</span> How much does this hurt the customer?</h3>
          <p className="text-base max-w-xl">
            Pick the level that best matches the emotional weight of one occurrence, drawing on what customers have actually said or done.
          </p>
        </div>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <EmotionalImpactStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
              <p className="text-base text-foreground">
                See how successful companies read the emotional weight of the problem, not just the cash value, before deciding it was worth solving.
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
                          <span className="text-base font-semibold text-foreground">Emotional impact on the customer</span>
                          <p className="mt-1 text-base text-foreground">
                            <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-base font-semibold text-foreground capitalize mr-1">{cs.emotionalImpact.level}</span>
                            {cs.emotionalImpact.detail}
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
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
