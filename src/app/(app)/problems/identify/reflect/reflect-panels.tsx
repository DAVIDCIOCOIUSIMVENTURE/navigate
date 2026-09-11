"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContainerSize } from "@/context/container-size-context"
import {
  REFLECT_LENSES,
  LENS_CONTEXT_FIELDS,
  getAnchorPromptId,
  type Lens,
  type LensId,
} from "@/data/reflectLenses"
import { MethodPickerBoard, type MethodPickerItem } from "@/components/method-picker-board"
import { MethodTile } from "@/components/method-tile"
import { useReflect } from "@/components/reflect/reflect-context"
import { LifeExperiencesPicker } from "@/components/reflect/life-experiences-picker"
import { WorkContextPicker } from "@/components/reflect/work-context-picker"
import { OwnProblemsPicker } from "@/components/reflect/own-problems-picker"
import { AudiencePicker } from "@/components/reflect/audience-picker"
import { IdentifyDimensionPicker } from "@/components/reflect/identify-dimension-picker"
import { useResolveOrCreate } from "@/lib/dimension-labels"
import { ProblemSavedDialog } from "@/components/problem-saved-dialog"
import type { ReflectionCapture } from "@/types/reflection"

/*
 * Step content panels for the Reflect identify flow. Each panel is rendered by
 * its own route page (see ./routes.ts); the shared shell, stepper and store
 * sync live in ./layout.tsx.
 */

const ENABLED_LENS_IDS = new Set<LensId>([
  "life",
  "work",
  "own-problems",
  "audience-problems",
])

function getRolePromptId(lens: Lens, role: "problems" | "customers"): string | null {
  return lens.prompts.find((p) => p.role === role)?.id ?? null
}

const PICK_GUIDANCE = {
  title: "Pick a method",
  description:
    "Each method is a different angle on where problems come from. Pick one to run through guided prompts and turn your answers into a problem in your problems.",
  tips: [] as string[],
}

function GuidancePanel({
  title,
  description,
  tips,
  className,
  stepNumber,
}: {
  title: string
  description: string
  tips: string[]
  className?: string
  stepNumber?: number
}) {
  return (
    <div className={cn("flex flex-col gap-8 text-base", className)}>
      <h2 className="flex items-center gap-2.5 text-2xl font-bold leading-none tracking-tight text-primary">
        {stepNumber !== undefined && (
          <span
            className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary text-primary-foreground text-lg font-bold"
            aria-hidden="true"
          >
            {stepNumber}
          </span>
        )}
        <span>{title}</span>
      </h2>
      <p className="leading-relaxed">{description}</p>
      {tips.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="text-tertiary mt-0.5 shrink-0">&#8226;</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ─── Step content panels ─── */

export function PickMethodPanel({
  onPick,
  selectedLensId,
}: {
  onPick: (lensId: LensId) => void
  selectedLensId: LensId | null
}) {
  const items: MethodPickerItem[] = REFLECT_LENSES.map((lens) => ({
    id: lens.id,
    title: lens.title,
    shortDescription: lens.shortDescription,
    longDescription: lens.longDescription,
    helperText: lens.helperText,
    icon: lens.icon,
    image: lens.image,
    estimatedMinutes: lens.estimatedMinutes,
    enabled: ENABLED_LENS_IDS.has(lens.id),
  }))

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto">
      <GuidancePanel {...PICK_GUIDANCE} stepNumber={1} />
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold">Discovery methods</h3>
        <MethodPickerBoard
          items={items}
          selectedId={selectedLensId}
          onPick={(id) => onPick(id as LensId)}
        />
      </div>
    </div>
  )
}

export function PromptsPanel({
  index,
  onIndexChange,
  onBackToPick,
  onReview,
}: {
  index: number
  onIndexChange: (next: number) => void
  onBackToPick: () => void
  onReview: () => void
}) {
  const {
    lens,
    answers,
    setAnswerText,
    setAnswerContext,
    addAnswerSlot,
    removeAnswerSlot,
    setAnswerSlots,
  } = useReflect()
  const isNarrow = useContainerSize() === "narrow"
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const prompt = lens.prompts[index]
  const total = lens.prompts.length
  const isLast = index === total - 1
  const promptAnswers = useMemo(
    () => answers[prompt.id] ?? [{ text: "", context: {} }],
    [answers, prompt.id]
  )

  const useLifeExperiencesPicker =
    lens.id === "life" && prompt.id === "significant-experience"
  const useWorkContextPicker =
    lens.id === "work" && prompt.id === "work-context"
  const useOwnProblemsPicker =
    lens.id === "own-problems" && prompt.id === "own-anchor"
  const useAudiencePicker =
    lens.id === "audience-problems" && prompt.id === "audience-anchor"
  const useAnchorPicker =
    useLifeExperiencesPicker ||
    useWorkContextPicker ||
    useOwnProblemsPicker ||
    useAudiencePicker

  const dimensionPickerColumn: "problems" | "customers" | null =
    prompt.role === "problems"
      ? "problems"
      : prompt.role === "customers"
        ? "customers"
        : null

  const selectedDimensionLabels = useMemo(() => {
    if (!dimensionPickerColumn) return [] as string[]
    return promptAnswers
      .map((a) => a.text.trim())
      .filter((t) => t.length > 0)
  }, [dimensionPickerColumn, promptAnswers])

  function handleDimensionChange(next: string[]) {
    const byLabel = new Map<string, (typeof promptAnswers)[number]>()
    for (const a of promptAnswers) {
      const key = a.text.trim().toLowerCase()
      if (key.length > 0 && !byLabel.has(key)) byLabel.set(key, a)
    }
    const slots = next.map((label) => {
      const existing = byLabel.get(label.trim().toLowerCase())
      return existing
        ? { ...existing, text: label.trim() }
        : { text: label.trim(), context: {} }
    })
    setAnswerSlots(prompt.id, slots)
  }

  const selectedAnchorId = useMemo(() => {
    if (!useAnchorPicker) return null
    const id = promptAnswers[0]?.context?.anchorItemId
    return id && id.length > 0 ? id : null
  }, [useAnchorPicker, promptAnswers])

  function handleSelectAnchor(id: string | null, label: string | null) {
    setAnswerText(prompt.id, 0, label ?? "")
    setAnswerContext(prompt.id, 0, "anchorItemId", id ?? "")
  }

  function goPrev() {
    if (index > 0) onIndexChange(index - 1)
    else onBackToPick()
  }

  function goNext() {
    if (isLast) onReview()
    else onIndexChange(index + 1)
  }

  const Icon = lens.icon

  const rightColumn = (
    <div className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-4 min-h-0 max-h-full w-full">
      <div className="flex items-start justify-between gap-3 shrink-0">
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-lg font-bold leading-snug text-white">{prompt.question}</p>
          {prompt.helperText && (
            <p className="text-base leading-snug text-white/90">{prompt.helperText}</p>
          )}
        </div>
        {useAnchorPicker || dimensionPickerColumn ? (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="gap-1.5 bg-white text-foreground hover:bg-white/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add your own
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="gap-1.5 bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="font-semibold">Edit</span>
            </Button>
          </div>
        ) : null}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">

      {useLifeExperiencesPicker ? (
        <LifeExperiencesPicker
          selectedId={selectedAnchorId}
          onSelect={handleSelectAnchor}
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
          editDialogOpen={editDialogOpen}
          onEditDialogOpenChange={setEditDialogOpen}
        />
      ) : useWorkContextPicker ? (
        <WorkContextPicker
          selectedId={selectedAnchorId}
          onSelect={handleSelectAnchor}
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
          editDialogOpen={editDialogOpen}
          onEditDialogOpenChange={setEditDialogOpen}
        />
      ) : useOwnProblemsPicker ? (
        <OwnProblemsPicker
          selectedId={selectedAnchorId}
          onSelect={handleSelectAnchor}
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
          editDialogOpen={editDialogOpen}
          onEditDialogOpenChange={setEditDialogOpen}
        />
      ) : useAudiencePicker ? (
        <AudiencePicker
          selectedId={selectedAnchorId}
          onSelect={handleSelectAnchor}
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
          editDialogOpen={editDialogOpen}
          onEditDialogOpenChange={setEditDialogOpen}
        />
      ) : dimensionPickerColumn ? (
        <IdentifyDimensionPicker
          columnId={dimensionPickerColumn}
          selectedLabels={selectedDimensionLabels}
          onChange={handleDimensionChange}
          addPlaceholder={
            prompt.examples && prompt.examples.length > 0
              ? `e.g. ${prompt.examples[0]}`
              : dimensionPickerColumn === "problems"
                ? "e.g. School pickup logistics, finding a trusted plumber"
                : "e.g. First-time freelancers, parents of teenagers"
          }
          ariaLabel={
            dimensionPickerColumn === "problems"
              ? "Pick one or more problem types"
              : "Pick one or more customer segments"
          }
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
          editDialogOpen={editDialogOpen}
          onEditDialogOpenChange={setEditDialogOpen}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {promptAnswers.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <Textarea
                value={a.text}
                onChange={(e) => setAnswerText(prompt.id, i, e.target.value)}
                placeholder="Type your answer."
                aria-label={
                  prompt.multipleAllowed ? `Answer ${i + 1}` : "Your answer"
                }
                className={cn(
                  "flex-1 text-base bg-white border-white text-foreground placeholder:text-muted-foreground",
                  isNarrow ? "min-h-[7rem]" : "min-h-[5rem]"
                )}
              />
              {prompt.multipleAllowed && promptAnswers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeAnswerSlot(prompt.id, i)}
                  aria-label="Remove this answer"
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {prompt.multipleAllowed && (
            <Button
              type="button"
              variant="outline"
              onClick={() => addAnswerSlot(prompt.id)}
              className="w-full gap-1.5 bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another answer
            </Button>
          )}
        </div>
      )}
      </div>
    </div>
  )

  const headerRow = (
    <div className="flex items-center gap-2.5">
      <MethodTile icon={Icon} size="lg" />
      <h2 className="text-2xl font-bold leading-none tracking-tight text-secondary-brand">{lens.title}</h2>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      <div className="shrink-0">{headerRow}</div>
      <div className="flex-1 min-h-0 flex flex-col">{rightColumn}</div>

      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <Button
          variant="outline"
          onClick={goPrev}
          className="gap-2 bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={goNext} className="gap-2">
          {isLast ? "Review" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ReviewPanel({
  onBack,
  onJumpToPrompt,
  onKeepIdentifying,
}: {
  onBack: () => void
  onJumpToPrompt: (promptId: string) => void
  onKeepIdentifying: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const resolveOrCreate = useResolveOrCreate()
  const {
    lens,
    answers,
    setAnswerText,
    setAnswerContext,
    removeAnswerSlot,
    clearSession,
  } = useReflect()
  const [saving, setSaving] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [nextStepDialogOpen, setNextStepDialogOpen] = useState(false)
  const [lastSavedProblemId, setLastSavedProblemId] = useState<number | null>(null)

  const anchorPromptId = useMemo(() => getAnchorPromptId(lens), [lens])
  const problemsPromptId = useMemo(() => getRolePromptId(lens, "problems"), [lens])
  const customersPromptId = useMemo(() => getRolePromptId(lens, "customers"), [lens])
  const candidatePrompts = lens.prompts.filter((p) => !p.contextOnly)
  const hasAnchorFlow = anchorPromptId !== null
  const anchorLabel = lens.anchorLabel ?? "Anchor"

  const filledAnswers = candidatePrompts.reduce((sum, p) => {
    return sum + (answers[p.id] ?? []).filter((a) => a.text.trim().length > 0).length
  }, 0)

  const anchorValue = hasAnchorFlow
    ? (answers[anchorPromptId!]?.[0]?.text ?? "").trim()
    : ""
  const hasCandidate = hasAnchorFlow && anchorValue.length > 0 && filledAnswers > 0
  const totalKept = hasAnchorFlow ? (hasCandidate ? 1 : 0) : filledAnswers

  const filledLabels = useMemo(() => {
    function labels(promptId: string | null): string[] {
      if (!promptId) return []
      return (answers[promptId] ?? []).map((a) => a.text.trim()).filter((t) => t.length > 0)
    }
    return {
      problems: labels(problemsPromptId),
      customers: labels(customersPromptId),
    }
  }, [answers, problemsPromptId, customersPromptId])

  function openSaveDialog() {
    setDialogTitle(anchorValue)
    setSaveDialogOpen(true)
  }

  async function handleSaveAsProblem() {
    if (!hasAnchorFlow || !hasCandidate) return
    const trimmedTitle = dialogTitle.trim()
    if (trimmedTitle.length === 0) return
    setSaving(true)
    try {
      const customerIds = filledLabels.customers
        .map((label) => resolveOrCreate("customers", label))
        .filter((id) => id.length > 0)
      const problemIds = filledLabels.problems
        .map((label) => resolveOrCreate("problems", label))
        .filter((id) => id.length > 0)

      const reflection: ReflectionCapture = {
        lensId: lens.id,
        capturedAt: new Date().toISOString(),
        prompts: lens.prompts
          .map((p) => ({
            promptId: p.id,
            answers: (answers[p.id] ?? [])
              .map((a) => a.text.trim())
              .filter((t) => t.length > 0),
          }))
          .filter((p) => p.answers.length > 0),
      }

      const newProblem = await dispatch.problems.create({
        source: "identify",
        title: trimmedTitle,
        customers: customerIds,
        contexts: [],
        problems: problemIds,
        you: [],
        reflection,
      })
      clearSession()
      setSaveDialogOpen(false)
      setLastSavedProblemId(newProblem.id)
      setNextStepDialogOpen(true)
    } finally {
      setSaving(false)
    }
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

  if (!hasAnchorFlow) {
    return (
      <div className="flex flex-col gap-6 w-full flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary" aria-hidden="true">
            <ClipboardCheck className="h-5 w-5 text-primary-foreground [stroke-width:2.5]" />
          </div>
          <h2 className="text-2xl font-bold leading-none tracking-tight text-primary">Review your answers</h2>
        </div>
        <p className="text-base leading-relaxed">
          Saving as a problem isn&apos;t wired up for this method yet.
        </p>
        <div>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to prompts
          </Button>
        </div>
      </div>
    )
  }

  const problemsPrompt = candidatePrompts.find((p) => p.id === problemsPromptId)
  const customerPrompt = candidatePrompts.find((p) => p.id === customersPromptId)
  const otherPrompts = candidatePrompts.filter(
    (p) => p.id !== problemsPromptId && p.id !== customersPromptId
  )
  const AnchorIcon = lens.icon

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary" aria-hidden="true">
          <ClipboardCheck className="h-5 w-5 text-primary-foreground [stroke-width:2.5]" />
        </div>
        <h2 className="text-2xl font-bold leading-none tracking-tight text-primary">Review your answers</h2>
      </div>
      <p className="text-base leading-relaxed">
        {hasCandidate ? (
          <>
            Your answers will be saved as <span className="font-semibold">one problem</span> in your
            problems. Click any heading below to jump back to that step.
          </>
        ) : (
          <>
            Add {/aeiou/i.test(anchorLabel.charAt(0)) ? "an" : "a"} {anchorLabel.toLowerCase()} and at least one friction you noticed to save it as a problem.
          </>
        )}
      </p>

      {anchorPromptId && anchorValue.length > 0 && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-yellow-600" aria-hidden="true">
              <AnchorIcon className="h-4 w-4 text-white" />
            </div>
            <TitleButton onClick={() => onJumpToPrompt(anchorPromptId)}>
              {anchorLabel}
            </TitleButton>
          </div>
          <p className="text-base font-medium text-white">{anchorValue}</p>
        </section>
      )}

      {problemsPrompt && filledLabels.problems.length > 0 && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(problemsPrompt.id)}>
            Problems you encountered
          </TitleButton>
          <p className="text-base text-white">
            {filledLabels.problems.length}{" "}
            {filledLabels.problems.length === 1 ? "problem" : "problems"} selected. Remove
            anything that doesn&apos;t belong.
          </p>
          <div className="flex flex-wrap gap-2">
            {(answers[problemsPrompt.id] ?? []).map((answer, idx) => {
              if (answer.text.trim().length === 0) return null
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => removeAnswerSlot(problemsPrompt.id, idx)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-foreground px-3 py-1 text-base hover:bg-amber-500"
                >
                  <span>{answer.text.trim()}</span>
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove {answer.text.trim()}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {customerPrompt && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(customerPrompt.id)}>
            Who is this for?
          </TitleButton>
          <p className="text-base text-white">
            {filledLabels.customers.length > 0
              ? `${filledLabels.customers.length} ${filledLabels.customers.length === 1 ? "customer" : "customers"} selected. Remove any segments who probably wouldn't feel this the same way.`
              : "No customers selected yet. Optional, but helps frame the problem."}
          </p>
          {filledLabels.customers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(answers[customerPrompt.id] ?? []).map((answer, idx) => {
                if (answer.text.trim().length === 0) return null
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => removeAnswerSlot(customerPrompt.id, idx)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-foreground px-3 py-1 text-base hover:bg-amber-500"
                  >
                    <span>{answer.text.trim()}</span>
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove {answer.text.trim()}</span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {otherPrompts.map((prompt) => {
        const list = answers[prompt.id] ?? []
        const hasAny = list.some((a) => a.text.trim().length > 0)
        if (!hasAny) return null
        return (
          <section key={prompt.id} className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
            <TitleButton onClick={() => onJumpToPrompt(prompt.id)}>{prompt.question}</TitleButton>
            <div className="flex flex-col gap-3">
              {list.map((answer, originalIdx) => {
                if (answer.text.trim().length === 0) return null
                return (
                  <div key={originalIdx} className="flex items-start gap-2">
                    <Textarea
                      value={answer.text}
                      onChange={(e) => setAnswerText(prompt.id, originalIdx, e.target.value)}
                      className="flex-1 text-base min-h-[4rem] bg-white border-white text-foreground"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeAnswerSlot(prompt.id, originalIdx)}
                      aria-label="Remove this answer"
                      className="text-white hover:bg-white/10 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Optional context-capture fields surfaced for any prompt that defines them. */}
      {candidatePrompts.some((p) => (p.capturesContext?.length ?? 0) > 0) && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-4">
          {candidatePrompts.flatMap((prompt) => {
            if (!prompt.capturesContext?.length) return []
            return (answers[prompt.id] ?? []).map((answer, originalIdx) => {
              if (answer.text.trim().length === 0) return null
              return prompt.capturesContext!.map((fieldId) => {
                const field = LENS_CONTEXT_FIELDS[fieldId]
                if (!field) return null
                const inputId = `ctx-${prompt.id}-${originalIdx}-${fieldId}`
                return (
                  <div key={inputId} className="flex flex-col gap-1">
                    <label htmlFor={inputId} className="text-base font-medium text-white">
                      {field.label}
                    </label>
                    {field.helperText && <p className="text-base text-white">{field.helperText}</p>}
                    <Input
                      id={inputId}
                      value={answer.context[fieldId] ?? ""}
                      onChange={(e) =>
                        setAnswerContext(prompt.id, originalIdx, fieldId, e.target.value)
                      }
                      placeholder="Optional"
                      className="text-base bg-white border-white text-foreground"
                    />
                  </div>
                )
              })
            })
          })}
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Edit prompts
        </Button>
        <Button onClick={openSaveDialog} disabled={saving || totalKept === 0} className="gap-2">
          Save problem
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save problem</DialogTitle>
            <DialogDescription>
              Describe the problem in a sentence or two. You can refine it later from the Problems
              page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reflect-problem-description" className="text-base font-medium">
                Problem description
              </label>
              <Textarea
                id="reflect-problem-description"
                value={dialogTitle}
                onChange={(e) => setDialogTitle(e.target.value)}
                placeholder={
                  problemsPrompt?.examples && problemsPrompt.examples.length > 0
                    ? `e.g. ${problemsPrompt.examples[0]}`
                    : "Describe the problem in a sentence or two."
                }
                rows={2}
                className="text-base"
              />
            </div>

            {anchorValue.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-medium">{anchorLabel}</p>
                <p className="text-base">{anchorValue}</p>
              </div>
            )}

            {filledLabels.customers.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-medium">Customers</p>
                <div className="flex flex-wrap gap-2">
                  {filledLabels.customers.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-base"
                    >
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {filledLabels.problems.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-medium">Problems</p>
                <div className="flex flex-wrap gap-2">
                  {filledLabels.problems.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-base"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAsProblem}
              disabled={saving || dialogTitle.trim().length === 0}
            >
              {saving ? "Saving..." : "Save problem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProblemSavedDialog
        open={nextStepDialogOpen}
        onOpenChange={setNextStepDialogOpen}
        problemId={lastSavedProblemId}
        onKeepIdentifying={onKeepIdentifying}
      />
    </div>
  )
}
