"use client"

import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { ReflectionCapture } from "@/types/reflection"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDispatch, useSelector, useStore } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { useProblem } from "@/app/(app)/problems/[problemRef]/validation/context"
import { CoreProblemStrategy } from "@/components/problem-strategies/core-problem-strategy"
import { CustomerStrategy } from "@/components/problem-strategies/customer-strategy"
import { RefinementStrategy } from "@/components/problem-strategies/refinement-strategy"
import { SHOW_REFINEMENT_STEPS } from "@/lib/feature-flags"
import { ExistingSolutionsStrategy } from "@/components/problem-strategies/existing-solutions-strategy"
import { ValidationStrategy } from "@/components/problem-strategies/validation-strategy"
import {
  AlertCircle, ArrowRight, CheckCircle2, Compass, Copy, ExternalLink,
  GitFork, HelpCircle, Lightbulb, MessageSquare, RotateCcw, Search, ShieldCheck,
  Users, XCircle, Pencil,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getReflectLens } from "@/data/reflectLenses"
import { MethodTile } from "@/components/method-tile"
import { saveActiveDiscoveryProblemId } from "@/lib/active-discovery-problem"

type SectionTone = "indigo" | "amber" | "purple" | "emerald" | "primary" | "rose" | "tertiary"

const TONE_CLASSES: Record<SectionTone, string> = {
  indigo: "bg-indigo-800",
  amber: "bg-yellow-600",
  purple: "bg-violet-800",
  emerald: "bg-emerald-800",
  primary: "bg-primary",
  rose: "bg-rose-800",
  tertiary: "bg-tertiary",
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
  icon, label, openInStep, children,
}: {
  icon: LucideIcon
  label: string
  /**
   * Retained for backwards compatibility with call sites. Sections are no longer
   * collapsible, so the flag is ignored.
   */
  defaultOpen?: boolean
  openInStep?: string
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <div className="rounded-xl border bg-muted/30 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <IconTile icon={icon} tone="tertiary" size="sm" />
        <h3 className="flex-1 font-semibold text-base">{label}</h3>
        {openInStep && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-sm hover:text-foreground"
            onClick={() => router.push(openInStep)}
          >
            <ExternalLink className="h-3 w-3" />
            Open step
          </Button>
        )}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  )
}

function ReflectionSection({ problemId, readOnly = false }: { problemId: number; readOnly?: boolean }) {
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const reflection = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)?.reflection
  )

  if (!reflection) return null
  const lens = getReflectLens(reflection.lensId)
  if (!lens) return null

  const editablePrompts = lens.prompts.filter(
    (p) => !p.contextOnly && p.role !== "customers"
  )

  function getAnswers(promptId: string): string[] {
    const captured = reflection!.prompts.find((p) => p.promptId === promptId)
    return captured?.answers ?? []
  }

  function commit(promptId: string, nextAnswers: string[]) {
    const current = store.getState().problems.problems.find((p) => p.id === problemId)?.reflection
    if (!current) return
    const others = current.prompts.filter((p) => p.promptId !== promptId)
    const nextPrompts: ReflectionCapture["prompts"] =
      nextAnswers.length > 0
        ? [...others, { promptId, answers: nextAnswers }]
        : others
    dispatch.problems.update({
      id: problemId,
      patch: {
        reflection: {
          ...current,
          prompts: nextPrompts,
        },
      },
    })
  }

  const LensIcon = lens.icon
  return (
    <HubSection icon={MessageSquare} label={`Reflection: ${lens.title}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <MethodTile icon={LensIcon} size="sm" />
          <p className="text-base font-medium flex-1 text-secondary-brand">{lens.title}</p>
        </div>
        <div className="flex flex-col gap-4">
          {editablePrompts.map((prompt) => (
            <ReflectionPromptCard
              key={prompt.id}
              prompt={prompt}
              answers={getAnswers(prompt.id)}
              readOnly={readOnly}
              onChange={(next) => commit(prompt.id, next)}
            />
          ))}
        </div>
      </div>
    </HubSection>
  )
}

function ReflectionPromptCard({
  prompt,
  answers,
  readOnly,
  onChange,
}: {
  prompt: { id: string; question: string; multipleAllowed: boolean; role?: "problems" | "customers" }
  answers: string[]
  readOnly: boolean
  onChange: (next: string[]) => void
}) {
  const slots = answers.length > 0 ? answers : [""]

  function updateSlot(index: number, value: string) {
    const next = [...slots]
    next[index] = value
    onChange(next)
  }

  function addSlot() {
    onChange([...slots, ""])
  }

  function removeSlot(index: number) {
    const next = slots.filter((_, i) => i !== index)
    onChange(next)
  }

  if (readOnly) {
    if (answers.length === 0) return null
    return (
      <div className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3 text-white">
        <p className="text-base font-semibold">{prompt.question}</p>
        <ul className="list-disc pl-5 space-y-1">
          {answers.map((answer, i) => (
            <li key={i} className="text-base leading-relaxed">
              {answer}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-white">{prompt.question}</p>
        {prompt.multipleAllowed && (
          <Button
            type="button"
            size="sm"
            onClick={addSlot}
            className="gap-1.5 shrink-0 bg-white text-foreground hover:bg-white/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another answer
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {slots.map((answer, i) => (
          <div key={i} className="flex items-start gap-2">
            <Textarea
              value={answer}
              onChange={(e) => updateSlot(i, e.target.value)}
              placeholder="Type your answer."
              aria-label={prompt.multipleAllowed ? `Answer ${i + 1}` : "Your answer"}
              className="flex-1 text-base bg-white border-white text-foreground placeholder:text-muted-foreground min-h-[4rem]"
            />
            {prompt.multipleAllowed && slots.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => removeSlot(i)}
                aria-label="Remove this answer"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
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
      defaultOpen={solutions.length > 0}
    >
      {solutions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm">No solutions yet for this problem.</p>
          <Button
            size="sm"
            onClick={() => {
              saveActiveDiscoveryProblemId(problemId)
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
                <span className="text-sm capitalize whitespace-nowrap">
                  {status.replace("_", " ")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => router.push(`/solutions/${s.id}/edit`)}
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

export function NextStepsSection({ problemRef, problemId }: { problemRef: string; problemId: number }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { status } = useProblem()

  const goToExplore = () => router.push(`/problems/${problemRef}/explore/introduction`)
  const goToValidation = () => router.push(`/problems/${problemRef}/validation/market`)
  const goToDiscover = () => {
    saveActiveDiscoveryProblemId(problemId)
    router.push("/solutions/discover/choose-discovery")
  }

  const handleDuplicate = () => {
    const raw = localStorage.getItem("navigate-problems")
    if (!raw) return
    const original = JSON.parse(raw).problems.find((p: { id: number }) => p.id === problemId)
    if (!original) return
    const newProblem = dispatch.problems.create({
      source: original.source,
      title: original.title ?? "",
      description: original.description,
      customers: [...original.customers],
      contexts: [...original.contexts],
      problems: [...original.problems],
      segmentSize: original.segmentSize ?? null,
      customerDescription: original.customerDescription ?? "",
    })
    if (newProblem && typeof newProblem === "object" && "id" in newProblem) {
      router.push(`/problems/${newProblem.id}/edit`)
    }
  }

  return (
    <div className="border-t pt-6">
      <h2 className="text-lg font-semibold flex items-center gap-2.5 mb-2">
        <IconTile icon={ArrowRight} tone="primary" size="sm" />
        Next Steps
      </h2>
      <p className="text-base mb-4">
        Based on your validation verdict, here is what you can do next.
      </p>

      {status === "valid" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={CheckCircle2} tone="emerald" />
            <h3 className="text-lg font-semibold text-foreground">Your problem is valid</h3>
          </div>
          <p className="text-base">
            You have confirmed that this problem is real, painful, and worth pursuing. The next step is to generate and evaluate potential solutions.
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
          <p className="text-base">
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
          <p className="text-base">
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
              title="Revisit your validation"
              description="If new evidence has come in, or you want to reconsider any of your scores, go back to validation and update your verdict."
              actionLabel="Revisit Validation"
              actionIcon={RotateCcw}
              onAction={goToValidation}
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
          <p className="text-base">
            Take a deeper look at the problem, then validate whether it is worth solving.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="self-start" onClick={goToExplore}>
              <Compass className="h-4 w-4 mr-2" />
              Explore the Problem
            </Button>
            <Button variant="outline" className="self-start" onClick={goToValidation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Go to Validation
            </Button>
          </div>
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
  const { problemRef, problemId } = useProblem()
  const exploreBase = `/problems/${problemRef}/explore`
  const validationBase = `/problems/${problemRef}/validation`
  // Customer, refinement, and existing-solutions are captured in the Explore
  // the Problem flow; the validation assessment is captured in Problem
  // Validation. Each "Open step" link points to wherever that step now lives.
  const exploreHref = (suffix: string) => readOnly ? undefined : `${exploreBase}/${suffix}`
  const validationHref = (suffix: string) => readOnly ? undefined : `${validationBase}/${suffix}`

  return (
    <div className={cn("flex flex-col gap-4", mode === "page" && "gap-6")}>
      <HubSection icon={AlertCircle} label="Core Problem">
        <CoreProblemStrategy readOnly={readOnly} />
      </HubSection>

      <ReflectionSection problemId={problemId} readOnly={readOnly} />

      <HubSection icon={Users} label="Customer" openInStep={exploreHref("customer")}>
        <CustomerStrategy readOnly={readOnly} />
      </HubSection>

      {SHOW_REFINEMENT_STEPS && (
        <HubSection
          icon={Search}
          label="Refinement"
          openInStep={exploreHref("choose-refinement")}
        >
          <RefinementStrategy showChooser readOnly={readOnly} />
        </HubSection>
      )}

      <HubSection
        icon={GitFork}
        label="Existing Solutions, Shortcomings & Impacts"
        openInStep={exploreHref("existing-solutions")}
      >
        <ExistingSolutionsStrategy readOnly={readOnly} />
      </HubSection>

      <HubSection
        icon={ShieldCheck}
        label="Validation Assessment"
        openInStep={validationHref("market")}
      >
        <ValidationStrategy readOnly={readOnly} />
      </HubSection>

      <SolutionsSection problemId={problemId} />

      <NextStepsSection problemRef={problemRef} problemId={problemId} />

      {mode === "page" && !readOnly && (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <Link href={`${exploreBase}/introduction`}>
              <Compass className="h-4 w-4 mr-2" />
              Walk through the problem deep dive
            </Link>
          </Button>
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
