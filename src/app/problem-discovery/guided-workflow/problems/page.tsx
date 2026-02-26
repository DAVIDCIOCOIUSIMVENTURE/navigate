"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, usePathname } from "next/navigation"
import { useWorkflow, getAdjacentSteps, type ProblemItem } from "../context"
import { Briefcase, Plus, Trash2 } from "lucide-react"

export default function ProblemsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { jobs, problems, setProblems, setSelectedProblemId } = useWorkflow()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)

  const namedJobs = jobs.filter((j) => j.job.trim())

  const addProblem = (jobId: number | null) => {
    const newProblem: ProblemItem = { id: Date.now(), jobId, text: "" }
    setProblems([...problems, newProblem])
  }

  const updateProblem = (id: number, text: string) =>
    setProblems(problems.map((p) => (p.id === id ? { ...p, text } : p)))

  const removeProblem = (id: number) => {
    setProblems(problems.filter((p) => p.id !== id))
    // Clear selection if the removed problem was selected
    setSelectedProblemId(null)
  }

  const problemsForJob = (jobId: number | null) =>
    problems.filter((p) => p.jobId === jobId)

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Problems</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          For each job to be done, list the problems your customers face when trying to accomplish it.
          You can add as many problems as you like — you&apos;ll pick the most important one in the next step.
        </p>

        {namedJobs.length === 0 ? (
          <>
            <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-3 text-center text-muted-foreground">
              <Briefcase className="h-5 w-5" />
              <p className="text-sm">
                No jobs defined yet. You can still add problems below, or go back to{" "}
                <button
                  className="font-medium text-foreground underline underline-offset-2"
                  onClick={() => router.push(`${pathname.replace("/problems", "/jobs-to-be-done")}`)}
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
          <ul className="flex flex-col gap-6">
            {namedJobs.map((job) => {
              const jobProblems = problemsForJob(job.id)
              return (
                <li
                  key={job.id}
                  className="rounded-lg bg-primary p-6 flex flex-col gap-4 text-primary-foreground"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wide flex items-center gap-1.5">
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
                            className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground flex-1"
                          />
                          <button
                            onClick={() => removeProblem(problem.id)}
                            className="text-primary-foreground/60 hover:text-primary-foreground transition-colors shrink-0"
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
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              Previous
            </Button>
          ) : (
            <div />
          )}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
