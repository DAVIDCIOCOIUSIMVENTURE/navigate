"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProblemDiscovery, getAdjacentSteps } from "../context"
import { useIdeas } from "@/store/ideas-hooks"
import { CheckCircle2, Briefcase, AlertTriangle, ArrowRight } from "lucide-react"

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
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { customer, jobs } = useProblemDiscovery()
  const { updateIdea } = useIdeas()
  const { prevPath } = getAdjacentSteps(pathname, ideaId)

  const namedJobs = jobs.filter((j) => j.name.trim())
  const hasAnyProblems = namedJobs.some((j) => j.problems.some((p) => p.text.trim()))

  const handleContinue = () => {
    updateIdea(ideaId, { problemDiscoveryComplete: true })
    router.push(`/ideas/${ideaId}/problem-validation/pick-a-problem`)
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={CheckCircle2}>Problem Discovery</CardEyebrow>
        <CardTitle icon={CheckCircle2} className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Review your problem discovery before moving on to validation.
        </p>

        {!hasAnyProblems && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              You haven&apos;t added any problems yet. You can still continue to Problem Validation, but you&apos;ll need to come back and add problems before you can validate them.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Section title="Customers">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Segment Name" value={customer.segmentName} />
              <Field label="Age Range" value={[customer.ageFrom, customer.ageTo].filter(Boolean).join(" – ")} />
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
                    {job.name && <p className="text-sm">{job.name}</p>}
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
            {hasAnyProblems ? (
              <ul className="flex flex-col gap-4">
                {namedJobs.map((job) => {
                  const jobProblems = job.problems.filter((p) => p.text.trim())
                  if (jobProblems.length === 0) return null
                  return (
                    <li key={job.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {job.name}
                        </p>
                      </div>
                      <ul className="flex flex-col gap-1 pl-4">
                        {jobProblems.map((p, i) => (
                          <li key={p.id} className="text-sm flex items-center gap-2">
                            <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                            <span className="flex-1">{p.text}</span>
                            <button
                              onClick={() => router.push(`/ideas/${ideaId}/problem-validation/pick-a-problem?select=${p.id}`)}
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                              aria-label="Validate problem"
                              title="Validate this problem"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No problems added yet</p>
            )}
          </Section>
        </div>

        <div className="flex justify-between">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : (
            <div />
          )}
          <Button onClick={handleContinue}>
            Continue to Problem Validation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
