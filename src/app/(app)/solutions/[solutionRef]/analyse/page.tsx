"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useSolution, getAdjacentSteps } from "../context"
import type { AffectedGroup } from "@/types/solution"
import { Search, Plus, Trash2, ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react"

/* ── Root Causes Form ── */

function RootCausesForm() {
  const { rootCauses, setRootCauses, rootCauseNotes, setRootCauseNotes } = useSolution()
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
        <label className="text-sm font-semibold text-primary-foreground">Root Causes</label>
        <p className="text-xs text-primary-foreground/70">
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
        <label className="text-sm font-semibold text-primary-foreground">Notes</label>
        <Textarea
          value={rootCauseNotes}
          onChange={(e) => setRootCauseNotes(e.target.value)}
          placeholder="Any additional observations about the root causes..."
          rows={3}
          className="text-white placeholder:text-white/50 border-white/30"
        />
      </div>
    </div>
  )
}

/* ── Five Whys Form ── */

const WHY_LABELS = ["Why 1", "Why 2", "Why 3", "Why 4", "Why 5"]

function FiveWhysForm() {
  const { fiveWhyChains, setFiveWhyChains } = useSolution()

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
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-6">
      {fiveWhyChains.length === 0 && (
        <p className="text-sm text-primary-foreground/70 text-center py-4">
          No chains yet. Add one to start exploring root causes.
        </p>
      )}

      {fiveWhyChains.map((chain, chainIndex) => (
        <div key={chain.id} className="rounded-lg border bg-background p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Chain {chainIndex + 1}</p>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => removeChain(chain.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {WHY_LABELS.map((label, i) => (
              <div key={label} className="flex gap-3 items-start">
                <div className="flex flex-col items-center pt-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  {i < 4 && <div className="w-px h-4 bg-border" />}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted-foreground">{label}</label>
                  <Textarea
                    value={chain.whys[i] ?? ""}
                    onChange={(e) => updateWhy(chain.id, i, e.target.value)}
                    placeholder={i === 0 ? "Why does this problem occur?" : "Why is that?"}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button variant="on-primary" onClick={addChain} className="w-full gap-2">
        <Plus className="h-4 w-4" />Add Chain
      </Button>
    </div>
  )
}

/* ── Affected Groups Form ── */

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const

function AffectedGroupsForm() {
  const { affectedGroups, setAffectedGroups } = useSolution()

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
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-6">
      {affectedGroups.length === 0 && (
        <p className="text-sm text-primary-foreground/70 text-center py-4">
          No groups added yet. Add a group to start mapping who is affected.
        </p>
      )}

      {affectedGroups.map((group) => (
        <div key={group.id} className="rounded-lg border bg-background p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-muted-foreground">Group Name</label>
              <Input
                value={group.name}
                onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                placeholder="e.g. 'Working parents'"
                className="font-medium"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground mt-5"
              onClick={() => removeGroup(group.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <Textarea
              value={group.description}
              onChange={(e) => updateGroup(group.id, { description: e.target.value })}
              placeholder="How are they affected? What makes this group unique?"
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Severity</label>
            <ToggleGroup
              type="single"
              value={group.severity}
              onValueChange={(val) => updateGroup(group.id, { severity: (val || "") as AffectedGroup["severity"] })}
              className="justify-start"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <ToggleGroupItem key={opt.value} value={opt.value} className="text-sm">
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      ))}

      <Button variant="on-primary" onClick={addGroup} className="w-full gap-2">
        <Plus className="h-4 w-4" />Add Group
      </Button>
    </div>
  )
}

/* ── Main Page ── */

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

export default function AnalysePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionRef, problem, analysisToolType } = useSolution()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionRef)

  const toolInfo = analysisToolType ? TOOL_INFO[analysisToolType] : null

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Search}>Analyse: {toolInfo?.title ?? "—"}</CardTitle>
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

        {analysisToolType === "root-causes" && <RootCausesForm />}
        {analysisToolType === "five-whys" && <FiveWhysForm />}
        {analysisToolType === "affected-groups" && <AffectedGroupsForm />}

        {!analysisToolType && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">No analysis type selected.</p>
            <Button variant="outline" onClick={() => router.push(`/solutions/${solutionRef}/choose-analysis`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Choose an Analysis Type
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
