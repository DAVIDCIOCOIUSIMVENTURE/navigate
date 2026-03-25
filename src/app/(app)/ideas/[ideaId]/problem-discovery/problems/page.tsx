"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemDiscovery, getAdjacentSteps } from "../context"
import { DEFAULT_PROBLEM } from "@/types/idea"
import { USE_CASES } from "../use-cases"
import { Briefcase, Plus, Trash2, Sparkles, ArrowRight } from "lucide-react"

type Tab = "strategy" | "use-cases"

export default function ProblemsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { jobs, setJobs, priorKnowledge } = useProblemDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)
  const [tab, setTab] = useState<Tab>("strategy")

  const namedJobs = jobs.filter((j) => j.name.trim())

  const addProblem = (jobId: number) => {
    setJobs(jobs.map((j) =>
      j.id === jobId
        ? { ...j, problems: [...j.problems, { ...DEFAULT_PROBLEM, id: Date.now() }] }
        : j
    ))
  }

  const updateProblem = (jobId: number, problemId: number, text: string) =>
    setJobs(jobs.map((j) =>
      j.id === jobId
        ? { ...j, problems: j.problems.map((p) => (p.id === problemId ? { ...p, text } : p)) }
        : j
    ))

  const removeProblem = (jobId: number, problemId: number) =>
    setJobs(jobs.map((j) =>
      j.id === jobId
        ? { ...j, problems: j.problems.filter((p) => p.id !== problemId) }
        : j
    ))

  const seedProblems = (jobId: number) => {
    const raw = [priorKnowledge.personalFrustrations, priorKnowledge.complaintsHeard]
      .join("\n")
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean)
    const newProblems = lines.map((text) => ({ ...DEFAULT_PROBLEM, id: Date.now() + Math.random(), text }))
    setJobs(jobs.map((j) =>
      j.id === jobId
        ? { ...j, problems: [...j.problems, ...newProblems] }
        : j
    ))
  }

  const hasSeedContent = priorKnowledge.personalFrustrations.trim() || priorKnowledge.complaintsHeard.trim()

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={Briefcase}>Problem Discovery</CardEyebrow>
        <CardTitle icon={Briefcase} className="text-lg">Problems</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            A <strong className="text-foreground/80">problem</strong> is a specific friction, gap, or frustration your customers encounter while trying to accomplish a job. Problems are the raw material of great products, and without a real, painful problem, there is no compelling reason for your solution to exist.
          </p>
          <p className="text-sm text-muted-foreground">
            For each job to be done, think about where things go wrong: what slows people down, what they have to work around, what they find confusing or exhausting. Be as specific as possible; vague problems lead to vague solutions. You can add as many problems as you like here; you&apos;ll narrow them down and pick the most important one to validate in the next step.
          </p>
          <p className="text-sm text-muted-foreground">
            If you haven&apos;t defined any jobs yet, head back to <strong className="text-foreground/80">Jobs to Be Done</strong> first. Problems are most useful when they&apos;re anchored to a specific goal your customer is trying to achieve.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setTab("strategy")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "strategy"
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Your Strategy
          </button>
          <button
            onClick={() => setTab("use-cases")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "use-cases"
                ? "bg-surface text-surface-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Use Cases
          </button>
        </div>

        {/* Tab content */}
        {tab === "strategy" && (
          namedJobs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-3 text-center text-muted-foreground">
              <Briefcase className="h-5 w-5" />
              <p className="text-sm">
                No jobs defined yet. Go back to{" "}
                <button
                  className="font-medium text-foreground underline underline-offset-2"
                  onClick={() => router.push(`/ideas/${ideaId}/problem-discovery/jobs-to-be-done`)}
                >
                  Jobs to Be Done
                </button>{" "}
                to add jobs first.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {namedJobs.map((job) => (
                <li key={job.id} className="rounded-lg bg-brand p-5 flex flex-col gap-4 text-brand-foreground">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-brand-foreground/60 uppercase tracking-wide flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3" />
                      Job
                    </p>
                    <p className="text-sm font-semibold">{job.name}</p>
                  </div>
                  {job.problems.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {job.problems.map((problem) => (
                        <li key={problem.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Describe a problem your customers face..."
                            value={problem.text}
                            onChange={(e) => updateProblem(job.id, problem.id, e.target.value)}
                            className="bg-background border-brand/30 text-foreground placeholder:text-muted-foreground flex-1"
                          />
                          {problem.text.trim() && (
                            <button
                              onClick={() => router.push(`/ideas/${ideaId}/problem-validation/pick-a-problem?select=${problem.id}`)}
                              className="text-brand-foreground/60 hover:text-brand-foreground transition-colors shrink-0"
                              aria-label="Validate problem"
                              title="Validate this problem"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removeProblem(job.id, problem.id)}
                            className="text-brand-foreground/60 hover:text-brand-foreground transition-colors shrink-0"
                            aria-label="Remove problem"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {hasSeedContent && job.problems.length === 0 && (
                    <Button
                      variant="on-primary"
                      className="w-full gap-2 opacity-80"
                      onClick={() => seedProblems(job.id)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Seed from your notes
                    </Button>
                  )}
                  <Button
                    variant="on-primary"
                    className="w-full gap-2"
                    onClick={() => addProblem(job.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Problem
                  </Button>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === "use-cases" && (
          <div className="rounded-xl border border-surface/20 bg-surface p-5 flex flex-col gap-4">
            <p className="text-sm text-surface-foreground/70">
              These examples show the kinds of problems that surface when customers try to accomplish the jobs defined in the previous step, grounded in the same three use cases.
            </p>
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="rounded-lg border border-surface-foreground/10 bg-surface-foreground/10 p-4 flex flex-col gap-3"
              >
                <p className="text-sm font-semibold text-surface-foreground">{uc.title}</p>
                {uc.jobs.map((j, i) => (
                  <div key={i} className="flex flex-col gap-2 pt-2 border-t border-surface-foreground/10 first:border-t-0 first:pt-0">
                    <div>
                      <p className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Job {i + 1}</p>
                      <p className="text-sm font-medium text-surface-foreground mt-0.5">{j.job}</p>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {j.problems.map((problem, pi) => (
                        <li key={pi} className="flex items-start gap-2 text-sm text-surface-foreground/80">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-surface-foreground/40 shrink-0" />
                          {problem}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : (
            <div />
          )}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
