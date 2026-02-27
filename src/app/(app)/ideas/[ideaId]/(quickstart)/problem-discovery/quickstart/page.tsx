"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useIdeas } from "@/context/ideas-context"
import { Users, Briefcase, AlertCircle, Plus, Trash2 } from "lucide-react"
import type { CustomerFields, Job } from "@/types/idea"

const CUSTOMER_TEXT_FIELDS: {
  key: keyof CustomerFields; label: string; placeholder: string; multiline?: boolean
}[] = [
  { key: "segmentName", label: "Segment Name", placeholder: "e.g. Freelance Designers, Mid-market HR Teams..." },
  { key: "occupation", label: "Occupation", placeholder: "e.g. Product Manager, Small Business Owner..." },
  { key: "ageRange", label: "Age Range", placeholder: "e.g. 25–40" },
  { key: "whoTheyAre", label: "Who They Are", placeholder: "Describe their background, lifestyle, and identity...", multiline: true },
  { key: "whatTheyDo", label: "What They Do", placeholder: "Describe their daily activities and responsibilities...", multiline: true },
  { key: "goalsAndMotivations", label: "Goals & Motivations", placeholder: "What are they trying to achieve? What drives them?", multiline: true },
  { key: "frustrationsAndChallenges", label: "Frustrations & Challenges", placeholder: "What blocks them from achieving their goals?", multiline: true },
]

export default function QuickstartCanvasPage() {
  const params = useParams()
  const router = useRouter()
  const ideaId = Number(params.ideaId)
  const { getIdea, updateIdea } = useIdeas()

  const idea = getIdea(ideaId)

  if (!idea) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-muted-foreground text-sm">Idea not found.</p>
        <Button variant="outline" onClick={() => router.push("/ideas")}>Back to Ideas</Button>
      </div>
    )
  }

  const customer = idea.customer
  const jobs = idea.jobs
  const problems = idea.problems

  const setCustomerField = (key: keyof CustomerFields, val: string) =>
    updateIdea(ideaId, { customer: { ...customer, [key]: val } })

  const addJob = () =>
    updateIdea(ideaId, {
      jobs: [...jobs, { id: Date.now(), job: "", functional: "", emotional: "", social: "" }],
    })

  const updateJob = (id: number, field: keyof Omit<Job, "id">, val: string) =>
    updateIdea(ideaId, { jobs: jobs.map((j) => (j.id === id ? { ...j, [field]: val } : j)) })

  const removeJob = (id: number) => {
    const removedJob = jobs.find((j) => j.id === id)
    updateIdea(ideaId, {
      jobs: jobs.filter((j) => j.id !== id),
      // Detach problems that belonged to this job
      problems: problems.map((p) =>
        p.jobId === (removedJob?.id ?? null) ? { ...p, jobId: null } : p
      ),
    })
  }

  const addProblem = (jobId: number | null) =>
    updateIdea(ideaId, {
      problems: [...problems, { id: Date.now(), jobId, text: "" }],
    })

  const updateProblem = (id: number, text: string) =>
    updateIdea(ideaId, { problems: problems.map((p) => (p.id === id ? { ...p, text } : p)) })

  const removeProblem = (id: number) =>
    updateIdea(ideaId, { problems: problems.filter((p) => p.id !== id) })

  const namedJobs = jobs.filter((j) => j.job.trim())

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">{idea.title}</h1>
        <p className="text-sm text-muted-foreground">
          Define your customer segment, their jobs to be done, and the problems they face.
        </p>
      </div>

      {/* Customer Section */}
      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Customer Segment</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CUSTOMER_TEXT_FIELDS.filter((f) => !f.multiline).map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                <Input
                  placeholder={f.placeholder}
                  value={customer[f.key]}
                  onChange={(e) => setCustomerField(f.key, e.target.value)}
                  className="text-sm h-8"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CUSTOMER_TEXT_FIELDS.filter((f) => f.multiline).map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                <Textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={customer[f.key]}
                  onChange={(e) => setCustomerField(f.key, e.target.value)}
                  className="resize-none text-sm focus-visible:ring-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jobs to Be Done Section */}
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
                    value={job.job}
                    onChange={(e) => updateJob(job.id, "job", e.target.value)}
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
                </li>
              ))}
            </ul>
          )}

          <Button variant="outline" onClick={addJob} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Job to Be Done
          </Button>
        </CardContent>
      </Card>

      {/* Problems Section */}
      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Problems</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            For each job, list the problems your customers face when trying to accomplish it.
          </p>

          {namedJobs.length === 0 ? (
            <div className="flex flex-col gap-3">
              {problems.filter((p) => p.jobId === null).map((problem) => (
                <div key={problem.id} className="flex items-center gap-2">
                  <Input
                    placeholder="Describe a problem your customers face..."
                    value={problem.text}
                    onChange={(e) => updateProblem(problem.id, e.target.value)}
                    className="text-sm h-9 flex-1"
                  />
                  <button
                    onClick={() => removeProblem(problem.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    aria-label="Remove problem"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button variant="outline" onClick={() => addProblem(null)} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Problem
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {namedJobs.map((job) => {
                const jobProblems = problems.filter((p) => p.jobId === job.id)
                return (
                  <li key={job.id} className="rounded-lg bg-primary p-5 flex flex-col gap-3 text-primary-foreground">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wide flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3" />
                        Job
                      </p>
                      <p className="text-sm font-semibold">{job.job}</p>
                    </div>
                    {jobProblems.map((problem) => (
                      <div key={problem.id} className="flex items-center gap-2">
                        <Input
                          placeholder="Describe a problem your customers face..."
                          value={problem.text}
                          onChange={(e) => updateProblem(problem.id, e.target.value)}
                          className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground flex-1"
                        />
                        <button
                          onClick={() => removeProblem(problem.id)}
                          className="text-primary-foreground/60 hover:text-primary-foreground transition-colors shrink-0"
                          aria-label="Remove problem"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="on-primary"
                      className="w-full gap-2"
                      onClick={() => addProblem(job.id)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Problem
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
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
