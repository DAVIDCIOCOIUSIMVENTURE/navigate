"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useProblemValidation } from "@/app/(app)/problems/[problemRef]/validation/context"
import { CoreProblemStrategy } from "@/components/problem-strategies/core-problem-strategy"
import { CustomerStrategy } from "@/components/problem-strategies/customer-strategy"
import { RefinementStrategy } from "@/components/problem-strategies/refinement-strategy"
import { ExistingSolutionsStrategy } from "@/components/problem-strategies/existing-solutions-strategy"
import { ValidationStrategy } from "@/components/problem-strategies/validation-strategy"
import {
  AlertCircle, ArrowRight, ChevronDown, CheckCircle2, Copy, ExternalLink,
  GitFork, HelpCircle, Lightbulb, RotateCcw, Search, ShieldCheck,
  Users, XCircle, Pencil, Eye,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionTone = "indigo" | "amber" | "purple" | "emerald" | "primary" | "rose"

const TONE_CLASSES: Record<SectionTone, string> = {
  indigo: "bg-indigo-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  primary: "bg-primary",
  rose: "bg-rose-500",
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
            <h3 className="flex-1 font-semibold text-md">{label}</h3>
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          {openInStep && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
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

function SolutionsSection({ problemId }: { problemId: number }) {
  const router = useRouter()
  const solutions = useSelector((state: RootState) =>
    state.solutions.solutions.filter((s) => s.problemId === problemId)
  )

  return (
    <HubSection
      icon={Lightbulb}
      label={`Solutions (${solutions.length})`}
      tone="rose"
      defaultOpen={solutions.length > 0}
    >
      {solutions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">No solutions yet for this problem.</p>
          <Button
            size="sm"
            onClick={() => {
              try {
                localStorage.setItem("navigate-active-discovery-problem", String(problemId))
              } catch { /* ignore */ }
              router.push("/solutions/discover/choose-discovery")
            }}
          >
            <Lightbulb className="h-3.5 w-3.5 mr-1" />
            Discover solutions
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {solutions.map((s) => {
            const label = s.title || `Solution #${s.id}`
            const status = s.validationStatus ?? "unvalidated"
            return (
              <li key={s.id} className="flex items-center gap-2 rounded-md bg-background border px-3 py-2">
                <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="flex-1 min-w-0 text-sm truncate">{label}</span>
                <span className="text-xs text-muted-foreground capitalize whitespace-nowrap">
                  {status.replace("_", " ")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => router.push(`/solutions/${s.id}`)}
                  aria-label="Open solution"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </HubSection>
  )
}

function NextStepsSection({ problemRef, problemId }: { problemRef: string; problemId: number }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { status } = useProblemValidation()

  const goToValidation = () => router.push(`/problems/${problemRef}/validation/validate`)
  const goToDiscover = () => {
    try {
      localStorage.setItem("navigate-active-discovery-problem", String(problemRef))
    } catch { /* ignore */ }
    router.push("/solutions/discover/choose-discovery")
  }

  const handleDuplicate = () => {
    const raw = localStorage.getItem("navigate-problems")
    if (!raw) return
    const original = JSON.parse(raw).problems.find((p: { id: number }) => p.id === problemId)
    if (!original) return
    const newProblem = dispatch.problems.create({
      source: original.source,
      description: original.description,
      customers: [...original.customers],
      contexts: [...original.contexts],
      problems: [...original.problems],
      segmentSize: original.segmentSize ?? null,
      customerDescription: original.customerDescription ?? "",
    })
    if (newProblem && typeof newProblem === "object" && "id" in newProblem) {
      router.push(`/problems/${newProblem.id}`)
    }
  }

  return (
    <div className="border-t pt-6">
      <h2 className="text-lg font-semibold flex items-center gap-2.5 mb-2">
        <IconTile icon={ArrowRight} tone="primary" size="sm" />
        Next Steps
      </h2>
      <p className="text-md text-muted-foreground mb-4">
        Based on your validation verdict, here is what you can do next.
      </p>

      {status === "valid" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={CheckCircle2} tone="emerald" />
            <h3 className="text-lg font-semibold text-foreground">Your problem is valid</h3>
          </div>
          <p className="text-md text-muted-foreground">
            You have confirmed that this problem is real, painful, and worth pursuing. The next step is to brainstorm and evaluate potential solutions.
          </p>
          <Button className="self-start" onClick={goToDiscover}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Continue to Solution Discovery
          </Button>
        </div>
      )}

      {status === "unsure" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={HelpCircle} tone="amber" />
            <h3 className="text-lg font-semibold text-foreground">You are unsure about this problem</h3>
          </div>
          <p className="text-md text-muted-foreground">
            Uncertainty is normal at this stage. It usually means you need more information before you can confidently commit to solving this problem.
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <NextStepCard
              icon={Lightbulb}
              title="Continue to solution discovery"
              description="Exploring possible solutions can sometimes sharpen your view of the problem itself."
              actionLabel="Continue to Solution Discovery"
              actionIcon={Lightbulb}
              onAction={goToDiscover}
            />
            <NextStepCard
              icon={Copy}
              title="Duplicate and start again"
              description="Create a fresh copy of your problem with the description and customer intact, but the validation cleared so you can approach it from a new angle."
              actionLabel="Duplicate &amp; Start Again"
              actionIcon={Copy}
              onAction={handleDuplicate}
            />
            <NextStepCard
              icon={RotateCcw}
              title="Revisit your validation"
              description="Go back to the validation step and review your scores. Adjusting even one factor can shift the overall picture."
              actionLabel="Revisit Validation"
              actionIcon={RotateCcw}
              onAction={goToValidation}
            />
          </div>
        </div>
      )}

      {status === "invalid" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={XCircle} tone="rose" />
            <h3 className="text-lg font-semibold text-foreground">This problem is not valid</h3>
          </div>
          <p className="text-md text-muted-foreground">
            Your validation suggests this problem is not worth solving in its current form. That does not mean the underlying idea is bad. Often, a problem becomes valid when you look at it through a different lens.
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <NextStepCard
              icon={Copy}
              title="Duplicate and try a different angle"
              description="Create a fresh copy of your problem with the description and customer intact, validation cleared."
              actionLabel="Duplicate &amp; Start Again"
              actionIcon={Copy}
              onAction={handleDuplicate}
            />
            <NextStepCard
              icon={RotateCcw}
              title="Move on to a different problem"
              description="Go back to your problem list and pick another problem to validate. Ruling out a problem is still progress."
              actionLabel="Back to Problems"
              actionIcon={ArrowRight}
              onAction={() => router.push("/problems")}
            />
          </div>
        </div>
      )}

      {(status === "unvalidated" || status === "in_progress") && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={HelpCircle} tone="primary" />
            <h3 className="text-lg font-semibold text-foreground">No verdict yet</h3>
          </div>
          <p className="text-md text-muted-foreground">
            Complete the validation step to see your next steps.
          </p>
          <Button className="self-start" onClick={goToValidation}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Go to Validation
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
      <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: description }} />
      <Button size="sm" className="self-start mt-1" onClick={onAction}>
        <ActionIcon className="h-4 w-4 mr-2" />
        <span dangerouslySetInnerHTML={{ __html: actionLabel }} />
      </Button>
    </div>
  )
}

/**
 * Hub view of a problem: description, customer, refinement, existing
 * solutions, validation, linked solutions, and next steps. All sections render
 * the same strategy components used by the validation step pages, so the
 * editor and the summary view share identical UI.
 *
 * - `mode: "dialog" | "page"` controls outer chrome (a small header link to
 *   the full page in dialog mode; a "walk through validation" footer in page
 *   mode).
 * - `readOnly` switches every strategy into a non-editable display, used by
 *   the validation summary step where the user is reviewing what they
 *   captured. In readOnly mode, "Open step" links are also hidden because the
 *   summary already has its own next-steps actions.
 */
export function ProblemHubContent({
  mode,
  readOnly = false,
}: {
  mode: "dialog" | "page"
  readOnly?: boolean
}) {
  const { problemRef, problemId } = useProblemValidation()
  const validationBase = `/problems/${problemRef}/validation`
  const stepHref = (suffix: string) => readOnly ? undefined : `${validationBase}/${suffix}`

  return (
    <div className={cn("flex flex-col gap-4", mode === "page" && "gap-6")}>
      {mode === "dialog" && (
        <Link
          href={`/problems/${problemRef}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground self-start"
        >
          <ExternalLink className="h-3 w-3" />
          Open as full page
        </Link>
      )}

      <HubSection icon={AlertCircle} label="Core Problem" tone="amber">
        <CoreProblemStrategy readOnly={readOnly} />
      </HubSection>

      <HubSection icon={Users} label="Customer" tone="indigo" openInStep={stepHref("customer")}>
        <CustomerStrategy readOnly={readOnly} />
      </HubSection>

      <HubSection
        icon={Search}
        label="Refinement"
        tone="purple"
        openInStep={stepHref("choose-refinement")}
      >
        <RefinementStrategy showChooser readOnly={readOnly} />
      </HubSection>

      <HubSection
        icon={GitFork}
        label="Existing Solutions, Shortcomings & Impacts"
        tone="purple"
        openInStep={stepHref("existing-solutions")}
      >
        <ExistingSolutionsStrategy readOnly={readOnly} />
      </HubSection>

      <HubSection
        icon={ShieldCheck}
        label="Validation Assessment"
        tone="emerald"
        openInStep={stepHref("validate")}
      >
        <ValidationStrategy readOnly={readOnly} />
      </HubSection>

      <SolutionsSection problemId={problemId} />

      <NextStepsSection problemRef={problemRef} problemId={problemId} />

      {mode === "dialog" && (
        <div className="flex justify-end border-t pt-4">
          <Button asChild>
            <Link href={`/problems/${problemRef}`}>
              <Eye className="h-4 w-4 mr-2" />
              Open full page
            </Link>
          </Button>
        </div>
      )}

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
