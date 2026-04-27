"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProblemValidation, getAdjacentSteps } from "../context"
import type { AffectedGroup } from "@/types/solution"
import { ROOT_CAUSES_CASE_STUDIES } from "./root-causes-case-studies"
import { FIVE_WHYS_CASE_STUDIES } from "./five-whys-case-studies"
import { AFFECTED_GROUPS_CASE_STUDIES } from "./affected-groups-case-studies"
import {
  Search, Plus, Trash2, ArrowLeft, ArrowRight,
  Car, MessageSquare, Stethoscope, Wrench, Landmark, Cloud,
  GraduationCap, CreditCard,
  type LucideIcon,
} from "lucide-react"

/* -- Root Causes Form -- */

function RootCausesForm() {
  const { rootCauses, setRootCauses, rootCauseNotes, setRootCauseNotes } = useProblemValidation()
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const addCause = () => {
    const text = draft.trim()
    if (text) {
      const id = rootCauses.length > 0 ? Math.max(...rootCauses.map((c) => c.id)) + 1 : 1
      setRootCauses([...rootCauses, { id, description: text }])
    }
    setDraft("")
    setAdding(false)
  }

  const removeCause = (id: number) => {
    setRootCauses(rootCauses.filter((c) => c.id !== id))
  }

  const updateCause = (id: number, description: string) => {
    setRootCauses(rootCauses.map((c) => (c.id === id ? { ...c, description } : c)))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addCause() }
    if (e.key === "Escape") { setDraft(""); setAdding(false) }
  }

  return (
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-white">Root Causes</label>
        <p className="text-sm text-white/80">
          List the underlying causes of the problem. Ask yourself: &quot;Why does this happen?&quot;
        </p>

        {rootCauses.map((cause) => (
          <div key={cause.id} className="flex items-center gap-2">
            <Input
              value={cause.description}
              onChange={(e) => updateCause(cause.id, e.target.value)}
              className="flex-1 text-md bg-white border-white text-foreground"
            />
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
              onClick={() => removeCause(cause.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        {adding ? (
          <Input
            ref={inputRef}
            placeholder="Type a root cause and press Enter..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={addCause}
            className="text-md bg-white border-white text-foreground"
          />
        ) : (
          <Button variant="on-primary" className="w-full" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Add Root Cause
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">Notes</label>
        <Textarea
          value={rootCauseNotes}
          onChange={(e) => setRootCauseNotes(e.target.value)}
          placeholder="Any additional observations about the root causes..."
          rows={3}
          className="bg-white border-white text-foreground"
        />
      </div>
    </div>
  )
}

/* -- Five Whys Form -- */

const WHY_LABELS = ["Why 1", "Why 2", "Why 3", "Why 4", "Why 5"]

function FiveWhysForm() {
  const { fiveWhyChains, setFiveWhyChains } = useProblemValidation()

  const addChain = () => {
    const id = fiveWhyChains.length > 0 ? Math.max(...fiveWhyChains.map((c) => c.id)) + 1 : 1
    setFiveWhyChains([...fiveWhyChains, { id, whys: ["", "", "", "", ""] }])
  }

  const removeChain = (id: number) => {
    setFiveWhyChains(fiveWhyChains.filter((c) => c.id !== id))
  }

  const updateWhy = (chainId: number, index: number, value: string) => {
    setFiveWhyChains(
      fiveWhyChains.map((c) => {
        if (c.id !== chainId) return c
        const whys = [...c.whys]
        whys[index] = value
        return { ...c, whys }
      })
    )
  }

  return (
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-5">
      {fiveWhyChains.length === 0 && (
        <p className="text-sm text-white/70 text-center py-4">
          No chains yet. Add one to start exploring root causes.
        </p>
      )}

      {fiveWhyChains.length > 0 && (
        <div className="flex flex-col divide-y divide-white/20">
          {fiveWhyChains.map((chain, chainIndex) => (
            <div key={chain.id} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Chain {chainIndex + 1}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => removeChain(chain.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex flex-col">
                {WHY_LABELS.map((label, i) => (
                  <div key={label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      {i < 4 && <div className="w-px flex-1 bg-white/30" />}
                    </div>
                    <div className="flex-1 flex flex-col gap-2 pb-3 last:pb-0">
                      <label className="text-sm font-medium text-white/80">{label}</label>
                      <Textarea
                        value={chain.whys[i] ?? ""}
                        onChange={(e) => updateWhy(chain.id, i, e.target.value)}
                        placeholder={i === 0 ? "Why does this problem occur?" : "Why is that?"}
                        rows={2}
                        className="text-sm bg-white border-white text-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="on-primary" onClick={addChain} className="w-full gap-2">
        <Plus className="h-4 w-4" />Add Chain
      </Button>
    </div>
  )
}

/* -- Affected Groups Form -- */

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const

function AffectedGroupsForm() {
  const { affectedGroups, setAffectedGroups } = useProblemValidation()

  const addGroup = () => {
    const id = affectedGroups.length > 0 ? Math.max(...affectedGroups.map((g) => g.id)) + 1 : 1
    setAffectedGroups([...affectedGroups, { id, name: "", severity: "", description: "" }])
  }

  const removeGroup = (id: number) => {
    setAffectedGroups(affectedGroups.filter((g) => g.id !== id))
  }

  const updateGroup = (id: number, patch: Partial<AffectedGroup>) => {
    setAffectedGroups(affectedGroups.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  return (
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-5">
      {affectedGroups.length === 0 && (
        <p className="text-sm text-white/70 text-center py-4">
          No groups added yet. Add a group to start mapping who is affected.
        </p>
      )}

      {affectedGroups.length > 0 && (
        <div className="flex flex-col divide-y divide-white/20">
          {affectedGroups.map((group, i) => (
            <div key={group.id} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">Group {i + 1}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => removeGroup(group.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Group Name</label>
                <Input
                  value={group.name}
                  onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                  placeholder="e.g. 'Working parents'"
                  className="font-medium bg-white border-white text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Description</label>
                <Textarea
                  value={group.description}
                  onChange={(e) => updateGroup(group.id, { description: e.target.value })}
                  placeholder="How are they affected? What makes this group unique?"
                  rows={2}
                  className="bg-white border-white text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Severity</label>
                <ToggleGroup
                  type="single"
                  value={group.severity}
                  onValueChange={(val) => updateGroup(group.id, { severity: (val || "") as AffectedGroup["severity"] })}
                  className="justify-start"
                >
                  {SEVERITY_OPTIONS.map((opt) => (
                    <ToggleGroupItem
                      key={opt.value}
                      value={opt.value}
                      className="text-sm rounded-none text-white data-[state=on]:bg-white data-[state=on]:text-primary hover:bg-white/10 hover:text-white"
                    >
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="on-primary" onClick={addGroup} className="w-full gap-2">
        <Plus className="h-4 w-4" />Add Group
      </Button>
    </div>
  )
}

/* -- Root Causes Case Studies -- */

const ROOT_CAUSES_CASE_STUDY_ICONS: Record<string, LucideIcon> = {
  "Toyota (post-war production)": Car,
  "Slack (early enterprise rollout)": MessageSquare,
  "NHS A&E waiting times": Stethoscope,
}

function RootCausesCaseStudies() {
  return (
    <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
      <p className="text-md text-white">
        See how successful organisations dug past surface-level symptoms to identify the underlying causes that, once fixed, prevented entire categories of failure.
      </p>
      <Tabs defaultValue={ROOT_CAUSES_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
        <TabsList className="self-center bg-white/10 h-auto flex-wrap">
          {ROOT_CAUSES_CASE_STUDIES.map((cs) => {
            const Icon = ROOT_CAUSES_CASE_STUDY_ICONS[cs.company]
            return (
              <TabsTrigger
                key={cs.company}
                value={cs.company}
                className="gap-1.5 text-white/60 hover:text-white data-[state=active]:bg-white data-[state=active]:text-foreground"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cs.company}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {ROOT_CAUSES_CASE_STUDIES.map((cs) => {
          const Icon = ROOT_CAUSES_CASE_STUDY_ICONS[cs.company]
          return (
            <TabsContent key={cs.company} value={cs.company}>
              <div className="rounded-lg border border-white/10 bg-white/10 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-md font-semibold text-white">{cs.company}</p>
                </div>
                <div>
                  <span className="text-md font-medium text-white uppercase tracking-wide">Problem</span>
                  <p className="mt-1 text-md text-white">{cs.problem}</p>
                </div>
                <div>
                  <span className="text-md font-medium text-white uppercase tracking-wide">Root Causes</span>
                  <div className="mt-2 flex flex-col gap-2">
                    {cs.causes.map((cause, i) => (
                      <div key={i} className="rounded-md border border-white/10 bg-white/5 p-3">
                        <p className="text-md font-semibold text-white">{cause.title}</p>
                        <p className="mt-1 text-md text-white">{cause.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Notes</span>
                  <p className="mt-1 text-md text-white">{cs.notes}</p>
                </div>
                <div className="border-t border-white/10 pt-3 mt-1">
                  <span className="text-md font-medium text-white uppercase tracking-wide">Outcome</span>
                  <p className="mt-1 text-md text-white">{cs.outcome}</p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

/* -- Five Whys Case Studies -- */

const FIVE_WHYS_CASE_STUDY_ICONS: Record<string, LucideIcon> = {
  "Toyota (the original 5 Whys)": Wrench,
  "NASA Jefferson Memorial": Landmark,
  "Amazon (S3 outage, 2017)": Cloud,
}

function FiveWhysCaseStudies() {
  return (
    <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
      <p className="text-md text-white">
        See how teams used the 5 Whys to push past the first plausible answer and reach a fundamental cause that, once addressed, prevented the problem from recurring.
      </p>
      <Tabs defaultValue={FIVE_WHYS_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
        <TabsList className="self-center bg-white/10 h-auto flex-wrap">
          {FIVE_WHYS_CASE_STUDIES.map((cs) => {
            const Icon = FIVE_WHYS_CASE_STUDY_ICONS[cs.company]
            return (
              <TabsTrigger
                key={cs.company}
                value={cs.company}
                className="gap-1.5 text-white/60 hover:text-white data-[state=active]:bg-white data-[state=active]:text-foreground"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cs.company}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {FIVE_WHYS_CASE_STUDIES.map((cs) => {
          const Icon = FIVE_WHYS_CASE_STUDY_ICONS[cs.company]
          return (
            <TabsContent key={cs.company} value={cs.company}>
              <div className="rounded-lg border border-white/10 bg-white/10 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-md font-semibold text-white">{cs.company}</p>
                </div>
                <div>
                  <span className="text-md font-medium text-white uppercase tracking-wide">Problem</span>
                  <p className="mt-1 text-md text-white">{cs.problem}</p>
                </div>
                {cs.chains.map((chain, ci) => (
                  <div key={ci} className="flex flex-col gap-3">
                    {cs.chains.length > 1 && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Chain {ci + 1}</span>
                    )}
                    <div className="rounded-md border border-white/10 bg-white/5 p-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Starting problem</span>
                      <p className="mt-1 text-md font-semibold text-white">{chain.startingProblem}</p>
                    </div>
                    <div className="flex flex-col">
                      {chain.whys.map((why, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                              {i + 1}
                            </div>
                            {i < chain.whys.length - 1 && <div className="w-px flex-1 bg-white/30" />}
                          </div>
                          <div className="flex-1 pb-3 last:pb-0">
                            <p className="text-md text-white">{why}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-md border border-white/10 bg-white/5 p-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Root cause</span>
                      <p className="mt-1 text-md text-white">{chain.rootCause}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 mt-1">
                  <span className="text-md font-medium text-white uppercase tracking-wide">Outcome</span>
                  <p className="mt-1 text-md text-white">{cs.outcome}</p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

/* -- Affected Groups Case Studies -- */

const AFFECTED_GROUPS_CASE_STUDY_ICONS: Record<string, LucideIcon> = {
  "Uber (early ride-hail launch)": Car,
  "Khan Academy (early years)": GraduationCap,
  "Stripe (developer-first payments)": CreditCard,
}

const SEVERITY_BADGE: Record<"low" | "medium" | "high" | "critical", string> = {
  low: "bg-emerald-500/30",
  medium: "bg-amber-500/30",
  high: "bg-red-500/30",
  critical: "bg-red-700/40",
}

function AffectedGroupsCaseStudies() {
  return (
    <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
      <p className="text-md text-white">
        See how successful companies mapped who was affected by the problem and how severely, then prioritised the most acute groups to design a focused first version.
      </p>
      <Tabs defaultValue={AFFECTED_GROUPS_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
        <TabsList className="self-center bg-white/10 h-auto flex-wrap">
          {AFFECTED_GROUPS_CASE_STUDIES.map((cs) => {
            const Icon = AFFECTED_GROUPS_CASE_STUDY_ICONS[cs.company]
            return (
              <TabsTrigger
                key={cs.company}
                value={cs.company}
                className="gap-1.5 text-white/60 hover:text-white data-[state=active]:bg-white data-[state=active]:text-foreground"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cs.company}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {AFFECTED_GROUPS_CASE_STUDIES.map((cs) => {
          const Icon = AFFECTED_GROUPS_CASE_STUDY_ICONS[cs.company]
          return (
            <TabsContent key={cs.company} value={cs.company}>
              <div className="rounded-lg border border-white/10 bg-white/10 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-md font-semibold text-white">{cs.company}</p>
                </div>
                <div>
                  <span className="text-md font-medium text-white uppercase tracking-wide">Problem</span>
                  <p className="mt-1 text-md text-white">{cs.problem}</p>
                </div>
                <div>
                  <span className="text-md font-medium text-white uppercase tracking-wide">Affected Groups</span>
                  <div className="mt-2 flex flex-col gap-2">
                    {cs.groups.map((group, i) => (
                      <div key={i} className="rounded-md border border-white/10 bg-white/5 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-md font-semibold text-white">{group.name}</p>
                          <span className={cn(
                            "inline-block rounded px-1.5 py-0.5 text-xs font-semibold text-white capitalize",
                            SEVERITY_BADGE[group.severity]
                          )}>
                            {group.severity}
                          </span>
                        </div>
                        <p className="mt-1 text-md text-white">{group.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 mt-1">
                  <span className="text-md font-medium text-white uppercase tracking-wide">Outcome</span>
                  <p className="mt-1 text-md text-white">{cs.outcome}</p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

/* -- Main Page -- */

type ToolHint = { icon: LucideIcon; title: string; subtitle: string; bg: string }

const TOOL_INFO: Record<string, { title: string; description: string; whatYouDo: string; hints: ToolHint[] }> = {
  "root-causes": {
    title: "Root Causes",
    description: "List the underlying causes of the problem. Ask yourself: \"Why does this happen?\" This technique helps you move beyond surface-level symptoms to uncover what's really driving the issue.",
    whatYouDo: "Brainstorm every underlying reason the problem exists. Focus on the <strong>root causes</strong>, not the symptoms. Then add <strong>notes</strong> to capture any patterns or connections you spot.",
    hints: [
      { icon: Search, title: "Dig deeper", subtitle: "Go beyond surface-level symptoms", bg: "bg-blue-500" },
      { icon: Plus, title: "Capture everything", subtitle: "Don't filter yet, list all possible causes", bg: "bg-amber-500" },
      { icon: Trash2, title: "Refine later", subtitle: "You can remove weak causes after brainstorming", bg: "bg-emerald-500" },
    ],
  },
  "five-whys": {
    title: "5 Whys Technique",
    description: "Start with the problem and ask \"Why?\" five times in succession. Each answer becomes the basis for the next question, drilling down to the fundamental root cause.",
    whatYouDo: "Create a <strong>chain</strong> of five \"Why?\" questions. Each answer becomes the starting point for the next question. By the 5th why you should reach a <strong>fundamental cause</strong> that, if fixed, prevents the problem.",
    hints: [
      { icon: Search, title: "Start specific", subtitle: "Begin with a clear problem statement", bg: "bg-blue-500" },
      { icon: Plus, title: "Keep asking why", subtitle: "Each answer feeds the next question", bg: "bg-violet-500" },
      { icon: Plus, title: "Multiple chains", subtitle: "A problem can have more than one root cause", bg: "bg-emerald-500" },
    ],
  },
  "affected-groups": {
    title: "Affected Groups",
    description: "Identify who is most affected by this problem and how severely. Understanding the different groups helps you design a solution that targets the right audience.",
    whatYouDo: "List the different <strong>groups of people</strong> affected by this problem. For each group, describe <strong>how</strong> they are affected and rate the <strong>severity</strong> so you can prioritise who to solve for first.",
    hints: [
      { icon: Search, title: "Think broadly", subtitle: "Customers, employees, stakeholders, partners", bg: "bg-blue-500" },
      { icon: Plus, title: "Describe the impact", subtitle: "What makes each group's experience unique?", bg: "bg-amber-500" },
      { icon: Search, title: "Rate severity", subtitle: "Low, Medium, High, or Critical", bg: "bg-rose-500" },
    ],
  },
}

export default function RefinePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problem, analysisToolType } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  const toolInfo = analysisToolType ? TOOL_INFO[analysisToolType] : null

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Search}>Refine: {toolInfo?.title ?? "-"}</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {problem?.description && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Problem</p>
            <p className="text-sm font-medium">{problem.description}</p>
          </div>
        )}

        {toolInfo && (
          <div className="flex flex-col gap-3 text-md">
            <p>{toolInfo.description}</p>
            <div className="flex flex-col gap-3">
              {toolInfo.hints.map(({ icon: Icon, title, subtitle, bg }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${bg} shrink-0 mt-0.5`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-md">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
            <p dangerouslySetInnerHTML={{ __html: toolInfo.whatYouDo }} />
          </div>
        )}

        {analysisToolType && <hr className="border-border/40" />}

        {analysisToolType === "root-causes" && (
          <Tabs defaultValue="strategy" className="flex flex-col gap-4">
            <TabsList className="self-center">
              <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            </TabsList>
            <TabsContent value="strategy">
              <RootCausesForm />
            </TabsContent>
            <TabsContent value="case-studies">
              <RootCausesCaseStudies />
            </TabsContent>
          </Tabs>
        )}

        {analysisToolType === "five-whys" && (
          <Tabs defaultValue="strategy" className="flex flex-col gap-4">
            <TabsList className="self-center">
              <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            </TabsList>
            <TabsContent value="strategy">
              <FiveWhysForm />
            </TabsContent>
            <TabsContent value="case-studies">
              <FiveWhysCaseStudies />
            </TabsContent>
          </Tabs>
        )}

        {analysisToolType === "affected-groups" && (
          <Tabs defaultValue="strategy" className="flex flex-col gap-4">
            <TabsList className="self-center">
              <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            </TabsList>
            <TabsContent value="strategy">
              <AffectedGroupsForm />
            </TabsContent>
            <TabsContent value="case-studies">
              <AffectedGroupsCaseStudies />
            </TabsContent>
          </Tabs>
        )}

        {!analysisToolType && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">No analysis type selected.</p>
            <Button variant="outline" onClick={() => router.push(`/problems/${problemRef}/choose-refinement`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Choose a Refinement Method
            </Button>
          </div>
        )}

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
