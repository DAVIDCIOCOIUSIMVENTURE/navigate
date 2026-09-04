"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useSolution } from "@/app/(app)/solutions/[solutionId]/validate/context"
import { CoreSolutionStrategy } from "@/components/solution-strategies/core-solution-strategy"
import { MetricStrategy } from "@/components/solution-strategies/metric-strategy"
import { VerdictStrategy } from "@/components/solution-strategies/verdict-strategy"
import {
  FEASIBILITY_CONTENT,
  IMPACT_CONTENT,
  COST_CONTENT,
  TIME_CONTENT,
} from "@/components/solution-strategies/metric-content"
import {
  ArrowRight, ChevronDown, CheckCircle2, ExternalLink, HelpCircle, Lightbulb,
  Pencil, RotateCcw, Target, XCircle, Copy,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionTone = "primary" | "indigo" | "amber" | "emerald" | "purple" | "rose" | "muted"

const TONE_CLASSES: Record<SectionTone, string> = {
  primary: "bg-primary",
  indigo: "bg-indigo-800",
  amber: "bg-yellow-600",
  emerald: "bg-emerald-800",
  purple: "bg-violet-800",
  rose: "bg-rose-800",
  muted: "bg-muted-foreground/70",
}

function IconTile({ icon: Icon, tone, size = "md" }: { icon: LucideIcon; tone: SectionTone; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-9 w-9"
  const icon = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
  return (
    <span className={cn("flex items-center justify-center rounded-lg shrink-0 text-white", dims, TONE_CLASSES[tone])} aria-hidden="true">
      <Icon className={icon} />
    </span>
  )
}

function HubSection({
  icon, label, tone, defaultOpen = true, openInStep, children,
}: {
  icon: LucideIcon
  label: string
  tone: SectionTone
  defaultOpen?: boolean
  openInStep?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const router = useRouter()

  return (
    <div className="rounded-xl border bg-muted/30 overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-3 p-4">
          <CollapsibleTrigger className="flex flex-1 items-center gap-2.5 text-left">
            <IconTile icon={icon} tone={tone} size="sm" />
            <h3 className="flex-1 font-semibold text-base">{label}</h3>
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          {openInStep && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-sm hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                router.push(openInStep)
              }}
            >
              <ExternalLink className="h-3 w-3" />
              Open step
            </Button>
          )}
        </div>
        <CollapsibleContent>
          <div className="px-4 pb-4">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function LinkedProblemSection({ problemId, problemTitle, problemDescription }: { problemId: number | null; problemTitle: string | null; problemDescription: string | null }) {
  return (
    <HubSection icon={Target} label="Linked Problem" tone="amber">
      {problemId == null ? (
        <p className="text-base italic">This solution is not linked to a problem.</p>
      ) : (
        <div className="flex items-start gap-3 rounded-md border bg-background p-3">
          <Target className="h-4 w-4 text-tertiary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <p className="text-base font-medium">
              {problemTitle || `Problem #${problemId}`}
            </p>
            {problemDescription && (
              <p className="text-base">{problemDescription}</p>
            )}
          </div>
          <Button asChild variant="outline" size="sm" className="h-7 gap-1 text-base bg-white border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand shrink-0">
            <Link href={`/problems/${problemId}/edit`}>
              <ExternalLink className="h-3 w-3" />
              Open Problem
            </Link>
          </Button>
        </div>
      )}
    </HubSection>
  )
}

export function NextStepsSection({ solutionId }: { solutionId: number }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { validationStatus, solution } = useSolution()

  const goToVerdict = () => router.push(`/solutions/${solutionId}/validate/verdict`)

  const handleDuplicate = () => {
    if (!solution) return
    const newSolution = dispatch.solutions.create({
      problemId: solution.problemId,
      workspaceId: solution.workspaceId,
      title: solution.title,
      description: solution.description,
      inspirationSource: solution.inspirationSource,
      inspirationDetail: solution.inspirationDetail,
      analogyDomain: solution.analogyDomain,
      analogyInsight: solution.analogyInsight,
      scamperIdeas: solution.scamperIdeas,
      improveIdeas: solution.improveIdeas,
      reverseWorseIdeas: solution.reverseWorseIdeas,
      reverseInversions: solution.reverseInversions,
    })
    if (newSolution && typeof newSolution === "object" && "id" in newSolution) {
      router.push(`/solutions/${newSolution.id}/edit`)
    }
  }

  return (
    <div className="border-t pt-6">
      <h2 className="text-lg font-semibold flex items-center gap-2.5 mb-2">
        <IconTile icon={ArrowRight} tone="primary" size="sm" />
        Next Steps
      </h2>
      <p className="text-base mb-4">
        Based on your verdict, here is what you can do next.
      </p>

      {validationStatus === "valid" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={CheckCircle2} tone="emerald" />
            <h3 className="text-lg font-semibold text-foreground">This solution is worth pursuing</h3>
          </div>
          <p className="text-base">
            You have decided this solution is worth building. The next step is to plan delivery: scope a first version, decide on the team, and break the work into milestones.
          </p>
          <Button className="self-start" onClick={() => router.push("/next-steps")}>
            <ArrowRight className="h-4 w-4 mr-2" />
            See Next Steps Guidance
          </Button>
        </div>
      )}

      {validationStatus === "unsure" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={HelpCircle} tone="amber" />
            <h3 className="text-lg font-semibold text-foreground">You need more evidence</h3>
          </div>
          <p className="text-base">
            Mixed scores are common. Identify the assumption that would tip the verdict, run a small experiment to test it, and revisit your scoring once you know more.
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <NextStepCard
              icon={RotateCcw}
              title="Revisit your verdict"
              description="Adjust scores or notes once new evidence comes in."
              actionLabel="Revisit Verdict"
              actionIcon={RotateCcw}
              onAction={goToVerdict}
            />
            <NextStepCard
              icon={Copy}
              title="Duplicate and try a different angle"
              description="Create a copy with the same title and description so you can rescore from a different lens."
              actionLabel="Duplicate &amp; Start Again"
              actionIcon={Copy}
              onAction={handleDuplicate}
            />
          </div>
        </div>
      )}

      {validationStatus === "invalid" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={XCircle} tone="rose" />
            <h3 className="text-lg font-semibold text-foreground">This solution is not worth pursuing</h3>
          </div>
          <p className="text-base">
            That is a useful answer too. Move on to a stronger candidate, or revisit the linked problem to refresh your thinking.
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <NextStepCard
              icon={Lightbulb}
              title="Pick another solution"
              description="Go back to your solutions list and try a different candidate."
              actionLabel="Back to Solutions"
              actionIcon={ArrowRight}
              onAction={() => router.push("/solutions")}
            />
          </div>
        </div>
      )}

      {(validationStatus === "unvalidated" || validationStatus === "in_progress") && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={HelpCircle} tone="muted" />
            <h3 className="text-lg font-semibold text-foreground">No verdict yet</h3>
          </div>
          <p className="text-base">
            Score the four metrics above, then record your verdict to see your next steps.
          </p>
          <Button className="self-start" onClick={goToVerdict}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Go to Verdict
          </Button>
        </div>
      )}
    </div>
  )
}

function NextStepCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  actionIcon: LucideIcon
  onAction: () => void
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {title}
      </h4>
      <p className="text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      <Button size="sm" className="self-start mt-1" onClick={onAction}>
        <ActionIcon className="h-4 w-4 mr-2" />
        <span dangerouslySetInnerHTML={{ __html: actionLabel }} />
      </Button>
    </div>
  )
}

/**
 * Hub view of a solution: title/description, linked problem, the four
 * metric scores, verdict, and next steps. Reuses the same strategy
 * components as the validation step pages so the editor and the read-only
 * summary view share identical UI.
 */
export function SolutionHubContent({
  mode,
  readOnly = false,
}: {
  mode: "dialog" | "page"
  readOnly?: boolean
}) {
  const {
    solutionId, solution, problem,
    feasibility, setFeasibility,
    impact, setImpact,
    cost, setCost,
    timeToImplement, setTimeToImplement,
  } = useSolution()

  if (!solution) return null

  const validationBase = `/solutions/${solutionId}/validate`
  const stepHref = (suffix: string) => readOnly ? undefined : `${validationBase}/${suffix}`

  return (
    <div className={cn("flex flex-col gap-4", mode === "page" && "gap-6")}>
      <HubSection icon={Lightbulb} label="Solution" tone="primary">
        <CoreSolutionStrategy readOnly={readOnly} />
      </HubSection>

      <LinkedProblemSection
        problemId={problem?.id ?? null}
        problemTitle={problem?.title ?? null}
        problemDescription={problem?.description ?? null}
      />

      <HubSection
        icon={FEASIBILITY_CONTENT.icon}
        label="Feasibility"
        tone="indigo"
        openInStep={stepHref("feasibility")}
      >
        <MetricStrategy
          icon={FEASIBILITY_CONTENT.icon}
          strategyTitle={FEASIBILITY_CONTENT.strategyTitle}
          strategyLabel={FEASIBILITY_CONTENT.strategyLabel}
          strategyDescription={FEASIBILITY_CONTENT.strategyDescription}
          scale={FEASIBILITY_CONTENT.scale}
          value={feasibility}
          onChange={setFeasibility}
          accent={FEASIBILITY_CONTENT.accent}
          readOnly={readOnly}
        />
      </HubSection>

      <HubSection
        icon={IMPACT_CONTENT.icon}
        label="Impact"
        tone="emerald"
        openInStep={stepHref("impact")}
      >
        <MetricStrategy
          icon={IMPACT_CONTENT.icon}
          strategyTitle={IMPACT_CONTENT.strategyTitle}
          strategyLabel={IMPACT_CONTENT.strategyLabel}
          strategyDescription={IMPACT_CONTENT.strategyDescription}
          scale={IMPACT_CONTENT.scale}
          value={impact}
          onChange={setImpact}
          accent={IMPACT_CONTENT.accent}
          readOnly={readOnly}
        />
      </HubSection>

      <HubSection
        icon={COST_CONTENT.icon}
        label="Cost"
        tone="amber"
        openInStep={stepHref("cost")}
      >
        <MetricStrategy
          icon={COST_CONTENT.icon}
          strategyTitle={COST_CONTENT.strategyTitle}
          strategyLabel={COST_CONTENT.strategyLabel}
          strategyDescription={COST_CONTENT.strategyDescription}
          scale={COST_CONTENT.scale}
          value={cost}
          onChange={setCost}
          accent={COST_CONTENT.accent}
          readOnly={readOnly}
        />
      </HubSection>

      <HubSection
        icon={TIME_CONTENT.icon}
        label="Time to Implement"
        tone="purple"
        openInStep={stepHref("time-to-implement")}
      >
        <MetricStrategy
          icon={TIME_CONTENT.icon}
          strategyTitle={TIME_CONTENT.strategyTitle}
          strategyLabel={TIME_CONTENT.strategyLabel}
          strategyDescription={TIME_CONTENT.strategyDescription}
          scale={TIME_CONTENT.scale}
          value={timeToImplement}
          onChange={setTimeToImplement}
          accent={TIME_CONTENT.accent}
          readOnly={readOnly}
        />
      </HubSection>

      <HubSection
        icon={CheckCircle2}
        label="Verdict"
        tone="rose"
        openInStep={stepHref("verdict")}
      >
        <VerdictStrategy readOnly={readOnly} />
      </HubSection>

      <NextStepsSection solutionId={solutionId} />

      {mode === "page" && !readOnly && (
        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" asChild>
            <Link href={`${validationBase}/introduction`}>
              <Pencil className="h-4 w-4 mr-2" />
              Walk through validation steps
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
