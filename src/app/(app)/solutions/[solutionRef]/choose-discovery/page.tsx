"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { LineTabsList, LineTabsTrigger } from "@/components/ui/tabs-line"
import { useSolution, getAdjacentSteps } from "../context"
import type { DiscoveryToolType } from "@/types/solution"
import { Shuffle, ArrowLeft, ArrowRight } from "lucide-react"

type ToolKey = "scamper" | "reverse" | "analogy" | "improve"

const VALID_TOOLS: ToolKey[] = ["scamper", "reverse", "analogy", "improve"]

const TOOL_DESCRIPTIONS: Record<ToolKey, { title: string; description: string }> = {
  scamper: {
    title: "SCAMPER Method",
    description: "SCAMPER is a creative thinking technique that prompts you to look at a problem from seven angles: Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, and Reverse. Each prompt sparks ideas you wouldn't reach through normal brainstorming.",
  },
  reverse: {
    title: "Reverse Brainstorming",
    description: "Instead of solving the problem directly, first brainstorm how to make it worse. Then flip each \"make it worse\" idea to discover creative solutions you might not have considered. This counterintuitive approach breaks you out of conventional thinking patterns.",
  },
  analogy: {
    title: "Analogy Thinking",
    description: "Look outside your domain for inspiration. How have other industries solved similar problems? Cross-pollinating ideas from different fields often leads to breakthrough solutions that feel fresh and unexpected.",
  },
  improve: {
    title: "Improve Existing Solutions",
    description: "Rather than inventing something entirely new, systematically improve an existing product or service from the customer's perspective. Work through 15 improvement dimensions covering the entire customer journey: core functionality, ease of use, trust, delivery, and post-purchase experience.",
  },
}

const SCAMPER_CASE = {
  title: "Parking in Busy Cities",
  problem: "Drivers spend 20+ minutes looking for parking",
  examples: [
    { letter: "S", idea: "Substitute car parks with shared drop-off zones (like ride-share pick-up points)" },
    { letter: "C", idea: "Combine parking with public transit: park at hubs, take a shuttle the last mile" },
    { letter: "A", idea: "Adapt hotel valet concepts: app-based valet that parks your car while you shop" },
    { letter: "E", idea: "Eliminate the need to park by incentivising remote work or delivery services" },
    { letter: "R", idea: "Reverse: instead of drivers finding parking, parking finds drivers (real-time slot alerts)" },
  ],
}

const REVERSE_CASE = {
  title: "Customer Support Wait Times",
  problem: "Average wait time is 15 minutes",
  worse: "Remove call-back option. Staff only one agent. Make the IVR menu 10 levels deep. Play ads while customers wait. Require customers to re-explain issues after every transfer.",
  inverted: "Add instant call-back. Staff based on live demand. Flatten IVR to 2 levels. Provide estimated wait + self-service links. Persist customer context across transfers.",
}

const ANALOGY_CASES = [
  {
    title: "Hospital Patient Flow",
    problem: "Emergency rooms are overcrowded",
    domain: "Airport security",
    insight: "Airports use triage lanes (TSA PreCheck, priority, standard). Hospitals adopted tiered intake: fast-track for minor injuries, express diagnostics for moderate cases, and full ER for critical patients. This reduced average wait by 40%.",
  },
  {
    title: "Software Deployment Risk",
    problem: "Releases frequently cause outages",
    domain: "Aviation",
    insight: "Airlines use pre-flight checklists and staged procedures (taxi, hold, clear for takeoff). Teams adopted deployment checklists with staged rollouts (canary → 10% → 50% → 100%) with automatic rollback triggers.",
  },
]

const IMPROVE_CASE = {
  title: "Food Delivery App",
  problem: "Customers are switching to competitors despite decent delivery times",
  examples: [
    { dimension: "Core Functionality", idea: "Improve delivery time accuracy from +/-15 min to +/-3 min using real-time GPS" },
    { dimension: "Ease of Use", idea: "Replace 6-step checkout with one-tap reorder for previous favourites" },
    { dimension: "Price Value", idea: "Add a loyalty programme (every 10th order free) instead of lowering prices" },
    { dimension: "Emotional Experience", idea: "Include a handwritten thank-you note from the restaurant in each bag" },
    { dimension: "Risk Reduction", idea: "Offer a money-back guarantee if delivery is more than 10 minutes late" },
  ],
}

export default function ChooseDiscoveryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionRef, problem, discoveryToolType, setDiscoveryToolType } = useSolution()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionRef)

  const activeTab: ToolKey = discoveryToolType && VALID_TOOLS.includes(discoveryToolType as ToolKey)
    ? (discoveryToolType as ToolKey)
    : "scamper"

  const handleTabChange = (value: string) => {
    setDiscoveryToolType(value as DiscoveryToolType)
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Shuffle}>Choose Your Discovery Method</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {problem?.description && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Problem</p>
            <p className="text-sm font-medium">{problem.description}</p>
          </div>
        )}

        <p className="text-md leading-relaxed">
          Use creative brainstorming techniques to generate solution candidates.
          Choose a technique below to get started.
        </p>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <LineTabsList>
            <LineTabsTrigger value="scamper">SCAMPER</LineTabsTrigger>
            <LineTabsTrigger value="reverse">Reverse</LineTabsTrigger>
            <LineTabsTrigger value="analogy">Analogy</LineTabsTrigger>
            <LineTabsTrigger value="improve">Improve</LineTabsTrigger>
          </LineTabsList>

          <TabsContent value="scamper">
            <div className="rounded-xl bg-muted/50 p-8 flex flex-col gap-5">
              <h3 className="text-lg font-semibold text-primary">SCAMPER Method</h3>
              <p className="text-md leading-relaxed">
                {TOOL_DESCRIPTIONS.scamper.description}
              </p>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
                <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                  <p className="text-md font-semibold">{SCAMPER_CASE.title}</p>
                  <p className="text-md text-muted-foreground"><strong>Problem:</strong> {SCAMPER_CASE.problem}</p>
                  <div className="flex flex-col gap-2 mt-1">
                    {SCAMPER_CASE.examples.map((ex) => (
                      <div key={ex.letter} className="flex gap-2 items-start">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {ex.letter}
                        </span>
                        <p className="text-md text-muted-foreground">{ex.idea}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reverse">
            <div className="rounded-xl bg-muted/50 p-8 flex flex-col gap-5">
              <h3 className="text-lg font-semibold text-primary">Reverse Brainstorming</h3>
              <p className="text-md leading-relaxed">
                {TOOL_DESCRIPTIONS.reverse.description}
              </p>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
                <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
                  <p className="text-md font-semibold">{REVERSE_CASE.title}</p>
                  <p className="text-md text-muted-foreground"><strong>Problem:</strong> {REVERSE_CASE.problem}</p>
                  <div className="flex flex-col gap-2">
                    <div className="rounded bg-red-50 dark:bg-red-950/30 p-3">
                      <p className="text-md font-semibold text-red-700 dark:text-red-400 mb-1">Make it worse:</p>
                      <p className="text-md text-muted-foreground">{REVERSE_CASE.worse}</p>
                    </div>
                    <div className="rounded bg-green-50 dark:bg-green-950/30 p-3">
                      <p className="text-md font-semibold text-green-700 dark:text-green-400 mb-1">Flip it:</p>
                      <p className="text-md text-muted-foreground">{REVERSE_CASE.inverted}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analogy">
            <div className="rounded-xl bg-muted/50 p-8 flex flex-col gap-5">
              <h3 className="text-lg font-semibold text-primary">Analogy Thinking</h3>
              <p className="text-md leading-relaxed">
                {TOOL_DESCRIPTIONS.analogy.description}
              </p>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Examples</p>
                {ANALOGY_CASES.map((cs) => (
                  <div key={cs.title} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                    <p className="text-md font-semibold">{cs.title}</p>
                    <p className="text-md text-muted-foreground"><strong>Problem:</strong> {cs.problem}</p>
                    <div className="rounded bg-blue-50 dark:bg-blue-950/30 p-3 mt-1">
                      <p className="text-md font-semibold text-blue-700 dark:text-blue-400 mb-1">
                        Analogy from: {cs.domain}
                      </p>
                      <p className="text-md text-muted-foreground">{cs.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="improve">
            <div className="rounded-xl bg-muted/50 p-8 flex flex-col gap-5">
              <h3 className="text-lg font-semibold text-primary">Improve Existing Solutions</h3>
              <p className="text-md leading-relaxed">
                {TOOL_DESCRIPTIONS.improve.description}
              </p>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
                <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                  <p className="text-md font-semibold">{IMPROVE_CASE.title}</p>
                  <p className="text-md text-muted-foreground"><strong>Problem:</strong> {IMPROVE_CASE.problem}</p>
                  <div className="flex flex-col gap-2 mt-1">
                    {IMPROVE_CASE.examples.map((ex) => (
                      <div key={ex.dimension} className="flex gap-2 items-start">
                        <span className="flex h-5 shrink-0 items-center justify-center rounded-full bg-primary/10 px-2 text-[10px] font-bold text-primary">
                          {ex.dimension}
                        </span>
                        <p className="text-md text-muted-foreground">{ex.idea}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          {nextPath && (
            <Button onClick={() => router.push(nextPath)}>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
