"use client"

import { useState, type KeyboardEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useIdeas } from "@/store/ideas-hooks"
import {
  Users, CircleDot, GitFork, Clock, ThumbsDown, Heart, BarChart2,
  Briefcase, CheckCircle2, Plus, X, Trash2, Gavel, XCircle,
} from "lucide-react"
import type { ImpactItem, ProblemValidation } from "@/types/idea"

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

  const [altDraft, setAltDraft] = useState("")
  const [impactDraft, setImpactDraft] = useState({ category: "", description: "" })

  if (!idea) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-muted-foreground text-sm">Idea not found.</p>
        <Button variant="outline" onClick={() => router.push("/ideas")}>Back to Ideas</Button>
      </div>
    )
  }

  const problems = idea.problems.filter((p) => p.text.trim())
  const namedJobs = idea.jobs.filter((j) => j.job.trim())
  const problemsByJob = namedJobs
    .map((job) => ({ job, items: problems.filter((p) => p.jobId === job.id) }))
    .filter((g) => g.items.length > 0)
  const unlinkedProblems = problems.filter((p) => p.jobId === null)

  const selectedProblemId = idea.selectedProblemId
  const selectedProblem = problems.find((p) => p.id === selectedProblemId)
  const validation = idea.validations.find((v) => v.problemId === selectedProblemId)

  const updateValidation = (patch: Partial<Omit<ProblemValidation, "id" | "problemId">>, statusOverride?: ProblemValidation["status"]) => {
    if (selectedProblemId === null) return
    const existing = idea.validations.find((v) => v.problemId === selectedProblemId)
    const effectiveStatus = statusOverride ?? patch.status ?? existing?.status ?? "in_progress"
    const updated: ProblemValidation = {
      id: existing?.id ?? Date.now(),
      problemId: selectedProblemId,
      alternatives: existing?.alternatives ?? [],
      contextWhen: existing?.contextWhen ?? "",
      shortcomings: existing?.shortcomings ?? "",
      emotionalImpact: existing?.emotionalImpact ?? "",
      impacts: existing?.impacts ?? [],
      reason: existing?.reason ?? "",
      ...patch,
      status: effectiveStatus === "unvalidated" ? "in_progress" : effectiveStatus,
    }
    const next = existing
      ? idea.validations.map((x) => (x.problemId === selectedProblemId ? updated : x))
      : [...idea.validations, updated]

    const filledProblems = idea.problems.filter((p) => p.text.trim())
    const allDecided =
      filledProblems.length > 0 &&
      filledProblems.every((p) =>
        next.some((v) => v.problemId === p.id && (v.status === "valid" || v.status === "invalid"))
      )

    updateIdea(ideaId, {
      validations: next,
      ...(allDecided ? { problemValidationComplete: true } : {}),
    })
  }

  const selectProblem = (id: number) => {
    setAltDraft("")
    setImpactDraft({ category: "", description: "" })
    updateIdea(ideaId, { selectedProblemId: id })
  }

  const addAlt = () => {
    const trimmed = altDraft.trim()
    if (!trimmed) return
    updateValidation({ alternatives: [...(validation?.alternatives ?? []), trimmed] })
    setAltDraft("")
  }
  const onAltKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addAlt() }
  }
  const removeAlt = (i: number) =>
    updateValidation({ alternatives: (validation?.alternatives ?? []).filter((_, idx) => idx !== i) })

  const addImpact = () => {
    if (!impactDraft.category.trim() && !impactDraft.description.trim()) return
    updateValidation({ impacts: [...(validation?.impacts ?? []), { ...impactDraft }] })
    setImpactDraft({ category: "", description: "" })
  }
  const removeImpact = (i: number) =>
    updateValidation({ impacts: (validation?.impacts ?? []).filter((_, idx) => idx !== i) })

  const setVerdict = (status: "valid" | "invalid") =>
    updateValidation({ status }, status)

  function renderProblemButton(problem: (typeof problems)[number]) {
    const isSelected = selectedProblemId === problem.id
    const v = idea!.validations.find((v) => v.problemId === problem.id)
    const badge = v ? STATUS_BADGE[v.status] : null
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

          {problems.length === 0 ? (
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
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{job.job}</p>
                  </div>
                  <ul className="flex flex-col gap-1.5">{items.map(renderProblemButton)}</ul>
                </div>
              ))}
              {unlinkedProblems.length > 0 && (
                <div className="flex flex-col gap-2">
                  {problemsByJob.length > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Other Problems</p>
                  )}
                  <ul className="flex flex-col gap-1.5">{unlinkedProblems.map(renderProblemButton)}</ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProblem && (
        <>
          {/* Alternatives */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <GitFork className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Alternatives</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                How are customers currently solving or working around this problem?
              </p>
              {(validation?.alternatives ?? []).length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {(validation?.alternatives ?? []).map((item, i) => (
                    <li key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                      <span className="flex-1">{item}</span>
                      <button onClick={() => removeAlt(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Type an alternative and press Enter..."
                  value={altDraft}
                  onChange={(e) => setAltDraft(e.target.value)}
                  onKeyDown={onAltKey}
                  className="text-sm h-9"
                />
                <Button variant="outline" onClick={addAlt} disabled={!altDraft.trim()}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
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
                value={validation?.contextWhen ?? ""}
                onChange={(e) => updateValidation({ contextWhen: e.target.value })}
                className="resize-none text-sm focus-visible:ring-1"
              />
            </CardContent>
          </Card>

          {/* Shortcomings */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Shortcomings of Alternatives</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Why are the existing alternatives not good enough? What do they fail to address?
              </p>
              <Textarea
                rows={4}
                placeholder="What's wrong with how customers currently solve this?"
                value={validation?.shortcomings ?? ""}
                onChange={(e) => updateValidation({ shortcomings: e.target.value })}
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
                value={validation?.emotionalImpact ?? ""}
                onChange={(e) => updateValidation({ emotionalImpact: e.target.value })}
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

              {(validation?.impacts ?? []).length > 0 && (
                <ul className="flex flex-col gap-2">
                  {(validation?.impacts ?? []).map((item: ImpactItem, i: number) => (
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
                    validation?.status === "valid"
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
                    validation?.status === "invalid"
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
                  value={validation?.reason ?? ""}
                  onChange={(e) => updateValidation({ reason: e.target.value })}
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
