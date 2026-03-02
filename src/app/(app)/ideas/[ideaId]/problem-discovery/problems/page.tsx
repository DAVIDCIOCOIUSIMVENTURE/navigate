"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemDiscovery, getAdjacentSteps, type ProblemItem } from "../context"
import { USE_CASES } from "../use-cases"
import { Briefcase, Plus, Trash2 } from "lucide-react"

type Tab = "strategy" | "use-cases"

export default function ProblemsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { jobs, problems, setProblems } = useProblemDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)
  const [tab, setTab] = useState<Tab>("strategy")

  const namedJobs = jobs.filter((j) => j.job.trim())

  const addProblem = (jobId: number | null) => {
    const newProblem: ProblemItem = { id: Date.now(), jobId, text: "" }
    setProblems([...problems, newProblem])
  }

  const updateProblem = (id: number, text: string) =>
    setProblems(problems.map((p) => (p.id === id ? { ...p, text } : p)))

  const removeProblem = (id: number) =>
    setProblems(problems.filter((p) => p.id !== id))

  const problemsForJob = (jobId: number | null) =>
    problems.filter((p) => p.jobId === jobId)

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Problems</h2>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            A <strong className="text-foreground/80">problem</strong> is a specific friction, gap, or frustration your customers encounter while trying to accomplish a job. Problems are the raw material of great products — without a real, painful problem, there is no compelling reason for your solution to exist.
          </p>
          <p className="text-sm text-muted-foreground">
            For each job to be done, think about where things go wrong: what slows people down, what they have to work around, what they find confusing or exhausting. Be as specific as possible — vague problems lead to vague solutions. You can add as many problems as you like here; you&apos;ll narrow them down and pick the most important one to validate in the next step.
          </p>
          <p className="text-sm text-muted-foreground">
            If you haven&apos;t defined any jobs yet, head back to <strong className="text-foreground/80">Jobs to Be Done</strong> first — problems are most useful when they&apos;re anchored to a specific goal your customer is trying to achieve.
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
            <>
              <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-3 text-center text-muted-foreground">
                <Briefcase className="h-5 w-5" />
                <p className="text-sm">
                  No jobs defined yet. You can still add problems below, or go back to{" "}
                  <button
                    className="font-medium text-foreground underline underline-offset-2"
                    onClick={() => router.push(`/ideas/${ideaId}/problem-discovery/jobs-to-be-done`)}
                  >
                    Jobs to Be Done
                  </button>{" "}
                  first.
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {problemsForJob(null).map((problem) => (
                  <li key={problem.id} className="flex items-center gap-2">
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
                  </li>
                ))}
              </ul>
              <Button variant="outline" onClick={() => addProblem(null)} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Problem
              </Button>
            </>
          ) : (
            <ul className="flex flex-col gap-4">
              {namedJobs.map((job) => {
                const jobProblems = problemsForJob(job.id)
                return (
                  <li key={job.id} className="rounded-lg bg-brand p-5 flex flex-col gap-4 text-brand-foreground">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-brand-foreground/60 uppercase tracking-wide flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3" />
                        Job
                      </p>
                      <p className="text-sm font-semibold">{job.job}</p>
                    </div>
                    {jobProblems.length > 0 && (
                      <ul className="flex flex-col gap-2">
                        {jobProblems.map((problem) => (
                          <li key={problem.id} className="flex items-center gap-2">
                            <Input
                              placeholder="Describe a problem your customers face..."
                              value={problem.text}
                              onChange={(e) => updateProblem(problem.id, e.target.value)}
                              className="bg-background border-brand/30 text-foreground placeholder:text-muted-foreground flex-1"
                            />
                            <button
                              onClick={() => removeProblem(problem.id)}
                              className="text-brand-foreground/60 hover:text-brand-foreground transition-colors shrink-0"
                              aria-label="Remove problem"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
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
                )
              })}
            </ul>
          )
        )}

        {tab === "use-cases" && (
          <div className="rounded-xl border border-surface/20 bg-surface p-5 flex flex-col gap-4">
            <p className="text-sm text-surface-foreground/70">
              These examples show the kinds of problems that surface when customers try to accomplish the jobs defined in the previous step — grounded in the same three use cases.
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
