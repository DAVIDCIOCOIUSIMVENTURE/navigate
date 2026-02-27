"use client"

import { useState, type KeyboardEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useIdeas } from "@/context/ideas-context"
import {
  Users, CircleDot, GitFork, Clock, ThumbsDown, Heart, BarChart2,
  Briefcase, CheckCircle2, Plus, X, Trash2,
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

  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    idea?.selectedProblemId ?? null
  )

  // Validation fields — derived from the selected problem's existing validation
  const getValidation = (id: number | null) =>
    id !== null ? idea?.validations.find((v) => v.problemId === id) : undefined

  const existing = getValidation(selectedProblemId)

  const [alternatives, setAlternatives] = useState<string[]>(existing?.alternatives ?? [])
  const [altDraft, setAltDraft] = useState("")
  const [contextWhen, setContextWhen] = useState(existing?.contextWhen ?? "")
  const [shortcomings, setShortcomings] = useState(existing?.shortcomings ?? "")
  const [emotionalImpact, setEmotionalImpact] = useState(existing?.emotionalImpact ?? "")
  const [impacts, setImpacts] = useState<ImpactItem[]>(existing?.impacts ?? [])
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
  const jobs = idea.jobs
  const namedJobs = jobs.filter((j) => j.job.trim())
  const problemsByJob = namedJobs
    .map((job) => ({ job, items: problems.filter((p) => p.jobId === job.id) }))
    .filter((g) => g.items.length > 0)
  const unlinkedProblems = problems.filter((p) => p.jobId === null)

  const loadProblem = (id: number) => {
    // Save current before switching
    saveCurrentValidation()
    const v = idea.validations.find((v) => v.problemId === id)
    setAlternatives(v?.alternatives ?? [])
    setContextWhen(v?.contextWhen ?? "")
    setShortcomings(v?.shortcomings ?? "")
    setEmotionalImpact(v?.emotionalImpact ?? "")
    setImpacts(v?.impacts ?? [])
    setSelectedProblemId(id)
    updateIdea(ideaId, { selectedProblemId: id })
  }

  const saveCurrentValidation = () => {
    if (selectedProblemId === null) return
    const v = idea.validations.find((v) => v.problemId === selectedProblemId)
    const updated: ProblemValidation = {
      id: v?.id ?? Date.now(),
      problemId: selectedProblemId,
      alternatives,
      contextWhen,
      shortcomings,
      emotionalImpact,
      impacts,
      status: v?.status ?? "in_progress",
      reason: v?.reason ?? "",
    }
    const next = v
      ? idea.validations.map((x) => (x.problemId === selectedProblemId ? updated : x))
      : [...idea.validations, updated]
    updateIdea(ideaId, { validations: next })
  }

  // Alternatives helpers
  const addAlt = () => {
    const trimmed = altDraft.trim()
    if (!trimmed) return
    setAlternatives([...alternatives, trimmed])
    setAltDraft("")
  }
  const onAltKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addAlt() }
  }

  // Impacts helpers
  const addImpact = () => {
    if (!impactDraft.category.trim() && !impactDraft.description.trim()) return
    setImpacts([...impacts, { ...impactDraft }])
    setImpactDraft({ category: "", description: "" })
  }
  const removeImpact = (i: number) => setImpacts(impacts.filter((_, idx) => idx !== i))

  const selectedProblem = problems.find((p) => p.id === selectedProblemId)

  function renderProblemButton(problem: (typeof problems)[number]) {
    const isSelected = selectedProblemId === problem.id
    const v = idea!.validations.find((v) => v.problemId === problem.id)
    const badge = v ? STATUS_BADGE[v.status] : null
    return (
      <li key={problem.id}>
        <button
          onClick={() => loadProblem(problem.id)}
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
          Select a problem and fill in the validation details.
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

      {/* Problem selector */}
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
              <Button variant="outline" size="sm" onClick={() => router.push(`/ideas/${ideaId}/quickstart-discovery`)}>
                Back to Problem Discovery
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

      {/* Validation fields — shown once a problem is selected */}
      {selectedProblem && (
        <>
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Validating: {selectedProblem.text}
            </p>
            <div className="h-px flex-1 bg-border" />
          </div>

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
              {alternatives.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {alternatives.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                      <span className="flex-1">{item}</span>
                      <button onClick={() => setAlternatives(alternatives.filter((_, idx) => idx !== i))} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
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
                rows={3}
                placeholder="When does this problem occur? In what situation or context?"
                value={contextWhen}
                onChange={(e) => setContextWhen(e.target.value)}
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
                rows={3}
                placeholder="What's wrong with how customers currently solve this?"
                value={shortcomings}
                onChange={(e) => setShortcomings(e.target.value)}
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
                rows={3}
                placeholder="Frustrated? Anxious? Embarrassed? Describe the emotional effect..."
                value={emotionalImpact}
                onChange={(e) => setEmotionalImpact(e.target.value)}
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

              {impacts.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {impacts.map((item, i) => (
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
        </>
      )}

      <div className="flex justify-end gap-3 pb-4">
        <Button variant="outline" onClick={() => router.push(`/ideas/${ideaId}/quickstart-discovery`)}>
          Back to Problem Discovery
        </Button>
        {selectedProblem && (
          <Button onClick={() => { saveCurrentValidation(); router.push(`/ideas/${ideaId}/quickstart-discovery`) }}>
            Save Validation
          </Button>
        )}
      </div>
    </div>
  )
}
