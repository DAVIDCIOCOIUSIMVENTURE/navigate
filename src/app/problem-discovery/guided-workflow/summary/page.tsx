"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useWorkflow, getAdjacentSteps } from "../context"
import { CheckCircle2, Briefcase } from "lucide-react"

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      {value ? (
        <p className="text-sm">{value}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">Not filled in</p>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold">{title}</p>
      {children}
    </div>
  )
}

export default function SummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { customer, jobs, problems, selectedProblemId, alternatives, contextWhen, shortcomings, emotionalImpact, impacts } =
    useWorkflow()

  const namedJobs = jobs.filter((j) => j.job.trim())
  const filledProblems = problems.filter((p) => p.text.trim())
  const selectedProblem = filledProblems.find((p) => p.id === selectedProblemId)
  const { prevPath } = getAdjacentSteps(pathname)

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Summary</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a summary of your Problem Statement Canvas. Review each section and use the sidebar to
          go back and refine any area.
        </p>

        <div className="flex flex-col gap-3">
          <Section title="Customers">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Segment Name" value={customer.segmentName} />
              <Field label="Occupation" value={customer.occupation} />
              <Field label="Age Range" value={customer.ageRange} />
            </div>
            <Field label="Who They Are" value={customer.whoTheyAre} />
            <Field label="What They Do" value={customer.whatTheyDo} />
            <Field label="Goals & Motivations" value={customer.goalsAndMotivations} />
            <Field label="Frustrations & Challenges" value={customer.frustrationsAndChallenges} />
          </Section>

          <Section title="Jobs to Be Done">
            {jobs.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {jobs.map((job, i) => (
                  <li key={job.id} className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Job {i + 1}
                    </p>
                    {job.job && <p className="text-sm">{job.job}</p>}
                    <div className="grid grid-cols-3 gap-2 mt-0.5">
                      {(["functional", "emotional", "social"] as const).map((field) => (
                        <div key={field}>
                          <p className="text-xs font-medium text-muted-foreground capitalize">{field}</p>
                          {job[field] ? (
                            <p className="text-sm">{job[field]}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">—</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not filled in</p>
            )}
          </Section>

          <Section title="Problems">
            {filledProblems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {namedJobs.map((job) => {
                  const jobProblems = filledProblems.filter((p) => p.jobId === job.id)
                  if (jobProblems.length === 0) return null
                  return (
                    <div key={job.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {job.job}
                        </p>
                      </div>
                      <ul className="flex flex-col gap-1 pl-4">
                        {jobProblems.map((p, i) => (
                          <li key={p.id} className="text-sm flex gap-2">
                            <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                            <span>{p.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
                {filledProblems.filter((p) => p.jobId === null).length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {namedJobs.length > 0 && (
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Other
                      </p>
                    )}
                    <ul className="flex flex-col gap-1 pl-4">
                      {filledProblems
                        .filter((p) => p.jobId === null)
                        .map((p, i) => (
                          <li key={p.id} className="text-sm flex gap-2">
                            <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                            <span>{p.text}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not filled in</p>
            )}
          </Section>

          <Section title="Selected Problem">
            {selectedProblem ? (
              <p className="text-sm">{selectedProblem.text}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not selected</p>
            )}
          </Section>

          <Section title="Alternatives">
            {alternatives.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {alternatives.map((alt, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not filled in</p>
            )}
          </Section>

          <Section title="Context">
            <Field label="When & Where" value={contextWhen} />
          </Section>

          <Section title="Alternatives Shortcomings">
            <Field label="Shortcomings" value={shortcomings} />
          </Section>

          <Section title="Emotional Impact">
            <Field label="Emotional Impact" value={emotionalImpact} />
          </Section>

          <Section title="Quantifiable Impact">
            {impacts.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {impacts.map((item, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="font-medium min-w-[7rem] shrink-0">{item.category || "—"}</span>
                    <span className="text-muted-foreground border-l pl-2">{item.description || "—"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not filled in</p>
            )}
          </Section>
        </div>

        <div className="flex justify-between">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              Previous
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={() => router.push("/problem-discovery")}>Back to Canvas</Button>
        </div>
      </CardContent>
    </Card>
  )
}
