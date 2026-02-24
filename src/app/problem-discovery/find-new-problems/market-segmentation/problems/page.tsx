"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2, Briefcase, Lightbulb } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"

export default function ProblemsPage() {
  const jobs = useSelector((state: RootState) => state.marketSegmentation.jobs)
  const dispatch = useDispatch<AppDispatch>()

  const namedJobs = jobs.filter((j) => j.job.trim())

  function addProblem(jobId: number, solutionId: number) {
    dispatch.marketSegmentation.addProblem({ jobId, solutionId })
  }

  function updateProblem(jobId: number, solutionId: number, id: number, text: string) {
    dispatch.marketSegmentation.updateProblem({ jobId, solutionId, id, text })
  }

  function removeProblem(jobId: number, solutionId: number, id: number) {
    dispatch.marketSegmentation.removeProblem({ jobId, solutionId, id })
  }

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Market Segmentation</span>
        </div>
        <h2 className="text-xl font-semibold">Problems</h2>
        <p className="text-sm">
          Capture and articulate the specific problems you have uncovered through your market segmentation
          analysis. For each existing solution, identify the problems or frustrations it fails to address.
        </p>

        <hr className="border-border my-3" />
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-lg font-semibold text-primary">Your turn</h3>
          <p className="text-sm">For each solution, list the problems it leaves unsolved or creates</p>
        </div>

        {namedJobs.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Briefcase className="h-5 w-5" />
            <p className="text-sm">No jobs defined yet. Add jobs on the <span className="font-medium">Jobs to Be Done</span> page first.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {namedJobs.map((job) => {
              const namedSolutions = job.solutions.filter((s) => s.text.trim())
              return (
                <li key={job.id} className="flex flex-col gap-3">
                  <p className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                    {job.job}
                  </p>

                  {namedSolutions.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 flex flex-col items-center gap-1 text-center text-muted-foreground">
                      <Lightbulb className="h-4 w-4" />
                      <p className="text-xs">No solutions defined for this job yet. Add solutions on the <span className="font-medium">Solutions</span> page first.</p>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-3 pl-2">
                      {namedSolutions.map((solution) => (
                        <li key={solution.id} className="rounded-lg bg-primary p-6 flex flex-col gap-4 text-primary-foreground">
                          <p className="text-base font-semibold flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 shrink-0" />
                            {solution.text}
                          </p>

                          {solution.problems.length > 0 && (
                            <ul className="flex flex-col gap-2">
                              {solution.problems.map((problem) => (
                                <li key={problem.id} className="flex items-center gap-2">
                                  <Input
                                    placeholder="Problem this solution leaves unsolved…"
                                    value={problem.text}
                                    onChange={(e) => updateProblem(job.id, solution.id, problem.id, e.target.value)}
                                    className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
                                  />
                                  <button
                                    onClick={() => removeProblem(job.id, solution.id, problem.id)}
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
                            onClick={() => addProblem(job.id, solution.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Add Problem
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
