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
import { useProblemValidation, getAdjacentSteps } from "../context"
import type { AnalysisToolType } from "@/types/solution"
import { Search, ArrowLeft, ArrowRight, TreePine, HelpCircle, Users, CheckCircle2 } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

type ToolKey = "root-causes" | "five-whys" | "affected-groups"

const TOOL_CARDS: Record<ToolKey, { title: string; description: string; icon: typeof Search }> = {
  "root-causes": {
    title: "Root Causes",
    description: "List the underlying causes of the problem. Move beyond surface-level symptoms to uncover what is really driving the issue.",
    icon: TreePine,
  },
  "five-whys": {
    title: "5 Whys Technique",
    description: "Ask \"Why?\" five times in succession. Each answer becomes the basis for the next question, drilling down to the fundamental root cause.",
    icon: HelpCircle,
  },
  "affected-groups": {
    title: "Affected Groups",
    description: "Identify who is most affected by this problem and how severely. Understand the different groups to target the right audience.",
    icon: Users,
  },
}

const ROOT_CAUSE_CASES = [
  {
    title: "Food Delivery App",
    problem: "Customers frequently receive cold food",
    rootCauses: [
      "Drivers take multiple orders on different routes",
      "Restaurant preparation time estimates are inaccurate",
      "No insulated packaging requirements for restaurants",
      "Routing algorithm prioritises distance over delivery time",
    ],
  },
  {
    title: "SaaS Onboarding",
    problem: "80% of trial users never complete setup",
    rootCauses: [
      "Setup requires 12 steps before seeing any value",
      "Users don't understand which features solve their problem",
      "No guided tour or contextual help during setup",
      "Required integrations fail silently without error messages",
    ],
  },
]

const FIVE_WHYS_CASE = {
  title: "E-Commerce Returns",
  problem: "High rate of product returns",
  chain: [
    "Customers say the product doesn't match expectations",
    "Product photos don't accurately represent colours and sizes",
    "Photos are supplied by manufacturers, not shot in-house",
    "The team lacks a product photography workflow",
    "No budget was allocated because returns weren't tracked by cause",
  ],
}

const AFFECTED_GROUP_CASES = [
  {
    title: "Healthcare Scheduling",
    problem: "Patients miss appointments frequently",
    groups: [
      { name: "Elderly patients", severity: "Critical", description: "Struggle with technology, forget appointments without reminders" },
      { name: "Working parents", severity: "High", description: "Conflicting schedules, hard to rebook during work hours" },
      { name: "Rural patients", severity: "Medium", description: "Long travel distances make rescheduling costly" },
    ],
  },
]

function RootCausesDialogContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed">
        List the underlying causes of the problem. Ask yourself: &quot;Why does this happen?&quot; This technique helps you move beyond surface-level symptoms to uncover what&apos;s really driving the issue.
      </p>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Examples</p>
        {ROOT_CAUSE_CASES.map((cs) => (
          <div key={cs.title} className="rounded-lg border bg-muted/50 p-4 flex flex-col gap-2">
            <p className="text-sm font-semibold">{cs.title}</p>
            <p className="text-sm text-muted-foreground"><strong>Problem:</strong> {cs.problem}</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground flex flex-col gap-1">
              {cs.rootCauses.map((rc) => (
                <li key={rc}>{rc}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function FiveWhysDialogContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed">
        Start with the problem and ask &quot;Why?&quot; five times in succession. Each answer becomes the basis for the next question, drilling down to the fundamental root cause.
      </p>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
        <div className="rounded-lg border bg-muted/50 p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold">{FIVE_WHYS_CASE.title}</p>
          <p className="text-sm text-muted-foreground"><strong>Problem:</strong> {FIVE_WHYS_CASE.problem}</p>
          <ul className="flex flex-col gap-1.5 mt-1">
            {FIVE_WHYS_CASE.chain.map((step, i) => (
              <li key={i} className="flex gap-2 items-start text-sm text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function AffectedGroupsDialogContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed">
        Identify who is most affected by this problem and how severely. Understanding the different groups helps you design a solution that targets the right audience.
      </p>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
        {AFFECTED_GROUP_CASES.map((cs) => (
          <div key={cs.title} className="rounded-lg border bg-muted/50 p-4 flex flex-col gap-2">
            <p className="text-sm font-semibold">{cs.title}</p>
            <p className="text-sm text-muted-foreground"><strong>Problem:</strong> {cs.problem}</p>
            <div className="flex flex-col gap-2 mt-1">
              {cs.groups.map((g) => (
                <div key={g.name} className="flex flex-col gap-0.5 rounded bg-muted/50 p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{g.name}</span>
                    <span className="text-xs rounded bg-primary/10 text-primary px-1.5 py-0.5 font-medium">{g.severity}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{g.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const DIALOG_CONTENT: Record<ToolKey, () => React.JSX.Element> = {
  "root-causes": RootCausesDialogContent,
  "five-whys": FiveWhysDialogContent,
  "affected-groups": AffectedGroupsDialogContent,
}

const TOOL_ORDER: ToolKey[] = ["root-causes", "five-whys", "affected-groups"]

export default function ChooseRefinementPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problem, problemRef, analysisToolType, setAnalysisToolType } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const [openTool, setOpenTool] = useState<ToolKey | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isNarrow = useContainerSize() === "narrow"

  const selectedTool = (analysisToolType || null) as ToolKey | null

  const handleChoose = (tool: ToolKey) => {
    setAnalysisToolType(tool as AnalysisToolType)
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
          <CardTitle icon={Search}>Choose Your Refinement Method</CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-6 flex flex-col gap-6">
          {problem?.description && (
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Problem</p>
              <p className="text-sm font-medium">{problem.description}</p>
            </div>
          )}

          <p className="text-md leading-relaxed">
            Take time to understand <strong>why</strong> this problem exists and <strong>who</strong> it affects.
            Choose a refinement technique below to get started.
          </p>

          <div className={cn("grid gap-4", isNarrow ? "grid-cols-1" : "grid-cols-3")}>
            {TOOL_ORDER.map((key) => {
              const tool = TOOL_CARDS[key]
              const Icon = tool.icon
              const isSelected = selectedTool === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOpenTool(key)}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative flex flex-col gap-3 rounded-xl border-2 p-6 pr-8 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40 ring-offset-2"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  {isSelected && (
                    <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                      <CheckCircle2 className="h-3 w-3" />
                      Selected
                    </span>
                  )}
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  )}>
                    <Icon className={cn("h-5 w-5", isSelected ? "text-primary-foreground" : "text-primary")} />
                  </div>
                  <h3 className={cn("text-md font-semibold", isSelected && "text-primary")}>{tool.title}</h3>
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
                <DialogTitle>{TOOL_CARDS[openTool].title}</DialogTitle>
                <DialogDescription>
                  Learn how this method works, then choose it to start refining your problem.
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Continue without a refinement method?</DialogTitle>
            <DialogDescription>
              You haven&apos;t chosen a refinement method yet. Picking one helps you uncover why the problem exists before moving on. Are you sure you want to continue?
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
