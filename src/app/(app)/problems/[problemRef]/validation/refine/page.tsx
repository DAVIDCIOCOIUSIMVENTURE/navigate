"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProblem, getAdjacentSteps } from "../context"
import { ROOT_CAUSES_CASE_STUDIES } from "./root-causes-case-studies"
import { FIVE_WHYS_CASE_STUDIES } from "./five-whys-case-studies"
import { AFFECTED_GROUPS_CASE_STUDIES } from "./affected-groups-case-studies"
import { RefinementStrategy } from "@/components/problem-strategies/refinement-strategy"
import { ProblemContextCard } from "@/components/problem-context-card"
import {
  Search, Plus, Trash2, ArrowLeft, ArrowRight,
  Car, MessageSquare, Stethoscope, Wrench, Landmark, Cloud,
  GraduationCap, CreditCard,
  type LucideIcon,
} from "lucide-react"

const ROOT_CAUSES_CASE_STUDY_ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  "Toyota (post-war production)": { icon: Car, bg: "bg-red-800" },
  "Slack (early enterprise rollout)": { icon: MessageSquare, bg: "bg-violet-800" },
  "NHS A&E waiting times": { icon: Stethoscope, bg: "bg-teal-700" },
}

function RootCausesCaseStudies() {
  return (
    <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
      <p className="text-base text-foreground">
        See how successful organisations dug past surface-level symptoms to identify the underlying causes that, once fixed, prevented entire categories of failure.
      </p>
      <Tabs defaultValue={ROOT_CAUSES_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
        <TabsList className="self-center bg-background h-auto flex-wrap">
          {ROOT_CAUSES_CASE_STUDIES.map((cs) => {
            const meta = ROOT_CAUSES_CASE_STUDY_ICONS[cs.company]
            const Icon = meta?.icon
            return (
              <TabsTrigger
                key={cs.company}
                value={cs.company}
                className="gap-1.5"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cs.company}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {ROOT_CAUSES_CASE_STUDIES.map((cs) => {
          const meta = ROOT_CAUSES_CASE_STUDY_ICONS[cs.company]
          const Icon = meta?.icon
          return (
            <TabsContent key={cs.company} value={cs.company}>
              <div className="rounded-lg border bg-card p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                      meta.bg,
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-base font-semibold text-foreground">{cs.company}</p>
                </div>
                <div>
                  <span className="text-base font-semibold text-foreground">Problem</span>
                  <p className="mt-1 text-base text-foreground">{cs.problem}</p>
                </div>
                <div>
                  <span className="text-base font-semibold text-foreground">Root Causes</span>
                  <div className="mt-2 flex flex-col gap-2">
                    {cs.causes.map((cause, i) => (
                      <div key={i} className="rounded-md border bg-muted p-3">
                        <p className="text-base font-semibold text-foreground">{cause.title}</p>
                        <p className="mt-1 text-base text-foreground">{cause.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border bg-muted p-3">
                  <span className="text-base font-semibold text-foreground">Notes</span>
                  <p className="mt-1 text-base text-foreground">{cs.notes}</p>
                </div>
                <div className="border-t pt-3 mt-1">
                  <span className="text-base font-semibold text-foreground">Outcome</span>
                  <p className="mt-1 text-base text-foreground">{cs.outcome}</p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

const FIVE_WHYS_CASE_STUDY_ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  "Toyota (the original 5 Whys)": { icon: Wrench, bg: "bg-red-800" },
  "NASA Jefferson Memorial": { icon: Landmark, bg: "bg-blue-900" },
  "Amazon (S3 outage, 2017)": { icon: Cloud, bg: "bg-orange-700" },
}

function FiveWhysCaseStudies() {
  return (
    <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
      <p className="text-base text-foreground">
        See how teams used the 5 Whys to push past the first plausible answer and reach a fundamental cause that, once addressed, prevented the problem from recurring.
      </p>
      <Tabs defaultValue={FIVE_WHYS_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
        <TabsList className="self-center bg-background h-auto flex-wrap">
          {FIVE_WHYS_CASE_STUDIES.map((cs) => {
            const meta = FIVE_WHYS_CASE_STUDY_ICONS[cs.company]
            const Icon = meta?.icon
            return (
              <TabsTrigger
                key={cs.company}
                value={cs.company}
                className="gap-1.5"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cs.company}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {FIVE_WHYS_CASE_STUDIES.map((cs) => {
          const meta = FIVE_WHYS_CASE_STUDY_ICONS[cs.company]
          const Icon = meta?.icon
          return (
            <TabsContent key={cs.company} value={cs.company}>
              <div className="rounded-lg border bg-card p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                      meta.bg,
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-base font-semibold text-foreground">{cs.company}</p>
                </div>
                <div>
                  <span className="text-base font-semibold text-foreground">Problem</span>
                  <p className="mt-1 text-base text-foreground">{cs.problem}</p>
                </div>
                {cs.chains.map((chain, ci) => (
                  <div key={ci} className="flex flex-col gap-3">
                    {cs.chains.length > 1 && (
                      <span className="text-base font-semibold text-foreground">Chain {ci + 1}</span>
                    )}
                    <div className="rounded-md border bg-muted p-3">
                      <span className="text-base font-semibold text-foreground">Starting problem</span>
                      <p className="mt-1 text-base font-semibold text-foreground">{chain.startingProblem}</p>
                    </div>
                    <div className="flex flex-col">
                      {chain.whys.map((why, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                              {i + 1}
                            </div>
                            {i < chain.whys.length - 1 && <div className="w-px flex-1 bg-border" />}
                          </div>
                          <div className="flex-1 pb-3 last:pb-0">
                            <p className="text-base text-foreground">{why}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-md border bg-muted p-3">
                      <span className="text-base font-semibold text-foreground">Root cause</span>
                      <p className="mt-1 text-base text-foreground">{chain.rootCause}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 mt-1">
                  <span className="text-base font-semibold text-foreground">Outcome</span>
                  <p className="mt-1 text-base text-foreground">{cs.outcome}</p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

const AFFECTED_GROUPS_CASE_STUDY_ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  "Uber (early ride-hail launch)": { icon: Car, bg: "bg-rose-800" },
  "Khan Academy (early years)": { icon: GraduationCap, bg: "bg-emerald-800" },
  "Stripe (developer-first payments)": { icon: CreditCard, bg: "bg-indigo-800" },
}

const SEVERITY_BADGE: Record<"low" | "medium" | "high" | "critical", string> = {
  low: "bg-emerald-500/30",
  medium: "bg-amber-500/30",
  high: "bg-red-500/30",
  critical: "bg-red-700/40",
}

function AffectedGroupsCaseStudies() {
  return (
    <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
      <p className="text-base text-foreground">
        See how successful companies mapped who was affected by the problem and how severely, then prioritised the most acute groups to design a focused first version.
      </p>
      <Tabs defaultValue={AFFECTED_GROUPS_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
        <TabsList className="self-center bg-background h-auto flex-wrap">
          {AFFECTED_GROUPS_CASE_STUDIES.map((cs) => {
            const meta = AFFECTED_GROUPS_CASE_STUDY_ICONS[cs.company]
            const Icon = meta?.icon
            return (
              <TabsTrigger
                key={cs.company}
                value={cs.company}
                className="gap-1.5"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cs.company}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {AFFECTED_GROUPS_CASE_STUDIES.map((cs) => {
          const meta = AFFECTED_GROUPS_CASE_STUDY_ICONS[cs.company]
          const Icon = meta?.icon
          return (
            <TabsContent key={cs.company} value={cs.company}>
              <div className="rounded-lg border bg-card p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                      meta.bg,
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-base font-semibold text-foreground">{cs.company}</p>
                </div>
                <div>
                  <span className="text-base font-semibold text-foreground">Problem</span>
                  <p className="mt-1 text-base text-foreground">{cs.problem}</p>
                </div>
                <div>
                  <span className="text-base font-semibold text-foreground">Affected Groups</span>
                  <div className="mt-2 flex flex-col gap-2">
                    {cs.groups.map((group, i) => (
                      <div key={i} className="rounded-md border bg-muted p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-foreground">{group.name}</p>
                          <span className={cn(
                            "inline-block rounded px-1.5 py-0.5 text-base font-semibold text-foreground capitalize",
                            SEVERITY_BADGE[group.severity]
                          )}>
                            {group.severity}
                          </span>
                        </div>
                        <p className="mt-1 text-base text-foreground">{group.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-3 mt-1">
                  <span className="text-base font-semibold text-foreground">Outcome</span>
                  <p className="mt-1 text-base text-foreground">{cs.outcome}</p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

type ToolHint = { icon: LucideIcon; title: string; subtitle: string; bg: string }

const TOOL_INFO: Record<string, { title: string; description: string; whatYouDo: string; hints: ToolHint[] }> = {
  "root-causes": {
    title: "Root Causes",
    description: "List the underlying causes of the problem. Ask yourself: \"Why does this happen?\" This technique helps you move beyond surface-level symptoms to uncover what's really driving the issue.",
    whatYouDo: "List every underlying reason the problem exists. Focus on the <strong>root causes</strong>, not the symptoms. Then add <strong>notes</strong> to capture any patterns or connections you spot.",
    hints: [
      { icon: Search, title: "Dig deeper", subtitle: "Go beyond surface-level symptoms", bg: "bg-blue-900" },
      { icon: Plus, title: "Capture everything", subtitle: "Don't filter yet, list all possible causes", bg: "bg-yellow-600" },
      { icon: Trash2, title: "Refine later", subtitle: "You can remove weak causes after listing them", bg: "bg-emerald-800" },
    ],
  },
  "five-whys": {
    title: "5 Whys Technique",
    description: "Start with the problem and ask \"Why?\" five times in succession. Each answer becomes the basis for the next question, drilling down to the fundamental root cause.",
    whatYouDo: "Create a <strong>chain</strong> of five \"Why?\" questions. Each answer becomes the starting point for the next question. By the 5th why you should reach a <strong>fundamental cause</strong> that, if fixed, prevents the problem.",
    hints: [
      { icon: Search, title: "Start specific", subtitle: "Begin with a clear problem statement", bg: "bg-blue-900" },
      { icon: Plus, title: "Keep asking why", subtitle: "Each answer feeds the next question", bg: "bg-violet-800" },
      { icon: Plus, title: "Multiple chains", subtitle: "A problem can have more than one root cause", bg: "bg-emerald-800" },
    ],
  },
  "affected-groups": {
    title: "Affected Groups",
    description: "Identify who is most affected by this problem and how severely. Understanding the different groups helps you design a solution that targets the right audience.",
    whatYouDo: "List the different <strong>groups of people</strong> affected by this problem. For each group, describe <strong>how</strong> they are affected and rate the <strong>severity</strong> so you can prioritise who to solve for first.",
    hints: [
      { icon: Search, title: "Think broadly", subtitle: "Customers, employees, stakeholders, partners", bg: "bg-blue-900" },
      { icon: Plus, title: "Describe the impact", subtitle: "What makes each group's experience unique?", bg: "bg-yellow-600" },
      { icon: Search, title: "Rate severity", subtitle: "Low, Medium, High, or Critical", bg: "bg-red-800" },
    ],
  },
}

const CASE_STUDIES_BY_TOOL = {
  "root-causes": RootCausesCaseStudies,
  "five-whys": FiveWhysCaseStudies,
  "affected-groups": AffectedGroupsCaseStudies,
}

export default function RefinePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problem, analysisToolType } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  const toolInfo = analysisToolType ? TOOL_INFO[analysisToolType] : null
  const CaseStudies = analysisToolType ? CASE_STUDIES_BY_TOOL[analysisToolType] : null

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Search} iconBg="bg-tertiary">Refine: {toolInfo?.title ?? "-"}</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <ProblemContextCard problem={problem} />

        {toolInfo && (
          <div className="flex flex-col gap-3 text-base">
            <p>{toolInfo.description}</p>
            <div className="flex flex-col gap-3">
              {toolInfo.hints.map(({ icon: Icon, title, subtitle, bg }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${bg} shrink-0 mt-0.5`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-base">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
            <p dangerouslySetInnerHTML={{ __html: toolInfo.whatYouDo }} />
          </div>
        )}

        {analysisToolType && <hr className="border-border/40" />}

        {analysisToolType && CaseStudies && (
          <Tabs defaultValue="strategy" className="flex flex-col gap-4">
            <TabsList className="self-center">
              <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            </TabsList>
            <TabsContent value="strategy">
              <RefinementStrategy />
            </TabsContent>
            <TabsContent value="case-studies">
              <CaseStudies />
            </TabsContent>
          </Tabs>
        )}

        {!analysisToolType && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed">
            <p className="text-sm">No analysis type selected.</p>
            <Button variant="outline" onClick={() => router.push(`/problems/${problemRef}/validation/choose-refinement`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Choose a Refinement Method
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
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
