"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useIdeas } from "@/store/ideas-hooks"
import {
  Users, CircleDot, GitFork, Clock, Heart, BarChart2,
  Briefcase, CheckCircle2, Plus, X, Trash2, Gavel, XCircle,
} from "lucide-react"
import type { ImpactItem, Problem } from "@/types/idea"

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  unvalidated: { label: "Unvalidated", className: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700" },
  valid: { label: "Valid", className: "bg-green-100 text-green-700" },
  invalid: { label: "Invalid", className: "bg-red-100 text-red-700" },
}

export default function QuickstartValidationPage() {
  const params = useParams()
  const router = useRouter()
  const ideaId = Number(params.ideaId)
  const { getIdea, updateIdea } = useIdeas()

  const idea = getIdea(ideaId)

  // editingScKeys: "altId:scIdx" keys for shortcomings currently being edited inline
  const [editingScKeys, setEditingScKeys] = useState<Set<string>>(new Set())
  const [impactDraft, setImpactDraft] = useState({ category: "", description: "" })

  if (!idea) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-muted-foreground text-sm">Idea not found.</p>
        <Button variant="outline" onClick={() => router.push("/ideas")}>Back to Ideas</Button>
      </div>
    )
  }

  const namedJobs = idea.jobs.filter((j) => j.name.trim())
  const problemsByJob = namedJobs
    .map((job) => ({ job, items: job.problems.filter((p) => p.text.trim()) }))
    .filter((g) => g.items.length > 0)

  const selectedProblemId = idea.selectedProblemId
  const selectedProblem = idea.jobs.flatMap((j) => j.problems).find((p) => p.id === selectedProblemId)

  const updateProblem = (patch: Partial<Omit<Problem, "id" | "text">>, statusOverride?: Problem["validationStatus"]) => {
    if (selectedProblemId === null) return
    const allProblems = idea.jobs.flatMap((j) => j.problems)
    const existing = allProblems.find((p) => p.id === selectedProblemId)
    if (!existing) return

    const effectiveStatus = statusOverride ?? patch.validationStatus ?? existing.validationStatus
    const updated: Problem = {
      ...existing,
      ...patch,
      validationStatus: effectiveStatus === "unvalidated" ? "in_progress" : effectiveStatus,
    }

    const filledProblems = allProblems.filter((p) => p.text.trim())
    const allDecided =
      filledProblems.length > 0 &&
      filledProblems.every((p) => {
        const s = p.id === selectedProblemId ? updated.validationStatus : p.validationStatus
        return s === "valid" || s === "invalid"
      })

    updateIdea(ideaId, {
      jobs: idea.jobs.map((j) => ({
        ...j,
        problems: j.problems.map((p) => (p.id === selectedProblemId ? updated : p)),
      })),
      ...(allDecided ? { problemValidationComplete: true } : {}),
    })
  }

  const selectProblem = (id: number) => {
    setEditingScKeys(new Set())
    setImpactDraft({ category: "", description: "" })
    updateIdea(ideaId, { selectedProblemId: id })
  }

  const addAlt = () => {
    const newAlt = { id: Date.now(), text: "", shortcomings: [], impacts: [] }
    updateProblem({ alternatives: [...(selectedProblem?.alternatives ?? []), newAlt] })
  }

  const updateAltText = (altId: number, text: string) =>
    updateProblem({
      alternatives: (selectedProblem?.alternatives ?? []).map((alt) =>
        alt.id === altId ? { ...alt, text } : alt
      ),
    })

  const removeAlt = (altId: number) => {
    setEditingScKeys((prev) => {
      const next = new Set(prev)
      for (const k of next) { if (k.startsWith(`${altId}:`)) next.delete(k) }
      return next
    })
    updateProblem({ alternatives: (selectedProblem?.alternatives ?? []).filter((alt) => alt.id !== altId) })
  }

  const removeAltShortcoming = (altId: number, scIdx: number) => {
    setEditingScKeys((prev) => {
      const next = new Set(prev)
      next.delete(`${altId}:${scIdx}`)
      return next
    })
    updateProblem({
      alternatives: (selectedProblem?.alternatives ?? []).map((alt) =>
        alt.id === altId
          ? { ...alt, shortcomings: alt.shortcomings.filter((_, j) => j !== scIdx) }
          : alt
      ),
    })
  }

  const addScRow = (altId: number) => {
    const alt = (selectedProblem?.alternatives ?? []).find((a) => a.id === altId)
    if (!alt) return
    const newIdx = alt.shortcomings.length
    updateProblem({
      alternatives: (selectedProblem?.alternatives ?? []).map((a) =>
        a.id === altId ? { ...a, shortcomings: [...a.shortcomings, ""] } : a
      ),
    })
    setEditingScKeys((prev) => new Set(prev).add(`${altId}:${newIdx}`))
  }

  const updateScValue = (altId: number, scIdx: number, value: string) =>
    updateProblem({
      alternatives: (selectedProblem?.alternatives ?? []).map((alt) =>
        alt.id === altId
          ? { ...alt, shortcomings: alt.shortcomings.map((sc, i) => (i === scIdx ? value : sc)) }
          : alt
      ),
    })

  const commitSc = (altId: number, scIdx: number) =>
    setEditingScKeys((prev) => { const next = new Set(prev); next.delete(`${altId}:${scIdx}`); return next })

  const addImpact = () => {
    if (!impactDraft.category.trim() && !impactDraft.description.trim()) return
    updateProblem({ impacts: [...(selectedProblem?.impacts ?? []), { ...impactDraft }] })
    setImpactDraft({ category: "", description: "" })
  }
  const removeImpact = (i: number) =>
    updateProblem({ impacts: (selectedProblem?.impacts ?? []).filter((_, idx) => idx !== i) })

  const setVerdict = (status: "valid" | "invalid") =>
    updateProblem({ validationStatus: status }, status)

  function renderProblemButton(problem: Problem) {
    const isSelected = selectedProblemId === problem.id
    const badge = problem.validationStatus !== "unvalidated" ? STATUS_BADGE[problem.validationStatus] : null
    return (
      <li key={problem.id}>
        <button
          onClick={() => selectProblem(problem.id)}
          className={`w-full text-left rounded-lg border-2 px-4 py-2.5 flex items-center gap-3 transition-colors text-sm ${
            isSelected
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/40"
          }`}
        >
          {isSelected ? (
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 shrink-0" />
          )}
          <span className="flex-1">{problem.text}</span>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </button>
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">{idea.title}</h1>
        <p className="text-sm text-muted-foreground">
          Select a problem to validate and fill in the details below.
        </p>
      </div>

      {/* Customer segment summary */}
      {idea.customer.segmentName && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer Segment</p>
              <p className="text-sm font-medium truncate">{idea.customer.segmentName}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select problem */}
      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <CircleDot className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Select a Problem to Validate</h2>
          </div>

          {problemsByJob.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-3 text-center text-muted-foreground">
              <Briefcase className="h-5 w-5" />
              <p className="text-sm">No problems yet. Add them in Problem Discovery first.</p>
              <Button variant="outline" size="sm" onClick={() => router.push(`/ideas/${ideaId}/problem-discovery/quickstart`)}>
                Go to Problem Discovery
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {problemsByJob.map(({ job, items }) => (
                <div key={job.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{job.name}</p>
                  </div>
                  <ul className="flex flex-col gap-1.5">{items.map(renderProblemButton)}</ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProblem && (
        <>
          {/* Alternatives & Shortcomings */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <GitFork className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Alternatives & Shortcomings</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                How are customers currently solving or working around this problem? For each alternative, note why it falls short.
              </p>

              {(selectedProblem.alternatives ?? []).length > 0 && (
                <ul className="flex flex-col gap-3">
                  {(selectedProblem.alternatives ?? []).map((item, altIdx) => (
                    <li key={item.id} className="rounded-lg border p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <GitFork className="h-4 w-4 text-muted-foreground" />
                          Alternative {altIdx + 1}
                        </p>
                        <button
                          onClick={() => removeAlt(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove alternative"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Input
                        placeholder="Describe the alternative..."
                        value={item.text}
                        onChange={(e) => updateAltText(item.id, e.target.value)}
                        className="text-sm h-9"
                        autoFocus={item.text === ""}
                      />
                      <div className="flex flex-col gap-2 pt-1 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shortcomings</p>
                        </div>
                        {item.shortcomings.length > 0 && (
                          <ul className="flex flex-col gap-1">
                            {item.shortcomings.map((sc, j) => (
                              <li key={j} className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1 text-sm">
                                {editingScKeys.has(`${item.id}:${j}`) ? (
                                  <Input
                                    placeholder="Add a shortcoming..."
                                    value={sc}
                                    onChange={(e) => updateScValue(item.id, j, e.target.value)}
                                    onBlur={() => commitSc(item.id, j)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitSc(item.id, j) } }}
                                    className="flex-1 text-sm h-7 bg-background py-0"
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    className="flex-1 cursor-text"
                                    onClick={() => setEditingScKeys((prev) => new Set(prev).add(`${item.id}:${j}`))}
                                  >
                                    {sc || <span className="text-muted-foreground italic">empty shortcoming</span>}
                                  </span>
                                )}
                                <button onClick={() => removeAltShortcoming(item.id, j)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                                  <X className="h-3 w-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <Button variant="outline" onClick={() => addScRow(item.id)} className="w-full gap-2">
                          <Plus className="h-4 w-4" />
                          Add Shortcoming
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <Button variant="outline" onClick={addAlt} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Alternative
              </Button>
            </CardContent>
          </Card>

          {/* Context */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Context</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                When and where does this problem typically occur? Describe the situation in which your customer experiences it.
              </p>
              <Textarea
                rows={4}
                placeholder="When does this problem occur? In what situation or context?"
                value={selectedProblem.contextWhen ?? ""}
                onChange={(e) => updateProblem({ contextWhen: e.target.value })}
                className="resize-none text-sm focus-visible:ring-1"
              />
            </CardContent>
          </Card>

          {/* Emotional impact */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Emotional Impact</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                How does this problem make your customer feel? What emotions does it trigger?
              </p>
              <Textarea
                rows={4}
                placeholder="Frustrated? Anxious? Embarrassed? Describe the emotional effect..."
                value={selectedProblem.emotionalImpact ?? ""}
                onChange={(e) => updateProblem({ emotionalImpact: e.target.value })}
                className="resize-none text-sm focus-visible:ring-1"
              />
            </CardContent>
          </Card>

          {/* Quantifiable impact */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Quantifiable Impact</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                What is the measurable cost or consequence of this problem — in time, money, lost revenue, or other metrics?
              </p>

              {(selectedProblem.impacts ?? []).length > 0 && (
                <ul className="flex flex-col gap-2">
                  {(selectedProblem.impacts ?? []).map((item: ImpactItem, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        {item.category && <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">{item.category}</span>}
                        <span>{item.description}</span>
                      </div>
                      <button onClick={() => removeImpact(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-0.5">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Category (e.g. Time, Revenue...)"
                    value={impactDraft.category}
                    onChange={(e) => setImpactDraft({ ...impactDraft, category: e.target.value })}
                    className="text-sm h-9"
                  />
                  <Input
                    placeholder="Description of the impact..."
                    value={impactDraft.description}
                    onChange={(e) => setImpactDraft({ ...impactDraft, description: e.target.value })}
                    className="text-sm h-9 sm:col-span-2"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={addImpact}
                  disabled={!impactDraft.category.trim() && !impactDraft.description.trim()}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Impact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verdict */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <Gavel className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Verdict</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your research, is this problem worth solving?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setVerdict("valid")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedProblem.validationStatus === "valid"
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-border hover:border-green-300 hover:bg-green-50/50 text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Valid — Worth Solving
                </button>
                <button
                  onClick={() => setVerdict("invalid")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedProblem.validationStatus === "invalid"
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-border hover:border-red-300 hover:bg-red-50/50 text-muted-foreground"
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  Invalid — Not Worth Solving
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <Textarea
                  rows={2}
                  placeholder="Add any notes about your decision..."
                  value={selectedProblem.reason ?? ""}
                  onChange={(e) => updateProblem({ reason: e.target.value })}
                  className="resize-none text-sm focus-visible:ring-1"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="pb-4" />
    </div>
  )
}
