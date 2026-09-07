"use client"

import type { ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight, Briefcase, ExternalLink, Eye, GitFork, Heart, LayoutTemplate, Pencil, Search, Sparkles, Users,
  type LucideIcon,
} from "lucide-react"
import { useProblem, getAdjacentSteps, type ExploreStepPath } from "../context"
import { RefinementStrategy } from "@/components/problem-strategies/refinement-strategy"
import { SHOW_REFINEMENT_STEPS } from "@/lib/feature-flags"
import { useDimensionLabels } from "@/lib/dimension-labels"
import { cn } from "@/lib/utils"
import type { Job, JobIntensity } from "@/types/validation"

/* Section chrome mirrors the Reflect / Research review panels: a blue panel, a
   yellow icon tile, and a white heading that jumps back to the step. */

function ReviewSection({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
      {children}
    </section>
  )
}

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-yellow-600" aria-hidden="true">
      <Icon className="h-4 w-4 text-white" />
    </div>
  )
}

function TitleButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 text-left text-base font-semibold text-white hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
    >
      <span>{children}</span>
      <Pencil
        className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />
      <span className="sr-only">Edit this step</span>
    </button>
  )
}

function SectionHeading({ icon, onClick, children }: { icon: LucideIcon; onClick: () => void; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <IconTile icon={icon} />
      <TitleButton onClick={onClick}>{children}</TitleButton>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-base italic text-white">{text}</p>
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-400 text-foreground px-3 py-1 text-base">
      {children}
    </span>
  )
}

function WhitePanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg bg-white p-4 text-foreground flex flex-col gap-1", className)}>{children}</div>
}

const INTENSITY_BADGE: Record<Exclude<JobIntensity, "">, string> = {
  mild: "bg-yellow-600 text-white",
  strong: "bg-orange-700 text-white",
  unbearable: "bg-red-800 text-white",
}

function JobsGroup({
  title,
  icon: Icon,
  iconBg,
  jobs,
  emptyLabel,
}: {
  title: string
  icon: LucideIcon
  iconBg: string
  jobs: Job[]
  emptyLabel: string
}) {
  const filled = jobs.filter((job) => job.text.trim().length > 0)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={cn("flex items-center justify-center h-7 w-7 rounded-lg shrink-0", iconBg)} aria-hidden="true">
          <Icon className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="text-base font-semibold text-white">{title}</span>
      </div>
      {filled.length === 0 ? (
        <EmptyHint text={emptyLabel} />
      ) : (
        <div className="flex flex-col gap-2">
          {filled.map((job) => (
            <div key={job.id} className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 text-foreground">
              <p className="text-base flex-1 min-w-0">{job.text}</p>
              {job.intensity && (
                <span className={cn("shrink-0 rounded px-2 py-0.5 text-base font-semibold capitalize", INTENSITY_BADGE[job.intensity])}>
                  {job.intensity}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExploreReviewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problem, customerDescription, existingSolutions, jobsToBeDone } = useProblem()
  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  const customerIds = problem?.customers ?? []
  const customerLabels = useDimensionLabels("customers", customerIds)
  const description = customerDescription.trim()
  const hasCustomer = customerIds.length > 0 || description.length > 0

  const solutions = existingSolutions.filter((sol) => sol.text.trim().length > 0)
  const jobsCount = jobsToBeDone.functional.length + jobsToBeDone.emotional.length + jobsToBeDone.social.length

  const goTo = (step: ExploreStepPath) => router.push(`/problems/${problemRef}/explore/${step}`)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0 space-y-6">
        <CardTitle icon={LayoutTemplate} iconBg="bg-tertiary">Review</CardTitle>
        <p className="text-base leading-relaxed">
          A read-only overview of everything you uncovered while exploring this problem. Click any heading below to jump back to that step. When you are happy with the picture, continue to Problem Validation to size the market and weigh up the competition. Everything below carries forward.
        </p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <ReviewSection>
          <SectionHeading icon={Users} onClick={() => goTo("customer")}>Customer</SectionHeading>
          {!hasCustomer && <EmptyHint text="No customer details captured." />}
          {customerIds.length > 0 && (
            <>
              <p className="text-base text-white">
                {customerIds.length} {customerIds.length === 1 ? "segment" : "segments"} selected.
              </p>
              <div className="flex flex-wrap gap-2">
                {customerIds.map((id, i) => (
                  <Chip key={id}>{customerLabels[i]}</Chip>
                ))}
              </div>
            </>
          )}
          {description.length > 0 && (
            <WhitePanel>
              <p className="text-base font-semibold">Description</p>
              <p className="text-base whitespace-pre-wrap">{description}</p>
            </WhitePanel>
          )}
        </ReviewSection>

        {SHOW_REFINEMENT_STEPS && (
          <ReviewSection>
            <SectionHeading icon={Search} onClick={() => goTo("refine")}>Refinement</SectionHeading>
            <RefinementStrategy showChooser readOnly />
          </ReviewSection>
        )}

        <ReviewSection>
          <SectionHeading icon={GitFork} onClick={() => goTo("existing-solutions")}>
            Existing Solutions, Shortcomings &amp; Impacts
          </SectionHeading>
          {solutions.length === 0 ? (
            <EmptyHint text="No existing solutions captured." />
          ) : (
            <>
              <p className="text-base text-white">
                {solutions.length} existing {solutions.length === 1 ? "solution" : "solutions"} captured, with the ways each one falls short.
              </p>
              <div className="flex flex-col gap-3">
                {solutions.map((sol) => {
                  const shortcomings = sol.shortcomings.filter((sc) => sc.text.trim().length > 0)
                  return (
                    <WhitePanel key={sol.id}>
                      <p className="text-base font-semibold">{sol.text}</p>
                      {shortcomings.length > 0 ? (
                        <ul className="list-disc pl-5 text-base flex flex-col gap-0.5">
                          {shortcomings.map((sc) => <li key={sc.id}>{sc.text}</li>)}
                        </ul>
                      ) : (
                        <p className="text-base italic">No shortcomings captured.</p>
                      )}
                    </WhitePanel>
                  )
                })}
              </div>
            </>
          )}
        </ReviewSection>

        <ReviewSection>
          <SectionHeading icon={Sparkles} onClick={() => goTo("jobs-to-be-done")}>
            Jobs your customer is trying to get done
          </SectionHeading>
          {jobsCount === 0 ? (
            <EmptyHint text="No jobs captured." />
          ) : (
            <div className="flex flex-col gap-5">
              <JobsGroup
                title="What they need to get done"
                icon={Briefcase}
                iconBg="bg-emerald-800"
                jobs={jobsToBeDone.functional}
                emptyLabel="No functional jobs captured."
              />
              <JobsGroup
                title="How they want to feel"
                icon={Heart}
                iconBg="bg-red-800"
                jobs={jobsToBeDone.emotional}
                emptyLabel="No emotional jobs captured."
              />
              <JobsGroup
                title="How they want to be seen"
                icon={Eye}
                iconBg="bg-blue-900"
                jobs={jobsToBeDone.social}
                emptyLabel="No social jobs captured."
              />
            </div>
          )}
        </ReviewSection>

        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              className="bg-white border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => router.push(`/problems/${problemRef}/edit`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Problem to edit
            </Button>
            <Button onClick={() => router.push(`/problems/${problemRef}/validation/introduction`)}>
              Continue to Problem Validation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
