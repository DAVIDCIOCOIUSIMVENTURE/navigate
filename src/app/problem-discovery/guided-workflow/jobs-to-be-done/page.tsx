"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, usePathname } from "next/navigation"
import { useWorkflow, getAdjacentSteps, type Job } from "../context"
import { Briefcase, Plus, Trash2 } from "lucide-react"

export default function JobsToBeDonePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { jobs, setJobs } = useWorkflow()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)

  const add = () =>
    setJobs([...jobs, { id: Date.now(), job: "", functional: "", emotional: "", social: "" }])

  const remove = (id: number) => setJobs(jobs.filter((j) => j.id !== id))

  const update = (id: number, field: keyof Omit<Job, "id">, val: string) =>
    setJobs(jobs.map((j) => (j.id === id ? { ...j, [field]: val } : j)))

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Jobs to Be Done</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          A <span className="font-medium text-foreground">job to be done</span> is the underlying goal or
          progress a person is trying to make in a given situation — not just the task itself, but the
          functional, social, and emotional outcome they&apos;re seeking. List the jobs your customers are
          trying to get done and describe each dimension.
        </p>

        {jobs.length > 0 && (
          <ul className="flex flex-col gap-4">
            {jobs.map((job, i) => (
              <li key={job.id} className="rounded-lg border p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Job {i + 1}
                  </p>
                  <button
                    onClick={() => remove(job.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove job"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/70">Job</label>
                  <Input
                    placeholder="What are your customers trying to get done?"
                    value={job.job}
                    onChange={(e) => update(job.id, "job", e.target.value)}
                    className="text-sm h-9"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["functional", "emotional", "social"] as const).map((field) => (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-foreground/70 capitalize">{field}</label>
                      <Textarea
                        rows={3}
                        placeholder={
                          field === "functional"
                            ? "What practical outcome do they need?"
                            : field === "emotional"
                            ? "How do they want to feel?"
                            : "How do they want to be seen by others?"
                        }
                        value={job[field]}
                        onChange={(e) => update(job.id, field, e.target.value)}
                        className="resize-none text-sm focus-visible:ring-1"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button variant="outline" onClick={add} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Job to Be Done
        </Button>

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
