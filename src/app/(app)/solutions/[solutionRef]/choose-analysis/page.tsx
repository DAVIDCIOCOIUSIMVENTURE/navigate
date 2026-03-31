"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { LineTabsList, LineTabsTrigger } from "@/components/ui/tabs-line"
import { useSolution, getAdjacentSteps } from "../context"
import type { AnalysisToolType } from "@/types/solution"
import { Search, ArrowLeft, ArrowRight } from "lucide-react"

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
    "Why? — Customers say the product doesn't match expectations",
    "Why? — Product photos don't accurately represent colours and sizes",
    "Why? — Photos are supplied by manufacturers, not shot in-house",
    "Why? — The team lacks a product photography workflow",
    "Why? — No budget was allocated because returns weren't tracked by cause",
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

type ToolKey = "root-causes" | "five-whys" | "affected-groups"

const VALID_TOOLS: ToolKey[] = ["root-causes", "five-whys", "affected-groups"]

const TOOL_DESCRIPTIONS: Record<ToolKey, { title: string; description: string }> = {
  "root-causes": {
    title: "Root Causes",
    description: "List the underlying causes of the problem. Ask yourself: \"Why does this happen?\" This technique helps you move beyond surface-level symptoms to uncover what's really driving the issue.",
  },
  "five-whys": {
    title: "5 Whys Technique",
    description: "Start with the problem and ask \"Why?\" five times in succession. Each answer becomes the basis for the next question, drilling down to the fundamental root cause.",
  },
  "affected-groups": {
    title: "Affected Groups",
    description: "Identify who is most affected by this problem and how severely. Understanding the different groups helps you design a solution that targets the right audience.",
  },
}

export default function ChooseAnalysisPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionRef, problem, analysisToolType, setAnalysisToolType } = useSolution()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionRef)

  const activeTab: ToolKey = analysisToolType && VALID_TOOLS.includes(analysisToolType as ToolKey)
    ? (analysisToolType as ToolKey)
    : "root-causes"

  const handleTabChange = (value: string) => {
    setAnalysisToolType(value as AnalysisToolType)
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Search}>Choose Your Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {problem?.description && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Problem</p>
            <p className="text-sm font-medium">{problem.description}</p>
          </div>
        )}

        <p className="text-md leading-relaxed">
          Before brainstorming solutions, take time to understand <strong>why</strong> the problem exists.
          Choose an analysis technique below to get started.
        </p>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <LineTabsList>
            <LineTabsTrigger value="root-causes">Root Causes</LineTabsTrigger>
            <LineTabsTrigger value="five-whys">5 Whys</LineTabsTrigger>
            <LineTabsTrigger value="affected-groups">Affected Groups</LineTabsTrigger>
          </LineTabsList>

          <TabsContent value="root-causes">
            <div className="rounded-xl bg-muted/50 p-8 flex flex-col gap-5">
              <h3 className="text-lg font-semibold">Root Causes</h3>
              <p className="text-sm leading-relaxed">
                {TOOL_DESCRIPTIONS["root-causes"].description}
              </p>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Examples</p>
                {ROOT_CAUSE_CASES.map((cs) => (
                  <div key={cs.title} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                    <p className="text-sm font-semibold">{cs.title}</p>
                    <p className="text-xs text-muted-foreground"><strong>Problem:</strong> {cs.problem}</p>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground flex flex-col gap-1">
                      {cs.rootCauses.map((rc) => (
                        <li key={rc}>{rc}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="five-whys">
            <div className="rounded-xl bg-muted/50 p-8 flex flex-col gap-5">
              <h3 className="text-lg font-semibold">5 Whys Technique</h3>
              <p className="text-sm leading-relaxed">
                {TOOL_DESCRIPTIONS["five-whys"].description}
              </p>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
                <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                  <p className="text-sm font-semibold">{FIVE_WHYS_CASE.title}</p>
                  <p className="text-xs text-muted-foreground"><strong>Problem:</strong> {FIVE_WHYS_CASE.problem}</p>
                  <ul className="flex flex-col gap-1.5 mt-1">
                    {FIVE_WHYS_CASE.chain.map((step, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-muted-foreground">
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
          </TabsContent>

          <TabsContent value="affected-groups">
            <div className="rounded-xl bg-muted/50 p-8 flex flex-col gap-5">
              <h3 className="text-lg font-semibold">Affected Groups</h3>
              <p className="text-sm leading-relaxed">
                {TOOL_DESCRIPTIONS["affected-groups"].description}
              </p>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
                {AFFECTED_GROUP_CASES.map((cs) => (
                  <div key={cs.title} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                    <p className="text-sm font-semibold">{cs.title}</p>
                    <p className="text-xs text-muted-foreground"><strong>Problem:</strong> {cs.problem}</p>
                    <div className="flex flex-col gap-2 mt-1">
                      {cs.groups.map((g) => (
                        <div key={g.name} className="flex flex-col gap-0.5 rounded bg-muted/50 p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{g.name}</span>
                            <span className="text-[10px] rounded bg-primary/10 text-primary px-1.5 py-0.5 font-medium">{g.severity}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{g.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
