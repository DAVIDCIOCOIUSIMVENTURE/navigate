"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2, Briefcase } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"
import type { Job } from "../store/finding-my-customers-model"

type JobField = keyof Omit<Job, "id" | "solutions" | "problems">

export default function JobsToBeDonePage() {
  const jobs = useSelector((state: RootState) => state.findingMyCustomers.jobs)
  const dispatch = useDispatch<AppDispatch>()

  function addJob() {
    dispatch.findingMyCustomers.addJob()
  }

  function updateJob(id: number, field: JobField, value: string) {
    dispatch.findingMyCustomers.updateJob({ id, field, value })
  }

  function removeJob(id: number) {
    dispatch.findingMyCustomers.removeJob(id)
  }

  return (
    <Card className="w-full flex-1 flex flex-col h-[calc(100svh-9rem)]">
      <CardContent className="p-8 flex flex-col gap-4 overflow-y-auto flex-1">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Finding My Customers</span>
        </div>
        <h2 className="text-xl font-semibold">Jobs to Be Done</h2>
        <p className="text-sm">
          A <span className="font-medium">job to be done</span> is the underlying goal or progress a person
          is trying to make in a given situation — not just the task itself, but the functional, social, and
          emotional outcome they&apos;re seeking. People don&apos;t buy products; they hire them to get a job done.
          By identifying these jobs, you uncover what your customers truly need, and where current
          solutions fall short.
        </p>
        <div className="rounded-lg border p-8 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">What you&apos;ll do here</h3>
          <p className="text-sm">
            List the jobs your customers are trying to get done. For each job, consider the functional outcome
            they need, the emotional state they want to reach, and the social impression they want to make.
          </p>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Examples</p>
            {[
              {
                segment: "Freelance designers chasing client approvals",
                job: "Get sign-off on work without endless back-and-forth revisions.",
                functional: "Share designs and collect feedback in one place.",
                emotional: "Feel confident the client understands what they're approving.",
                social: "Look professional and in control of the project process.",
                hired: "A design feedback tool is hired to do all three — regardless of the designer's specialism or client type.",
              },
              {
                segment: "New parents returning to work",
                job: "Ease back into full-time work without feeling overwhelmed or guilty.",
                functional: "Manage workload and childcare logistics reliably.",
                emotional: "Feel capable at work and present as a parent.",
                social: "Avoid judgement from colleagues or other parents.",
                hired: "A flexible work scheduling tool or childcare platform is hired to do all three — regardless of industry or family setup.",
              },
              {
                segment: "Independent café owners managing staff",
                job: "Ensure the café is staffed correctly without spending hours on rotas.",
                functional: "Create and share shift schedules quickly.",
                emotional: "Feel in control of operations rather than constantly firefighting.",
                social: "Be seen as a fair and reliable employer by staff.",
                hired: "A shift management app is hired to do all three — regardless of café size or location.",
              },
            ].map((ex) => (
              <div key={ex.segment} className="rounded-md bg-muted/40 px-3 py-2 flex flex-col gap-1.5">
                <p className="text-sm font-medium">Customer: {ex.segment}</p>
                <p className="text-sm">Job: <span className="italic">&ldquo;{ex.job}&rdquo;</span></p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Functional:</span> {ex.functional}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Emotional:</span> {ex.emotional}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Social:</span> {ex.social}</p>
                </div>
                <p className="text-sm text-muted-foreground">{ex.hired}</p>
              </div>
            ))}
          </div>
        </div>

        <>
          <hr className="border-border my-3" />
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-lg font-semibold text-primary">Your turn</h3>
            <p className="text-sm">Define your Jobs to be Done</p>
          </div>
          <ul className="flex flex-col gap-4">
            {jobs.map((job, i) => (
              <li key={job.id} className="rounded-lg bg-primary p-8 flex flex-col gap-4 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold flex items-center gap-2"><Briefcase className="h-5 w-5" />Job {i + 1}</p>
                  <button
                    onClick={() => removeJob(job.id)}
                    disabled={jobs.length === 1}
                    className="text-primary-foreground/60 hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Job</label>
                  <Input
                    placeholder="What are your customers trying to get done?"
                    value={job.job}
                    onChange={(e) => updateJob(job.id, "job", e.target.value)}
                    className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Functional</label>
                  <Textarea
                    placeholder="What practical outcome do they need?"
                    value={job.functional}
                    onChange={(e) => updateJob(job.id, "functional", e.target.value)}
                    rows={2}
                    className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Emotional</label>
                  <Textarea
                    placeholder="How do they want to feel?"
                    value={job.emotional}
                    onChange={(e) => updateJob(job.id, "emotional", e.target.value)}
                    rows={2}
                    className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Social</label>
                  <Textarea
                    placeholder="How do they want to be seen by others?"
                    value={job.social}
                    onChange={(e) => updateJob(job.id, "social", e.target.value)}
                    rows={2}
                    className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </li>
            ))}
          </ul>
        </>

        <Button variant="primary-outline" className="w-full gap-2" onClick={addJob}>
          <Plus className="h-4 w-4" />
          Create New Job to Be Done
        </Button>
      </CardContent>
    </Card>
  )
}
