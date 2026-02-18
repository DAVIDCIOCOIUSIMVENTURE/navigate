"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2 } from "lucide-react"

interface Job {
  id: number
  value: string
}

export default function JobsToBeDonePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [nextId, setNextId] = useState(1)

  function addJob() {
    setJobs((prev) => [...prev, { id: nextId, value: "" }])
    setNextId((n) => n + 1)
  }

  function updateJob(id: number, value: string) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, value } : j)))
  }

  function removeJob(id: number) {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Market Segmentation</span>
        </div>
        <h2 className="text-xl font-semibold">Jobs to Be Done</h2>
        <p className="text-sm">
          A <span className="font-medium">job to be done</span> is the underlying goal or progress a person
          is trying to make in a given situation — not just the task itself, but the functional, social, and
          emotional outcome they're seeking. People don't buy products; they hire them to get a job done.
          By identifying these jobs, you uncover what your market segment truly needs, and where current
          solutions fall short.
        </p>
        <div className="rounded-md bg-muted px-4 py-3 flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Example</p>
          <p className="text-sm font-medium">Segment: People cooking at home on a weeknight after a long day at work</p>
          <p className="text-sm">
            Job: <span className="italic">"Get a nutritious meal on the table in under 30 minutes, without having planned ahead."</span>
          </p>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Functional:</span> Prepare food that is ready to eat quickly.</p>
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Emotional:</span> Feel capable and in control rather than stressed or defeated.</p>
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Social:</span> Avoid the guilt of ordering takeaway yet again.</p>
          </div>
          <p className="text-sm text-muted-foreground">A meal-kit service is hired to do all three — regardless of whether the person is a parent, a student, or a professional.</p>
        </div>

        {jobs.length > 0 && (
          <ul className="flex flex-col gap-2">
            {jobs.map((job) => (
              <li key={job.id} className="flex items-center gap-2">
                <Input
                  placeholder="Describe the job to be done…"
                  value={job.value}
                  onChange={(e) => updateJob(job.id, e.target.value)}
                />
                <button
                  onClick={() => removeJob(job.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <Button className="w-full gap-2" onClick={addJob}>
          <Plus className="h-4 w-4" />
          Create New Job to Be Done
        </Button>
      </CardContent>
    </Card>
  )
}
