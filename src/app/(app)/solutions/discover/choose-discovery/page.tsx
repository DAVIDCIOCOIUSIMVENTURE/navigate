"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useDiscovery, getAdjacentSteps } from "../context"
import type { DiscoveryToolType } from "@/types/solution"
import { Shuffle, ArrowLeft, ArrowRight, Lightbulb, RotateCcw, GitCompare, Wrench } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

type ToolKey = "scamper" | "reverse" | "analogy" | "improve"

const TOOL_CARDS: Record<ToolKey, { title: string; description: string; icon: typeof Lightbulb }> = {
  scamper: {
    title: "SCAMPER Method",
    description: "Look at a problem from seven creative angles: Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, and Reverse.",
    icon: Lightbulb,
  },
  reverse: {
    title: "Reverse Brainstorming",
    description: "Generate ideas by first thinking how to make the problem worse, then flipping each idea into a creative solution.",
    icon: RotateCcw,
  },
  analogy: {
    title: "Analogy Thinking",
    description: "Look outside your domain for inspiration. Cross-pollinate ideas from other industries solving similar problems.",
    icon: GitCompare,
  },
  improve: {
    title: "Improve Existing Solutions",
    description: "Systematically improve an existing product or service across 15 customer journey dimensions.",
    icon: Wrench,
  },
}

const SCAMPER_LETTER_COLORS: Record<string, string> = {
  S: "bg-red-500",
  C: "bg-orange-500",
  A: "bg-amber-500",
  M: "bg-emerald-500",
  P: "bg-cyan-500",
  E: "bg-pink-500",
  R: "bg-fuchsia-500",
}

const SCAMPER_CASE = {
  title: "Parking in Busy Cities",
  problem: "Drivers spend 20+ minutes looking for parking",
  examples: [
    { letter: "S", idea: "Substitute car parks with shared drop-off zones (like ride-share pick-up points)" },
    { letter: "C", idea: "Combine parking with public transit: park at hubs, take a shuttle the last mile" },
    { letter: "A", idea: "Adapt hotel valet concepts: app-based valet that parks your car while you shop" },
    { letter: "M", idea: "Modify parking spaces into stackable, vertical lifts so one spot fits three cars" },
    { letter: "P", idea: "Put underused spaces to other use: turn driveways and office lots into paid parking on weekends" },
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
    insight: "Airlines use pre-flight checklists and staged procedures (taxi, hold, clear for takeoff). Teams adopted deployment checklists with staged rollouts (canary, 10%, 50%, 100%) with automatic rollback triggers.",
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

function ExampleHeader({ title, problem }: { title: string; problem: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-sm text-foreground/80">
        <span className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Problem: </span>
        {problem}
      </p>
    </div>
  )
}

function ExampleCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-background p-4 flex flex-col gap-3">
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
  )
}

function ScamperDialogContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-foreground">
        SCAMPER is a creative thinking technique that prompts you to look at a problem from seven angles: Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, and Reverse. Each prompt sparks ideas you wouldn&apos;t reach through normal brainstorming.
      </p>
      <div className="flex flex-col gap-2">
        <SectionLabel>Example</SectionLabel>
        <ExampleCard>
          <ExampleHeader title={SCAMPER_CASE.title} problem={SCAMPER_CASE.problem} />
          <div className="flex flex-col gap-2 border-t pt-3">
            {SCAMPER_CASE.examples.map((ex) => (
              <div key={ex.letter} className="flex gap-2.5 items-start">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${SCAMPER_LETTER_COLORS[ex.letter] ?? "bg-primary"} text-[11px] font-bold text-white`}>
                  {ex.letter}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{ex.idea}</p>
              </div>
            ))}
          </div>
        </ExampleCard>
      </div>
    </div>
  )
}

function ReverseDialogContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-foreground">
        Instead of solving the problem directly, first brainstorm how to make it worse. Then flip each &quot;make it worse&quot; idea to discover creative solutions you might not have considered. This counterintuitive approach breaks you out of conventional thinking patterns.
      </p>
      <div className="flex flex-col gap-2">
        <SectionLabel>Example</SectionLabel>
        <ExampleCard>
          <ExampleHeader title={REVERSE_CASE.title} problem={REVERSE_CASE.problem} />
          <div className="flex flex-col gap-2">
            <div className="rounded-md border border-rose-200/70 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300 mb-1.5">Make it worse</p>
              <p className="text-sm text-foreground leading-relaxed">{REVERSE_CASE.worse}</p>
            </div>
            <div className="rounded-md border border-teal-200/70 bg-teal-50 dark:border-teal-900/60 dark:bg-teal-950/40 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300 mb-1.5">Flip it into a solution</p>
              <p className="text-sm text-foreground leading-relaxed">{REVERSE_CASE.inverted}</p>
            </div>
          </div>
        </ExampleCard>
      </div>
    </div>
  )
}

function AnalogyDialogContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-foreground">
        Look outside your domain for inspiration. How have other industries solved similar problems? Cross-pollinating ideas from different fields often leads to breakthrough solutions that feel fresh and unexpected.
      </p>
      <div className="flex flex-col gap-2">
        <SectionLabel>Examples</SectionLabel>
        <div className="flex flex-col gap-3">
          {ANALOGY_CASES.map((cs) => (
            <ExampleCard key={cs.title}>
              <ExampleHeader title={cs.title} problem={cs.problem} />
              <div className="rounded-md border border-sky-200 bg-sky-100 dark:border-sky-900 dark:bg-sky-950/60 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-sky-800 dark:text-sky-300 mb-1.5">
                  Analogy from: {cs.domain}
                </p>
                <p className="text-sm text-foreground leading-relaxed">{cs.insight}</p>
              </div>
            </ExampleCard>
          ))}
        </div>
      </div>
    </div>
  )
}

function ImproveDialogContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-foreground">
        Rather than inventing something entirely new, systematically improve an existing product or service from the customer&apos;s perspective. Work through 15 improvement dimensions covering the entire customer journey: core functionality, ease of use, trust, delivery, and post-purchase experience.
      </p>
      <div className="flex flex-col gap-2">
        <SectionLabel>Example</SectionLabel>
        <ExampleCard>
          <ExampleHeader title={IMPROVE_CASE.title} problem={IMPROVE_CASE.problem} />
          <div className="flex flex-col divide-y border-t">
            {IMPROVE_CASE.examples.map((ex) => (
              <div key={ex.dimension} className="flex flex-col gap-1 py-2.5 first:pt-3 last:pb-0">
                <span className="inline-flex self-start rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  {ex.dimension}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{ex.idea}</p>
              </div>
            ))}
          </div>
        </ExampleCard>
      </div>
    </div>
  )
}

const DIALOG_CONTENT: Record<ToolKey, () => React.JSX.Element> = {
  scamper: ScamperDialogContent,
  reverse: ReverseDialogContent,
  analogy: AnalogyDialogContent,
  improve: ImproveDialogContent,
}

const TOOL_ORDER: ToolKey[] = ["scamper", "reverse", "analogy", "improve"]

export default function ChooseDiscoveryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problem, setDiscoveryToolType } = useDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)
  const [openTool, setOpenTool] = useState<ToolKey | null>(null)
  const isNarrow = useContainerSize() === "narrow"

  const handleChoose = (tool: ToolKey) => {
    setDiscoveryToolType(tool as DiscoveryToolType)
    setOpenTool(null)
    if (nextPath) router.push(nextPath)
  }

  const DialogBody = openTool ? DIALOG_CONTENT[openTool] : null

  return (
    <>
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

          <p className="text-base leading-relaxed">
            Use creative brainstorming techniques to generate solution candidates.
            Choose a technique below to get started.
          </p>

          <div className={cn("grid gap-4", isNarrow ? "grid-cols-1" : "grid-cols-2")}>
            {TOOL_ORDER.map((key) => {
              const tool = TOOL_CARDS[key]
              const Icon = tool.icon
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOpenTool(key)}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-6 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                </button>
              )
            })}
          </div>

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

      <Dialog open={openTool !== null} onOpenChange={(open) => { if (!open) setOpenTool(null) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {openTool && (
            <>
              <DialogHeader>
                <DialogTitle>{TOOL_CARDS[openTool].title}</DialogTitle>
                <DialogDescription>
                  Learn how this method works, then choose it to start discovering solutions.
                </DialogDescription>
              </DialogHeader>
              {DialogBody && <DialogBody />}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenTool(null)}>Cancel</Button>
                <Button onClick={() => handleChoose(openTool)}>Choose This Method</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
