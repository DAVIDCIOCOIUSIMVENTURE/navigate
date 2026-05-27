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
import { Shuffle, ArrowLeft, ArrowRight, Lightbulb, RotateCcw, GitCompare, Wrench, CheckCircle2 } from "lucide-react"

type ToolKey = "scamper" | "reverse" | "analogy" | "improve"

const TOOL_CARDS: Record<ToolKey, { title: string; description: string; icon: typeof Lightbulb }> = {
  scamper: {
    title: "SCAMPER Method",
    description: "Look at a problem from seven creative angles: Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, and Reverse.",
    icon: Lightbulb,
  },
  reverse: {
    title: "Reverse Ideation",
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
  S: "bg-red-800",
  C: "bg-orange-700",
  A: "bg-yellow-600",
  M: "bg-emerald-800",
  P: "bg-teal-700",
  E: "bg-rose-800",
  R: "bg-violet-800",
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
        <span className="font-semibold uppercase tracking-wide text-sm">Problem: </span>
        {problem}
      </p>
    </div>
  )
}

function ExampleCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-wide">{children}</p>
  )
}

function ScamperDialogContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-foreground">
        SCAMPER is a creative thinking technique that prompts you to look at a problem from seven angles: Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, and Reverse. Each prompt sparks ideas you wouldn&apos;t reach through conventional ideation.
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
        Instead of solving the problem directly, first generate ways to make it worse. Then flip each &quot;make it worse&quot; idea to discover creative solutions you might not have considered. This counterintuitive approach breaks you out of conventional thinking patterns.
      </p>
      <div className="flex flex-col gap-2">
        <SectionLabel>Example</SectionLabel>
        <ExampleCard>
          <ExampleHeader title={REVERSE_CASE.title} problem={REVERSE_CASE.problem} />
          <div className="flex flex-col gap-2">
            <div className="rounded-md border bg-destructive p-3">
              <p className="text-sm font-bold uppercase tracking-wide text-destructive-foreground mb-1.5">Make it worse</p>
              <p className="text-sm text-destructive-foreground leading-relaxed">{REVERSE_CASE.worse}</p>
            </div>
            <div className="rounded-md border bg-success p-3">
              <p className="text-sm font-bold uppercase tracking-wide text-success-foreground mb-1.5">Flip it into a solution</p>
              <p className="text-sm text-success-foreground leading-relaxed">{REVERSE_CASE.inverted}</p>
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
              <div className="rounded-md border bg-secondary-brand p-3">
                <p className="text-sm font-bold uppercase tracking-wide text-secondary-brand-foreground mb-1.5">
                  Analogy from: {cs.domain}
                </p>
                <p className="text-sm text-secondary-brand-foreground leading-relaxed">{cs.insight}</p>
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
                <span className="inline-flex self-start rounded-md bg-secondary-brand px-2 py-0.5 text-sm font-semibold text-secondary-brand-foreground">
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

const PRIMARY_TOOLS: ToolKey[] = ["scamper", "improve"]
const SECONDARY_TOOLS: ToolKey[] = ["analogy", "reverse"]

export default function ChooseDiscoveryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problem, discoveryToolType, setDiscoveryToolType } = useDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)
  const [openTool, setOpenTool] = useState<ToolKey | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const selectedTool = (discoveryToolType || null) as ToolKey | null

  const handleChoose = (tool: ToolKey) => {
    setDiscoveryToolType(tool as DiscoveryToolType)
    setOpenTool(null)
    if (nextPath) router.push(nextPath)
  }

  const handleNext = () => {
    if (!nextPath) return
    if (!selectedTool) {
      setConfirmOpen(true)
      return
    }
    router.push(nextPath)
  }

  const DialogBody = openTool ? DIALOG_CONTENT[openTool] : null

  return (
    <>
      <Card className="w-full flex-1">
        <CardHeader className="px-10 pt-10 pb-0">
          <CardTitle icon={Shuffle}>Choose Your Discovery Method</CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-6 flex flex-col gap-6">
          {problem && (problem.title || problem.description) && (
            <div className="rounded-lg border-2 border-red-800/20 bg-red-800/5 px-4 py-3">
              <p className="text-base font-semibold uppercase tracking-wide text-red-800 mb-1">Problem</p>
              <p className="text-base font-medium">{problem.title || "Untitled problem"}</p>
              {problem.description && (
                <p className="text-base mt-1">{problem.description}</p>
              )}
            </div>
          )}

          <p className="text-base leading-relaxed">
            Use creative ideation techniques to generate solution candidates.
            Choose a technique below to get started.
          </p>

          {(() => {
            const renderCard = (key: ToolKey) => {
              const tool = TOOL_CARDS[key]
              const Icon = tool.icon
              const isSelected = selectedTool === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOpenTool(key)}
                  aria-pressed={isSelected}
                  className="rounded-md border border-primary bg-primary text-primary-foreground flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-primary/90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-white/20"
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="flex-1 min-w-0 text-base font-bold leading-tight truncate">
                    {tool.title}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-base font-semibold shrink-0 bg-white text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Selected
                    </span>
                  )}
                </button>
              )
            }
            return (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <p className="text-base font-semibold uppercase tracking-wide">Recommended methods</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PRIMARY_TOOLS.map(renderCard)}
                  </div>
                </div>
                <div className="flex flex-col gap-3 border-t pt-5">
                  <p className="text-base font-semibold uppercase tracking-wide">Other methods</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SECONDARY_TOOLS.map(renderCard)}
                  </div>
                </div>
              </div>
            )
          })()}

          <div className="flex justify-between mt-2">
            {prevPath ? (
              <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
                <ArrowLeft className="h-4 w-4 mr-2" />Previous
              </Button>
            ) : <div />}
            {nextPath && (
              <Button onClick={handleNext}>
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
                <DialogTitle>
                  <span className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-md shrink-0 bg-primary"
                      aria-hidden="true"
                    >
                      {(() => {
                        const OpenIcon = TOOL_CARDS[openTool].icon
                        return <OpenIcon className="h-5 w-5 text-white" />
                      })()}
                    </span>
                    <span>{TOOL_CARDS[openTool].title}</span>
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Learn how this method works, then choose it to start discovering solutions.
                </DialogDescription>
              </DialogHeader>
              {DialogBody && <DialogBody />}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenTool(null)}>Cancel</Button>
                <Button onClick={() => handleChoose(openTool)}>
                  {openTool === selectedTool ? "Continue with this method" : "Choose this method"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Continue without a discovery method?</DialogTitle>
            <DialogDescription>
              You haven&apos;t chosen a discovery method yet. Picking one helps you generate stronger solution candidates before moving on. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Go Back</Button>
            <Button
              onClick={() => {
                setConfirmOpen(false)
                if (nextPath) router.push(nextPath)
              }}
            >
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
