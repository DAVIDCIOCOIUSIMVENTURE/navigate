"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2, Briefcase } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"

export default function SolutionsPage() {
  const jobs = useSelector((state: RootState) => state.marketSegmentation.jobs)
  const dispatch = useDispatch<AppDispatch>()

  const namedJobs = jobs.filter((j) => j.job.trim())

  function addSolution(jobId: number) {
    dispatch.marketSegmentation.addSolution(jobId)
  }

  function updateSolution(jobId: number, id: number, text: string) {
    dispatch.marketSegmentation.updateSolution({ jobId, id, text })
  }

  function removeSolution(jobId: number, id: number) {
    dispatch.marketSegmentation.removeSolution({ jobId, id })
  }

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Market Segmentation</span>
        </div>
        <h2 className="text-xl font-semibold">Solutions</h2>
        <p className="text-sm">
          Survey the existing solutions in the market. Understanding what is already available — and where
          those solutions struggle — helps you pinpoint the gaps your problem sits within.
        </p>

        <hr className="border-border my-3" />
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-lg font-semibold text-primary">Your turn</h3>
          <p className="text-sm">For each job, list the solutions that already exist in the market</p>
        </div>

        {namedJobs.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Briefcase className="h-5 w-5" />
            <p className="text-sm">No jobs defined yet. Add jobs on the <span className="font-medium">Jobs to Be Done</span> page first.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {namedJobs.map((job) => {
              const jobSolutions = job.solutions
              return (
                <li key={job.id} className="rounded-lg bg-primary p-6 flex flex-col gap-4 text-primary-foreground">
                  <p className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    {job.job}
                  </p>

                  {jobSolutions.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {jobSolutions.map((solution) => (
                        <li key={solution.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Existing solution…"
                            value={solution.text}
                            onChange={(e) => updateSolution(job.id, solution.id, e.target.value)}
                            className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
                          />
                          <button
                            onClick={() => removeSolution(job.id, solution.id)}
                            className="text-primary-foreground/60 hover:text-primary-foreground transition-colors shrink-0"
                            aria-label="Remove solution"
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
                    onClick={() => addSolution(job.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Solution
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
