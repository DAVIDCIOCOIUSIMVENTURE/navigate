"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useSolution, getAdjacentSteps } from "../context"
import type { ScamperResponses, SolutionCandidate } from "@/types/solution"
import {
  Shuffle, RotateCcw, Globe, Plus, Trash2, Pencil, Check, X,
  ArrowLeft, ArrowRight, type LucideIcon,
} from "lucide-react"

/* ── SCAMPER Form ── */

const SCAMPER_PROMPTS: { key: keyof ScamperResponses; letter: string; title: string; prompt: string }[] = [
  { key: "substitute", letter: "S", title: "Substitute", prompt: "What components, materials, or processes could you swap out? What if you replaced part of the problem?" },
  { key: "combine", letter: "C", title: "Combine", prompt: "Can you combine this problem with another? What if you merged two existing solutions?" },
  { key: "adapt", letter: "A", title: "Adapt", prompt: "What else is like this? What ideas from other industries or domains could you adapt?" },
  { key: "modify", letter: "M", title: "Modify", prompt: "What if you enlarged, shrunk, or changed the shape of the problem? What can be modified?" },
  { key: "putToOtherUse", letter: "P", title: "Put to Other Use", prompt: "Can this problem (or its elements) be used for something else? What new purposes could emerge?" },
  { key: "eliminate", letter: "E", title: "Eliminate", prompt: "What can you remove or simplify? What would happen if you eliminated a step entirely?" },
  { key: "reverse", letter: "R", title: "Reverse", prompt: "What if you reversed the process? What if you did the opposite of what's expected?" },
]

function ScamperForm() {
  const { scamperResponses, setScamperResponses, candidates, setCandidates } = useSolution()

  const updateField = (key: keyof ScamperResponses, value: string) => {
    setScamperResponses({ ...scamperResponses, [key]: value })
  }

  const addCandidate = (key: keyof ScamperResponses, title: string) => {
    const text = scamperResponses[key].trim()
    if (!text) return
    const id = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1
    const newCandidate: SolutionCandidate = {
      id, title, description: text,
      inspirationSource: "scamper", inspirationDetail: key,
      feasibility: null, impact: null, cost: null, timeToImplement: null, notes: "",
    }
    setCandidates([...candidates, newCandidate])
  }

  return (
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-6">
      {SCAMPER_PROMPTS.map(({ key, letter, title, prompt }) => (
        <div key={key} className="rounded-lg border bg-background p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {letter}
            </span>
            <span className="text-sm font-semibold">{title}</span>
          </div>
          <p className="text-xs text-muted-foreground">{prompt}</p>
          <Textarea
            value={scamperResponses[key]}
            onChange={(e) => updateField(key, e.target.value)}
            placeholder="Your ideas..."
            rows={3}
          />
          <Button
            size="sm"
            variant="outline"
            className="self-end gap-1"
            disabled={!scamperResponses[key].trim()}
            onClick={() => addCandidate(key, `${title} idea`)}
          >
            <Plus className="h-3.5 w-3.5" />Add as Candidate
          </Button>
        </div>
      ))}
    </div>
  )
}

/* ── Reverse Brainstorming Form ── */

function ReverseBrainstormForm() {
  const { reverseBrainstorm, setReverseBrainstorm, reverseInversion, setReverseInversion, candidates, setCandidates } = useSolution()

  const addCandidate = () => {
    const text = reverseInversion.trim()
    if (!text) return
    const id = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1
    const newCandidate: SolutionCandidate = {
      id, title: "Reverse brainstorm idea", description: text,
      inspirationSource: "reverse", inspirationDetail: "",
      feasibility: null, impact: null, cost: null, timeToImplement: null, notes: "",
    }
    setCandidates([...candidates, newCandidate])
  }

  return (
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-6">
      <div className="rounded-lg border bg-background p-4 flex flex-col gap-2">
        <label className="text-sm font-semibold">How could you make this problem worse?</label>
        <p className="text-xs text-muted-foreground">
          Think of every way to aggravate the problem. Be creative — the more outlandish, the better.
        </p>
        <Textarea
          value={reverseBrainstorm}
          onChange={(e) => setReverseBrainstorm(e.target.value)}
          placeholder="List ways to make the problem worse..."
          rows={5}
        />
      </div>

      <div className="rounded-lg border bg-background p-4 flex flex-col gap-2">
        <label className="text-sm font-semibold">Now flip each idea</label>
        <p className="text-xs text-muted-foreground">
          Take each &quot;make it worse&quot; idea above and write its opposite. These inversions often reveal strong solution ideas.
        </p>
        <Textarea
          value={reverseInversion}
          onChange={(e) => setReverseInversion(e.target.value)}
          placeholder="Write the opposite of each idea above..."
          rows={5}
        />
        <Button
          size="sm"
          variant="outline"
          className="self-end gap-1"
          disabled={!reverseInversion.trim()}
          onClick={addCandidate}
        >
          <Plus className="h-3.5 w-3.5" />Add as Candidate
        </Button>
      </div>
    </div>
  )
}

/* ── Analogy Form ── */

function AnalogyForm() {
  const { analogyDomain, setAnalogyDomain, analogyInsight, setAnalogyInsight, candidates, setCandidates } = useSolution()

  const addCandidate = () => {
    const text = analogyInsight.trim()
    if (!text) return
    const id = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1
    const newCandidate: SolutionCandidate = {
      id, title: `Analogy from ${analogyDomain || "another domain"}`, description: text,
      inspirationSource: "analogy", inspirationDetail: analogyDomain,
      feasibility: null, impact: null, cost: null, timeToImplement: null, notes: "",
    }
    setCandidates([...candidates, newCandidate])
  }

  return (
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-6">
      <div className="rounded-lg border bg-background p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Domain / Industry</label>
          <p className="text-xs text-muted-foreground">
            What industry or field did you draw inspiration from?
          </p>
          <Input
            value={analogyDomain}
            onChange={(e) => setAnalogyDomain(e.target.value)}
            placeholder="e.g. Aviation, Healthcare, Hospitality..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Insight</label>
          <p className="text-xs text-muted-foreground">
            How does that domain handle a similar challenge? What could you borrow or adapt?
          </p>
          <Textarea
            value={analogyInsight}
            onChange={(e) => setAnalogyInsight(e.target.value)}
            placeholder="Describe the analogy and how it could apply to your problem..."
            rows={5}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="self-end gap-1"
          disabled={!analogyInsight.trim()}
          onClick={addCandidate}
        >
          <Plus className="h-3.5 w-3.5" />Add as Candidate
        </Button>
      </div>
    </div>
  )
}

/* ── Candidates Section ── */

const SOURCE_LABELS: Record<string, string> = {
  scamper: "SCAMPER",
  reverse: "Reverse",
  analogy: "Analogy",
  freeform: "Freeform",
}

function CandidatesSection() {
  const { candidates, setCandidates } = useSolution()

  const [addingNew, setAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftTitle, setDraftTitle] = useState("")
  const [draftDesc, setDraftDesc] = useState("")

  const startAdd = () => {
    setAddingNew(true)
    setDraftTitle("")
    setDraftDesc("")
  }

  const confirmAdd = () => {
    if (!draftTitle.trim()) return
    const id = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1
    const newCandidate: SolutionCandidate = {
      id, title: draftTitle.trim(), description: draftDesc.trim(),
      inspirationSource: "freeform", inspirationDetail: "",
      feasibility: null, impact: null, cost: null, timeToImplement: null, notes: "",
    }
    setCandidates([...candidates, newCandidate])
    setAddingNew(false)
  }

  const startEdit = (c: SolutionCandidate) => {
    setEditingId(c.id)
    setDraftTitle(c.title)
    setDraftDesc(c.description)
  }

  const confirmEdit = () => {
    if (editingId === null) return
    setCandidates(
      candidates.map((c) =>
        c.id === editingId ? { ...c, title: draftTitle.trim(), description: draftDesc.trim() } : c
      )
    )
    setEditingId(null)
  }

  const removeCandidate = (id: number) => {
    setCandidates(candidates.filter((c) => c.id !== id))
  }

  return (
    <>
      <h3 className="text-lg font-semibold">Your Candidates</h3>

      {candidates.length === 0 && !addingNew && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">No candidates yet.</p>
          <p className="text-xs text-muted-foreground">Use the brainstorming tool above to generate ideas, or add one manually.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
            {editingId === candidate.id ? (
              <>
                <Input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Title"
                  className="font-medium"
                  autoFocus
                />
                <Textarea
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  placeholder="Description"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5 mr-1" />Cancel
                  </Button>
                  <Button size="sm" onClick={confirmEdit} disabled={!draftTitle.trim()}>
                    <Check className="h-3.5 w-3.5 mr-1" />Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{candidate.title}</p>
                    {candidate.inspirationSource && (
                      <Badge variant="outline" className="text-[10px]">
                        {SOURCE_LABELS[candidate.inspirationSource] ?? candidate.inspirationSource}
                      </Badge>
                    )}
                  </div>
                  {candidate.description && (
                    <p className="text-xs text-muted-foreground mt-1">{candidate.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(candidate)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => removeCandidate(candidate.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {addingNew && (
          <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 flex flex-col gap-2">
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Solution title"
              className="font-medium"
              autoFocus
            />
            <Textarea
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              placeholder="Describe the solution idea..."
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setAddingNew(false)}>
                <X className="h-3.5 w-3.5 mr-1" />Cancel
              </Button>
              <Button size="sm" onClick={confirmAdd} disabled={!draftTitle.trim()}>
                <Check className="h-3.5 w-3.5 mr-1" />Add
              </Button>
            </div>
          </div>
        )}
      </div>

      {!addingNew && (
        <Button variant="dashed" onClick={startAdd} className="gap-2 self-start">
          <Plus className="h-4 w-4" />Add Candidate
        </Button>
      )}
    </>
  )
}

/* ── Main Page ── */

type ToolHint = { icon: LucideIcon; title: string; subtitle: string; bg: string }

const TOOL_INFO: Record<string, { title: string; description: string; whatYouDo: string; hints: ToolHint[] }> = {
  scamper: {
    title: "SCAMPER Method",
    description: "SCAMPER is a creative thinking technique that prompts you to look at a problem from seven angles: Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, and Reverse. Each prompt sparks ideas you wouldn't reach through normal brainstorming.",
    whatYouDo: "Work through each of the <strong>7 SCAMPER prompts</strong> below. You don't need to fill in every one, but try at least 3–4. When you find a promising idea, click <strong>Add as Candidate</strong> to save it.",
    hints: [
      { icon: Shuffle, title: "7 creative angles", subtitle: "Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, Reverse", bg: "bg-blue-500" },
      { icon: Plus, title: "Save the best ideas", subtitle: "Click \"Add as Candidate\" to promote ideas for scoring later", bg: "bg-amber-500" },
      { icon: Shuffle, title: "Quantity over quality", subtitle: "Generate lots of ideas first — you'll refine them later", bg: "bg-emerald-500" },
    ],
  },
  reverse: {
    title: "Reverse Brainstorming",
    description: "Instead of solving the problem directly, first brainstorm how to make it worse. Then flip each \"make it worse\" idea to discover creative solutions you might not have considered. This counterintuitive approach breaks you out of conventional thinking patterns.",
    whatYouDo: "First, list every way to <strong>make the problem worse</strong>. Be creative — the more outlandish, the better. Then <strong>flip each idea</strong> into its opposite to reveal solution ideas. Save the best flips as candidates.",
    hints: [
      { icon: RotateCcw, title: "Think backwards", subtitle: "How could you make the problem worse?", bg: "bg-rose-500" },
      { icon: RotateCcw, title: "Flip each idea", subtitle: "The opposite of a bad idea is often a great solution", bg: "bg-blue-500" },
      { icon: Plus, title: "Save your flips", subtitle: "Add the strongest inversions as solution candidates", bg: "bg-emerald-500" },
    ],
  },
  analogy: {
    title: "Analogy Thinking",
    description: "Look outside your domain for inspiration. How have other industries solved similar problems? Cross-pollinating ideas from different fields often leads to breakthrough solutions that feel fresh and unexpected.",
    whatYouDo: "Pick a <strong>different industry or domain</strong> that faces a similar challenge. Describe <strong>how they solved it</strong> and what you could borrow or adapt. Save the insight as a candidate if it inspires a concrete solution idea.",
    hints: [
      { icon: Globe, title: "Look outside your field", subtitle: "Aviation, healthcare, hospitality, logistics...", bg: "bg-blue-500" },
      { icon: Globe, title: "Borrow and adapt", subtitle: "What worked there that could work here?", bg: "bg-violet-500" },
      { icon: Plus, title: "Turn insights into candidates", subtitle: "Save analogies that inspire concrete solutions", bg: "bg-emerald-500" },
    ],
  },
}

export default function DiscoverPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionRef, problem, discoveryToolType } = useSolution()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionRef)

  const toolInfo = discoveryToolType ? TOOL_INFO[discoveryToolType] : null

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Shuffle}>Discover: {toolInfo?.title ?? "—"}</CardTitle>
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
                    <p className="text-[15px]">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
            <p dangerouslySetInnerHTML={{ __html: toolInfo.whatYouDo }} />
          </div>
        )}

        {discoveryToolType && <hr className="border-border/40" />}

        {discoveryToolType === "scamper" && <ScamperForm />}
        {discoveryToolType === "reverse" && <ReverseBrainstormForm />}
        {discoveryToolType === "analogy" && <AnalogyForm />}

        {!discoveryToolType && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">No discovery technique selected.</p>
            <Button variant="outline" onClick={() => router.push(`/solutions/${solutionRef}/choose-discovery`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Choose a Discovery Technique
            </Button>
          </div>
        )}

        {discoveryToolType && (
          <>
            <hr className="border-border/40" />
            <CandidatesSection />
          </>
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
