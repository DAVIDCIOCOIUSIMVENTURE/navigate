"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  getAnchorPromptId,
  getRolePromptId,
  type LensDimensionRole,
} from "@/data/reflectLenses"
import { ANSWER_REMOVE_DESCRIPTION, ConfirmDialog, removeCopy } from "@/components/ui/confirm-dialog"
import { RemovablePill } from "@/components/ui/removable-pill"
import { MethodTile } from "@/components/method-tile"
import { useReflect } from "@/components/reflect/reflect-context"
import { LifeExperiencesPicker } from "@/components/reflect/life-experiences-picker"
import { WorkContextPicker } from "@/components/reflect/work-context-picker"
import { OwnProblemsPicker } from "@/components/reflect/own-problems-picker"
import { AudiencePicker } from "@/components/reflect/audience-picker"
import { AnnoyancePicker } from "@/components/reflect/annoyance-picker"
import { IdentifyDimensionPicker } from "@/components/reflect/identify-dimension-picker"
import { useResolveOrCreate } from "@/lib/dimension-labels"
import { DIMENSION_ICONS } from "@/lib/dimension-visuals"
import { ProblemSavedDialog } from "@/components/problem-saved-dialog"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { ReflectionCapture } from "@/types/reflection"

/*
 * Step content panels for one guided-prompt tool. Each panel is rendered by
 * its own route page (see ./routes.ts); the shared shell, stepper and store
 * sync live in ./layout.tsx.
 */

/** Placeholder and accessible name for the multi-select picker of each dimension column. */
const DIMENSION_PICKER_COPY: Record<LensDimensionRole, { placeholder: string; ariaLabel: string }> = {
  problems: {
    placeholder: "e.g. School pickup logistics, finding a trusted plumber",
    ariaLabel: "Pick one or more problem types",
  },
  customers: {
    placeholder: "e.g. First-time freelancers, parents of teenagers",
    ariaLabel: "Pick one or more customer segments",
  },
  contexts: {
    placeholder: "e.g. During a lunch break, in an emergency",
    ariaLabel: "Pick one or more contexts",
  },
}

/* ─── Step content panels ─── */

export function PromptsPanel({
  index,
  onIndexChange,
  onLeave,
  onReview,
}: {
  index: number
  onIndexChange: (next: number) => void
  /** Back from the first prompt: out of the tool, to the list of tools. */
  onLeave: () => void
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
  const useAnnoyancePicker =
    lens.id === "annoyance" && prompt.id === "annoyance-anchor"
  const useAnchorPicker =
    useLifeExperiencesPicker ||
    useWorkContextPicker ||
    useOwnProblemsPicker ||
    useAudiencePicker ||
    useAnnoyancePicker

  // An anchor with a role is rendered by its own single-select picker above,
  // so this only drives the multi-select picker of the prompts that follow.
  const dimensionPickerColumn: LensDimensionRole | null = prompt.role ?? null

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
    else onLeave()
  }

  function goNext() {
    if (isLast) onReview()
    else onIndexChange(index + 1)
  }

  const Icon = lens.icon

  const rightColumn = (
    <div className="rounded-xl bg-secondary-brand p-6 shadow-lg flex flex-col gap-4 min-h-0 max-h-full w-full">
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
      ) : useAnnoyancePicker ? (
        <AnnoyancePicker
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
              : DIMENSION_PICKER_COPY[dimensionPickerColumn].placeholder
          }
          ariaLabel={DIMENSION_PICKER_COPY[dimensionPickerColumn].ariaLabel}
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
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      aria-label="Remove this answer"
                      className="text-white hover:bg-white/10 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                  {...removeCopy("answer", ANSWER_REMOVE_DESCRIPTION)}
                  onConfirm={() => removeAnswerSlot(prompt.id, i)}
                />
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
}: {
  onBack: () => void
  onJumpToPrompt: (promptId: string) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const resolveOrCreate = useResolveOrCreate()
  const {
    lens,
    answers,
    setAnswerText,
    removeAnswerSlot,
    clearSession,
  } = useReflect()
  const [saving, setSaving] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [nextStepDialogOpen, setNextStepDialogOpen] = useState(false)
  const [lastSavedProblemId, setLastSavedProblemId] = useState<number | null>(null)
  const router = useRouter()
  // Inside a project that already has its problem, saving updates that problem rather than creating one.
  const { projectId, problem: existing } = useProjectScope()

  const anchorPromptId = useMemo(() => getAnchorPromptId(lens), [lens])
  const problemsPromptId = useMemo(() => getRolePromptId(lens, "problems"), [lens])
  const customersPromptId = useMemo(() => getRolePromptId(lens, "customers"), [lens])
  const contextsPromptId = useMemo(() => getRolePromptId(lens, "contexts"), [lens])
  const candidatePrompts = lens.prompts.filter((p) => !p.contextOnly)
  const anchorLabel = lens.anchorLabel

  const filledAnswers = candidatePrompts.reduce((sum, p) => {
    return sum + (answers[p.id] ?? []).filter((a) => a.text.trim().length > 0).length
  }, 0)

  // A problem needs the anchor and at least one answer about it.
  const anchorValue = (answers[anchorPromptId]?.[0]?.text ?? "").trim()
  const hasCandidate = anchorValue.length > 0 && filledAnswers > 0

  const filledLabels = useMemo(() => {
    function labels(promptId: string | null): string[] {
      if (!promptId) return []
      return (answers[promptId] ?? []).map((a) => a.text.trim()).filter((t) => t.length > 0)
    }
    return {
      problems: labels(problemsPromptId),
      customers: labels(customersPromptId),
      contexts: labels(contextsPromptId),
    }
  }, [answers, problemsPromptId, customersPromptId, contextsPromptId])

  function openSaveDialog() {
    setDialogTitle(anchorValue)
    setSaveDialogOpen(true)
  }

  async function handleSaveAsProblem() {
    if (!hasCandidate) return
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
      const contextIds = filledLabels.contexts
        .map((label) => resolveOrCreate("contexts", label))
        .filter((id) => id.length > 0)
      // Only a tool that asks about contexts may change them, so revisiting
      // with one that does not leaves what the Canvas Builder or edit page set.
      const contextsPatch = contextsPromptId ? { contexts: contextIds } : {}

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

      if (existing) {
        dispatch.problems.update({
          id: existing.id,
          patch: { title: trimmedTitle, customers: customerIds, problems: problemIds, ...contextsPatch, reflection },
        })
        clearSession()
        setSaveDialogOpen(false)
        toast.success("Problem updated.")
        router.push(projectRoutes.page(projectId))
        return
      }
      const newProblem = await dispatch.problems.create({
        source: "identify",
        projectId,
        title: trimmedTitle,
        customers: customerIds,
        contexts: contextIds,
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

  /** The filled answers to one picker prompt as removable pills. */
  function AnswerPills({ promptId }: { promptId: string }) {
    return (
      <div className="flex flex-wrap gap-2">
        {(answers[promptId] ?? []).map((answer, idx) => {
          const label = answer.text.trim()
          if (label.length === 0) return null
          return (
            <RemovablePill
              key={idx}
              label={label}
              noun="answer"
              description={ANSWER_REMOVE_DESCRIPTION}
              onRemove={() => removeAnswerSlot(promptId, idx)}
            />
          )
        })}
      </div>
    )
  }

  const problemsPrompt = candidatePrompts.find((p) => p.id === problemsPromptId)
  const customerPrompt = candidatePrompts.find((p) => p.id === customersPromptId)
  const contextPrompt = candidatePrompts.find((p) => p.id === contextsPromptId)
  const otherPrompts = candidatePrompts.filter(
    (p) => p.id !== problemsPromptId && p.id !== customersPromptId && p.id !== contextsPromptId
  )
  const AnchorIcon = lens.icon
  const ContextIcon = DIMENSION_ICONS.contexts

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
            {existing ? (
              <>Saving will <span className="font-semibold">update your project&apos;s problem</span> with these answers.</>
            ) : (
              <>Your answers will be saved as your project&apos;s <span className="font-semibold">problem</span>.</>
            )}{" "}
            Click any heading below to jump back to that step.
          </>
        ) : (
          <>
            Add {/^[aeiou]/i.test(anchorLabel) ? "an" : "a"} {anchorLabel.toLowerCase()} and answer at least one more prompt to save it as a problem.
          </>
        )}
      </p>

      {anchorValue.length > 0 && (
        <section className="rounded-xl bg-secondary-brand p-6 shadow-lg flex flex-col gap-3">
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
        <section className="rounded-xl bg-secondary-brand p-6 shadow-lg flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(problemsPrompt.id)}>
            Problems you encountered
          </TitleButton>
          <p className="text-base text-white">
            {filledLabels.problems.length}{" "}
            {filledLabels.problems.length === 1 ? "problem" : "problems"} selected. Remove
            anything that doesn&apos;t belong.
          </p>
          <AnswerPills promptId={problemsPrompt.id} />
        </section>
      )}

      {customerPrompt && (
        <section className="rounded-xl bg-secondary-brand p-6 shadow-lg flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(customerPrompt.id)}>
            Who is this for?
          </TitleButton>
          <p className="text-base text-white">
            {filledLabels.customers.length > 0
              ? `${filledLabels.customers.length} ${filledLabels.customers.length === 1 ? "customer" : "customers"} selected. Remove any segments who probably wouldn't feel this the same way.`
              : "No customers selected yet. Optional, but helps frame the problem."}
          </p>
          {filledLabels.customers.length > 0 && <AnswerPills promptId={customerPrompt.id} />}
        </section>
      )}

      {contextPrompt && (
        <section className="rounded-xl bg-secondary-brand p-6 shadow-lg flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(contextPrompt.id)}>
            When and where it bites
          </TitleButton>
          <p className="text-base text-white">
            {filledLabels.contexts.length > 0
              ? `${filledLabels.contexts.length} ${filledLabels.contexts.length === 1 ? "context" : "contexts"} selected. Remove any moments where the problem is only a mild nuisance.`
              : "No contexts selected yet. Optional, but helps pin down when a solution would need to show up."}
          </p>
          {filledLabels.contexts.length > 0 && <AnswerPills promptId={contextPrompt.id} />}
        </section>
      )}

      {otherPrompts.map((prompt) => {
        const list = answers[prompt.id] ?? []
        const hasAny = list.some((a) => a.text.trim().length > 0)
        if (!hasAny) return null
        return (
          <section key={prompt.id} className="rounded-xl bg-secondary-brand p-6 shadow-lg flex flex-col gap-3">
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
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          aria-label="Remove this answer"
                          className="text-white hover:bg-white/10 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      {...removeCopy("answer", ANSWER_REMOVE_DESCRIPTION)}
                      onConfirm={() => removeAnswerSlot(prompt.id, originalIdx)}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Edit prompts
        </Button>
        <Button onClick={openSaveDialog} disabled={saving || !hasCandidate} className="gap-2">
          {existing ? "Update problem" : "Save problem"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{existing ? "Update problem" : "Save problem"}</DialogTitle>
            <DialogDescription>
              Describe the problem in a sentence or two. You can refine it later from the project.
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

            {filledLabels.contexts.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-medium">Contexts</p>
                <div className="flex flex-wrap gap-2">
                  {filledLabels.contexts.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-base"
                    >
                      <ContextIcon className="h-3.5 w-3.5" aria-hidden="true" />
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
              {saving ? "Saving..." : existing ? "Update problem" : "Save problem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProblemSavedDialog
        open={nextStepDialogOpen}
        onOpenChange={setNextStepDialogOpen}
        problemId={lastSavedProblemId}
      />
    </div>
  )
}
