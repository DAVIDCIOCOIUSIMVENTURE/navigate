"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useIdeas } from "@/store/ideas-hooks"
import { Users, Briefcase, AlertCircle, Plus, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react"
import type { CustomerFields, Job, PriorKnowledgeFields } from "@/types/idea"
import { DEFAULT_PROBLEM, DEFAULT_PRIOR_KNOWLEDGE } from "@/types/idea"

const PRIOR_KNOWLEDGE_FIELDS: {
  key: keyof PriorKnowledgeFields; label: string; placeholder: string
}[] = [
  { key: "personalFrustrations", label: "What frustrations have you experienced?", placeholder: "Think about moments where you felt stuck, annoyed, or had to work around something..." },
  { key: "whoStruggles", label: "Who do you see struggling with this?", placeholder: "Describe the types of people who face this problem. What's their situation?" },
  { key: "existingWorkarounds", label: "What workarounds or makeshift solutions exist?", placeholder: "How are people currently dealing with this? Spreadsheets, manual processes, asking friends..." },
  { key: "complaintsHeard", label: "What have you heard others complain about?", placeholder: "Think about conversations, social media, forums, or news stories..." },
  { key: "whyItMatters", label: "Why does this matter to you?", placeholder: "What draws you to this problem space? What would change if it were solved?" },
]

const CUSTOMER_SINGLE_FIELDS: {
  key: keyof CustomerFields; label: string; placeholder: string
}[] = [
  { key: "segmentName", label: "Segment Name", placeholder: "e.g. Freelance Designers, Mid-market HR Teams..." },
]

const CUSTOMER_MULTILINE_FIELDS: {
  key: keyof CustomerFields; label: string; placeholder: string
}[] = [
  { key: "whoTheyAre", label: "Who They Are", placeholder: "Describe their background, lifestyle, and identity..." },
  { key: "whatTheyDo", label: "What They Do", placeholder: "Describe their daily activities and responsibilities..." },
  { key: "goalsAndMotivations", label: "Goals & Motivations", placeholder: "What are they trying to achieve? What drives them?" },
  { key: "frustrationsAndChallenges", label: "Frustrations & Challenges", placeholder: "What blocks them from achieving their goals?" },
]

export default function QuickstartCanvasPage() {
  const params = useParams()
  const router = useRouter()
  const ideaId = Number(params.ideaId)
  const { getIdea, updateIdea } = useIdeas()
  const [explorationExpanded, setExplorationExpanded] = useState(false)

  const idea = getIdea(ideaId)

  if (!idea) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-muted-foreground text-sm">Idea not found.</p>
        <Button variant="outline" onClick={() => router.push("/ideas")}>Back to Ideas</Button>
      </div>
    )
  }

  const priorKnowledge = idea.priorKnowledge ?? { ...DEFAULT_PRIOR_KNOWLEDGE }
  const customer = idea.customer
  const jobs = idea.jobs

  const setPriorKnowledgeField = (key: keyof PriorKnowledgeFields, val: string) =>
    updateIdea(ideaId, { priorKnowledge: { ...priorKnowledge, [key]: val } })

  const setCustomerField = (key: keyof CustomerFields, val: string) =>
    updateIdea(ideaId, { customer: { ...customer, [key]: val } })

  const addJob = () =>
    updateIdea(ideaId, {
      jobs: [...jobs, { id: Date.now(), name: "", functional: "", emotional: "", social: "", problems: [] }],
    })

  const updateJob = (id: number, field: keyof Omit<Job, "id" | "problems">, val: string) =>
    updateIdea(ideaId, { jobs: jobs.map((j) => (j.id === id ? { ...j, [field]: val } : j)) })

  const removeJob = (id: number) =>
    updateIdea(ideaId, { jobs: jobs.filter((j) => j.id !== id) })

  const addProblem = (jobId: number) =>
    updateIdea(ideaId, {
      jobs: jobs.map((j) =>
        j.id === jobId
          ? { ...j, problems: [...j.problems, { ...DEFAULT_PROBLEM, id: Date.now() }] }
          : j
      ),
    })

  const updateProblem = (jobId: number, problemId: number, text: string) =>
    updateIdea(ideaId, {
      jobs: jobs.map((j) =>
        j.id === jobId
          ? { ...j, problems: j.problems.map((p) => (p.id === problemId ? { ...p, text } : p)) }
          : j
      ),
    })

  const removeProblem = (jobId: number, problemId: number) =>
    updateIdea(ideaId, {
      jobs: jobs.map((j) =>
        j.id === jobId
          ? { ...j, problems: j.problems.filter((p) => p.id !== problemId) }
          : j
      ),
    })

  const namedJobs = jobs.filter((j) => j.name.trim())

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">{idea.title}</h1>
        <p className="text-sm text-muted-foreground">
          Define your customer segment, their jobs to be done, and the problems they face.
        </p>
      </div>

      {/* Problem Exploration Section */}
      <Card className="border-amber-200/50 dark:border-amber-800/50">
        <CardContent className="p-6 flex flex-col gap-4">
          <button
            onClick={() => setExplorationExpanded((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-semibold">Problem Exploration</h2>
            </div>
            {explorationExpanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            }
          </button>
          {!explorationExpanded && (
            <p className="text-sm text-muted-foreground">
              Capture what you already know, frustrations, observations, and complaints, before diving into the structured steps.
            </p>
          )}
          {explorationExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRIOR_KNOWLEDGE_FIELDS.map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                  <Textarea
                    rows={3}
                    placeholder={f.placeholder}
                    value={priorKnowledge[f.key]}
                    onChange={(e) => setPriorKnowledgeField(f.key, e.target.value)}
                    className="resize-none text-sm focus-visible:ring-1"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Section */}
      <Card className="border-brand/20 bg-brand">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-brand-foreground/70" />
            <h2 className="text-base font-semibold text-brand-foreground">Customer Segment</h2>
          </div>
          <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CUSTOMER_SINGLE_FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-brand-foreground">{f.label}</label>
                <Input
                  placeholder={f.placeholder}
                  value={customer[f.key]}
                  onChange={(e) => setCustomerField(f.key, e.target.value)}
                  className="text-sm h-8 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-brand-foreground">Age Range</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="From"
                  value={customer.ageFrom}
                  onChange={(e) => setCustomerField("ageFrom", e.target.value)}
                  className="text-sm h-8 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                />
                <span className="text-brand-foreground text-sm shrink-0">to</span>
                <Input
                  placeholder="To"
                  value={customer.ageTo}
                  onChange={(e) => setCustomerField("ageTo", e.target.value)}
                  className="text-sm h-8 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CUSTOMER_MULTILINE_FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-brand-foreground">{f.label}</label>
                <Textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={customer[f.key]}
                  onChange={(e) => setCustomerField(f.key, e.target.value)}
                  className="resize-none text-sm focus-visible:ring-1 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                />
              </div>
            ))}
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs to Be Done + Problems (combined per-job) */}
      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Jobs to Be Done</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            What underlying goals or progress is your customer trying to make?
          </p>

          {jobs.length > 0 && (
            <ul className="flex flex-col gap-3">
              {jobs.map((job, i) => (
                <li key={job.id} className="rounded-lg border p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      Job {i + 1}
                    </p>
                    <button
                      onClick={() => removeJob(job.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    placeholder="What are your customers trying to get done?"
                    value={job.name}
                    onChange={(e) => updateJob(job.id, "name", e.target.value)}
                    className="text-sm h-9"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(["functional", "emotional", "social"] as const).map((field) => (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-foreground/70 capitalize">{field}</label>
                        <Textarea
                          rows={2}
                          placeholder={
                            field === "functional"
                              ? "What practical outcome do they need?"
                              : field === "emotional"
                              ? "How do they want to feel?"
                              : "How do they want to be seen by others?"
                          }
                          value={job[field]}
                          onChange={(e) => updateJob(job.id, field, e.target.value)}
                          className="resize-none text-sm focus-visible:ring-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Problems for this job */}
                  {job.name.trim() && (
                    <div className="flex flex-col gap-2 pt-1 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Problems</p>
                      </div>
                      {job.problems.map((problem) => (
                        <div key={problem.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Describe a problem your customers face..."
                            value={problem.text}
                            onChange={(e) => updateProblem(job.id, problem.id, e.target.value)}
                            className="text-sm h-9 flex-1"
                          />
                          <button
                            onClick={() => removeProblem(job.id, problem.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            aria-label="Remove problem"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={() => addProblem(job.id)} className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        Add Problem
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {namedJobs.length === 0 && jobs.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Add a job to get started, then add problems for each job.
            </p>
          )}

          <Button variant="outline" onClick={addJob} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Job to Be Done
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-4">
        <Button onClick={() => router.push(`/ideas/${ideaId}/problem-validation/quickstart`)}>
          Continue to Problem Validation
        </Button>
      </div>
    </div>
  )
}
