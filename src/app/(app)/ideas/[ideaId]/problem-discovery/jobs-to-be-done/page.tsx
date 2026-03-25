"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProblemDiscovery, getAdjacentSteps, type Job } from "../context"
import { USE_CASES } from "../use-cases"
import { Briefcase, Plus, Trash2 } from "lucide-react"

type Tab = "strategy" | "use-cases"

export default function JobsToBeDonePage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { jobs, setJobs } = useProblemDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)
  const [tab, setTab] = useState<Tab>("strategy")

  const add = () =>
    setJobs([...jobs, { id: Date.now(), name: "", functional: "", emotional: "", social: "", problems: [] }])

  const remove = (id: number) => setJobs(jobs.filter((j) => j.id !== id))

  const update = (id: number, field: keyof Omit<Job, "id">, val: string) =>
    setJobs(jobs.map((j) => (j.id === id ? { ...j, [field]: val } : j)))

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={Briefcase}>Problem Discovery</CardEyebrow>
        <CardTitle icon={Briefcase} className="text-lg">Jobs to Be Done</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-5">

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            A <strong className="text-foreground/80">job to be done</strong> is the underlying goal or
            progress a person is trying to make in a given situation, not just the task itself, but the
            outcome they&apos;re seeking. People don&apos;t buy products; they hire them to get a job done.
            Understanding the job helps you build something customers actually want.
          </p>
          <p className="text-sm text-muted-foreground">
            Every job has three dimensions. The <strong className="text-foreground/80">functional</strong> dimension
            is the practical outcome, what they need to accomplish. The <strong className="text-foreground/80">emotional</strong> dimension
            is how they want to feel as a result. The <strong className="text-foreground/80">social</strong> dimension
            is how they want to be perceived by others. The most powerful solutions address all three.
          </p>
          <p className="text-sm text-muted-foreground">
            Start with the customer segment and sub-segment you defined, then ask: what is this person
            genuinely trying to accomplish? What would success look and feel like for them? Most segments
            have more than one important job, so add as many as are relevant.
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
          <div className="rounded-xl border border-brand/20 bg-brand p-5 flex flex-col gap-4">
            {jobs.map((job, i) => (
              <div key={job.id} className="flex flex-col gap-3">
                {i > 0 && <hr className="border-brand-foreground/20" />}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold flex items-center gap-2 text-brand-foreground">
                    <Briefcase className="h-4 w-4 text-brand-foreground/60" />
                    Job {i + 1}
                  </p>
                  <button
                    onClick={() => remove(job.id)}
                    className="text-brand-foreground/50 hover:text-destructive transition-colors"
                    aria-label="Remove job"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-brand-foreground">Name</label>
                  <Input
                    placeholder="What are your customers trying to get done?"
                    value={job.name}
                    onChange={(e) => update(job.id, "name", e.target.value)}
                    className="text-sm h-9 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["functional", "emotional", "social"] as const).map((field) => (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-brand-foreground capitalize">{field}</label>
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
                        className="resize-none text-sm focus-visible:ring-1 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {jobs.length > 0 && <hr className="border-brand-foreground/20" />}

            <Button
              variant="outline"
              onClick={add}
              className="w-full gap-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Plus className="h-4 w-4" />
              Add Job to Be Done
            </Button>
          </div>
        )}

        {tab === "use-cases" && (
          <div className="rounded-xl border border-surface/20 bg-surface p-5 flex flex-col gap-4">
            <p className="text-sm text-surface-foreground/70">
              These examples show how the same customer segments identified earlier translate into concrete jobs to be done, each with functional, emotional, and social dimensions mapped out.
            </p>
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="rounded-lg border border-surface-foreground/10 bg-surface-foreground/10 p-4 flex flex-col gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-surface-foreground">{uc.title}</p>
                  <p className="text-xs text-surface-foreground/50 mt-0.5">
                    Segment: {uc.customer.segment}
                  </p>
                </div>
                {uc.jobs && uc.jobs.map((j, i) => (
                  <div key={i} className="flex flex-col gap-2 pt-2 border-t border-surface-foreground/10 first:border-t-0 first:pt-0">
                    <p className="text-xs font-semibold text-surface-foreground/70 uppercase tracking-wide">Job {i + 1}</p>
                    <p className="text-sm font-medium text-surface-foreground">{j.job}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Functional</span>
                        <p className="mt-0.5 text-surface-foreground/80">{j.functional}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Emotional</span>
                        <p className="mt-0.5 text-surface-foreground/80">{j.emotional}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Social</span>
                        <p className="mt-0.5 text-surface-foreground/80">{j.social}</p>
                      </div>
                    </div>
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
