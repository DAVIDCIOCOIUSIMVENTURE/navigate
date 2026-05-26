"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContainerSize } from "@/context/container-size-context"
import { REFLECT_LENSES, LENS_CONTEXT_FIELDS, type Lens, type LensId, getReflectLens } from "@/data/reflectLenses"
import { ReflectProvider, useReflect } from "@/components/reflect/reflect-context"
import { SelfDiscoveryChips } from "@/components/reflect/self-discovery-chips"
import { LifeExperiencesPicker } from "@/components/reflect/life-experiences-picker"
import { WorkContextPicker } from "@/components/reflect/work-context-picker"
import { OwnProblemsPicker } from "@/components/reflect/own-problems-picker"
import { AudiencePicker } from "@/components/reflect/audience-picker"
import { IdentifyDimensionPicker } from "@/components/reflect/identify-dimension-picker"
import { useResolveOrCreate } from "@/lib/dimension-labels"
import { ProblemSavedDialog } from "@/components/problem-saved-dialog"
import type { ReflectionCapture } from "@/types/reflection"
import type { ReflectStep } from "@/store/reflect-sessions-model"

const REFLECT_STEPS: { id: ReflectStep; label: string }[] = [
  { id: "pick", label: "Pick a method" },
  { id: "introduction", label: "Introduction" },
  { id: "prompts", label: "Prompts" },
  { id: "review", label: "Review" },
]

const ENABLED_LENS_IDS = new Set<LensId>([
  "life",
  "work",
  "own-problems",
  "audience-problems",
])

function getAnchorPromptId(lens: Lens): string | null {
  return lens.prompts.find((p) => p.contextOnly)?.id ?? null
}

function getRolePromptId(lens: Lens, role: "problems" | "customers"): string | null {
  return lens.prompts.find((p) => p.role === role)?.id ?? null
}

const PICK_GUIDANCE = {
  title: "Choose your discovery method",
  description:
    "Each method is a different angle on where problems come from. Pick one to run through guided prompts and turn your answers into a problem in your problem bank.",
  tips: [
    "Start with the angle where you have the most lived detail. Specific beats broad.",
    "Each run focuses on a single experience or angle so the prompts stay specific. Run the tool again to explore another.",
  ],
}

function GuidancePanel({
  title,
  description,
  tips,
  className,
}: {
  title: string
  description: string
  tips: string[]
  className?: string
}) {
  return (
    <ScrollArea className={cn("min-h-0", className)}>
      <div className="flex flex-col gap-3 text-base pr-3">
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="leading-relaxed">{description}</p>
        <ul className="flex flex-col gap-1.5">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="text-secondary-brand mt-0.5 shrink-0">&#8226;</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  )
}

function Stepper({
  steps,
  activeId,
  onStepClick,
  isStepEnabled,
  promptsProgress,
}: {
  steps: { id: ReflectStep; label: string }[]
  activeId: ReflectStep
  onStepClick: (id: ReflectStep) => void
  isStepEnabled: (id: ReflectStep) => boolean
  promptsProgress?: { current: number; total: number } | null
}) {
  const isWide = useContainerSize() === "wide"
  const [open, setOpen] = useState(false)
  const activeIdx = steps.findIndex((s) => s.id === activeId)
  const active = steps[activeIdx] ?? steps[0]

  const stepLabel = (id: ReflectStep, baseLabel: string) => {
    if (id === "prompts" && activeId === "prompts" && promptsProgress) {
      return `Prompt ${promptsProgress.current} of ${promptsProgress.total}`
    }
    return baseLabel
  }

  if (isWide) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          {steps.map((s, i) => {
            const isActive = s.id === activeId
            const isCompleted = i < activeIdx
            const enabled = isStepEnabled(s.id)
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <button
                  disabled={!enabled}
                  onClick={() => enabled && onStepClick(s.id)}
                  className="flex items-center gap-2 shrink-0 disabled:opacity-100"
                >
                  <span
                    className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-colors",
                      isActive
                        ? "border-secondary-brand bg-secondary-brand text-secondary-brand-foreground"
                        : isCompleted
                          ? "border-secondary-brand bg-secondary-brand/10 text-secondary-brand"
                          : "border-muted-foreground/30 bg-transparent text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm whitespace-nowrap",
                      isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {stepLabel(s.id, s.label)}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-px mx-3",
                      i < activeIdx ? "bg-secondary-brand" : "bg-border"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-lg border">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto py-2 px-3">
              <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                <span className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 border-secondary-brand bg-secondary-brand text-secondary-brand-foreground shrink-0">
                  {activeIdx + 1}
                </span>
                <span className="truncate font-semibold text-foreground">
                  Step {activeIdx + 1} of {steps.length}: {stepLabel(active.id, active.label)}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                  open && "rotate-180"
                )}
                aria-hidden="true"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col gap-0.5 list-none m-0 p-2 pt-0" role="list">
              {steps.map((s, i) => {
                const isActive = s.id === activeId
                const isCompleted = i < activeIdx
                const enabled = isStepEnabled(s.id)
                return (
                  <li key={s.id}>
                    <Button
                      type="button"
                      variant={isActive ? "secondary" : "ghost"}
                      disabled={!enabled}
                      onClick={() => {
                        if (!enabled) return
                        setOpen(false)
                        onStepClick(s.id)
                      }}
                      aria-current={isActive ? "step" : undefined}
                      className="w-full justify-start h-auto py-2 px-3 gap-2.5"
                    >
                      <span
                        className={cn(
                          "flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-colors shrink-0",
                          isActive
                            ? "border-secondary-brand bg-secondary-brand text-secondary-brand-foreground"
                            : isCompleted
                              ? "border-secondary-brand bg-secondary-brand/10 text-secondary-brand"
                              : "border-muted-foreground/30 bg-transparent text-muted-foreground"
                        )}
                      >
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm whitespace-normal text-left",
                          isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {stepLabel(s.id, s.label)}
                      </span>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

/* ─── Step content panels ─── */

function PickMethodPanel({
  onPick,
  selectedLensId,
}: {
  onPick: (lensId: LensId) => void
  selectedLensId: LensId | null
}) {
  const isWide = useContainerSize() === "wide"
  const [openLensId, setOpenLensId] = useState<LensId | null>(null)
  const openLens = openLensId ? getReflectLens(openLensId) ?? null : null
  const OpenIcon = openLens?.icon

  return (
    <div className={cn("flex", isWide ? "flex-row gap-6 flex-1 min-h-0" : "flex-col gap-4")}>
      <GuidancePanel {...PICK_GUIDANCE} className={isWide ? "w-1/3 shrink-0" : "w-full shrink-0"} />
      <div className={cn("flex flex-col gap-3 min-w-0", isWide && "flex-1 min-h-0")}>
        <h3 className="text-base font-semibold">Discovery methods</h3>
        <ScrollArea className="flex-1 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-3 pt-3">
            {REFLECT_LENSES.map((lens) => {
              const Icon = lens.icon
              const isEnabled = ENABLED_LENS_IDS.has(lens.id)
              const isSelected = selectedLensId === lens.id

              if (!isEnabled) {
                return (
                  <div
                    key={lens.id}
                    aria-disabled="true"
                    className="block cursor-not-allowed rounded-xl"
                  >
                    <Card className="h-full opacity-60">
                      <CardContent className="p-5 flex flex-col gap-3 h-full">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                                lens.tileColor
                              )}
                              aria-hidden="true"
                            >
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="text-base font-semibold leading-tight truncate">{lens.title}</h4>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-base font-medium shrink-0">
                            Coming soon
                          </span>
                        </div>
                        <div className="mt-auto flex items-center gap-1.5 text-base">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          <span>About {lens.estimatedMinutes} minutes</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              }

              return (
                <button
                  key={lens.id}
                  type="button"
                  onClick={() => setOpenLensId(lens.id as LensId)}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex h-full cursor-pointer flex-col rounded-xl border-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/40 ring-offset-2"
                      : "border-border bg-card hover:border-primary hover:bg-primary/5"
                  )}
                >
                  {isSelected && (
                    <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                      <CheckCircle2 className="h-3 w-3" />
                      Selected
                    </span>
                  )}
                  <div className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                          lens.tileColor
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h4
                        className={cn(
                          "text-base font-semibold leading-tight truncate",
                          isSelected && "text-primary"
                        )}
                      >
                        {lens.title}
                      </h4>
                    </div>
                    <div className="mt-auto flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-base">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        <span>About {lens.estimatedMinutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-base font-semibold text-primary">
                        {isSelected ? "Selected method" : "Preview this method"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      <Dialog
        open={openLensId !== null}
        onOpenChange={(open) => {
          if (!open) setOpenLensId(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {openLens && OpenIcon && (
            <>
              <DialogHeader>
                <DialogTitle>
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                        openLens.tileColor
                      )}
                      aria-hidden="true"
                    >
                      <OpenIcon className="h-5 w-5 text-white" />
                    </span>
                    <span>{openLens.title}</span>
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Learn how this method works, then choose it to start reflecting.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <p className="text-base leading-relaxed">{openLens.longDescription}</p>
                {openLens.helperText && (
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-base leading-relaxed">{openLens.helperText}</p>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-base">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>About {openLens.estimatedMinutes} minutes</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenLensId(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const id = openLens.id
                    setOpenLensId(null)
                    onPick(id)
                  }}
                >
                  {selectedLensId === openLens.id ? "Continue with this method" : "Choose this method"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IntroductionPanel({
  lens,
  onBack,
  onStart,
}: {
  lens: Lens
  onBack: () => void
  onStart: () => void
}) {
  const Icon = lens.icon
  const { answers } = useReflect()
  const hasProgress = Object.values(answers).some((slots) =>
    slots.some((a) => a.text.trim().length > 0)
  )
  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      <div className="flex items-center gap-3">
        <div
          className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", lens.tileColor)}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold leading-tight">{lens.title}</h3>
      </div>
      <p className="text-base leading-relaxed">{lens.longDescription}</p>
      <div className="flex items-center gap-1.5 text-base">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <span>About {lens.estimatedMinutes} minutes</span>
      </div>
      <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
        <h3 className="text-base font-semibold">What you&apos;ll get out of this</h3>
        <ul className="text-base leading-relaxed list-disc pl-5 space-y-1">
          <li>Short prompts to react to, instead of a blank canvas.</li>
          <li>Your answers saved as a problem you can refine in the problem bank.</li>
          <li>A prompt to revisit parts of your experience you may have overlooked.</li>
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-auto">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Choose another method
        </Button>
        <Button onClick={onStart} className="gap-2">
          {hasProgress ? "Continue journey" : "Start journey"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function PromptsPanel({
  index,
  onIndexChange,
  onBackToIntro,
  onReview,
}: {
  index: number
  onIndexChange: (next: number) => void
  onBackToIntro: () => void
  onReview: () => void
}) {
  const {
    lens,
    answers,
    setAnswerText,
    addAnswerSlot,
    removeAnswerSlot,
    setAnswerSlots,
  } = useReflect()
  const isNarrow = useContainerSize() === "narrow"
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const prompt = lens.prompts[index]
  const total = lens.prompts.length
  const isLast = index === total - 1
  const promptAnswers = useMemo(
    () => answers[prompt.id] ?? [{ text: "", context: {} }],
    [answers, prompt.id]
  )

  const chipsCategory = useMemo(() => {
    const src = lens.selfDiscoverySources?.find((s) => s.promptIds.includes(prompt.id))
    return src?.category
  }, [lens, prompt.id])

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

  const selectedAnchorTitle = useMemo(() => {
    if (!useAnchorPicker) return null
    const firstFilled = promptAnswers.find((a) => a.text.trim().length > 0)
    return firstFilled ? firstFilled.text.trim() : null
  }, [useAnchorPicker, promptAnswers])

  const anchorPromptId = useMemo(() => getAnchorPromptId(lens), [lens])
  const chosenAnchor = useMemo(() => {
    if (!anchorPromptId) return null
    const list = answers[anchorPromptId] ?? []
    const firstFilled = list.find((a) => a.text.trim().length > 0)
    return firstFilled ? firstFilled.text.trim() : null
  }, [anchorPromptId, answers])
  const isAnchorPrompt = anchorPromptId !== null && prompt.id === anchorPromptId

  function handleSelectAnchor(title: string | null) {
    setAnswerText(prompt.id, 0, title ?? "")
  }

  function goPrev() {
    if (index > 0) onIndexChange(index - 1)
    else onBackToIntro()
  }

  function goNext() {
    if (isLast) onReview()
    else onIndexChange(index + 1)
  }

  function handlePickChip(text: string) {
    const emptyIdx = promptAnswers.findIndex((a) => a.text.trim().length === 0)
    if (emptyIdx >= 0) {
      setAnswerText(prompt.id, emptyIdx, text)
      return
    }
    if (prompt.multipleAllowed) {
      addAnswerSlot(prompt.id)
      setAnswerText(prompt.id, promptAnswers.length, text)
      return
    }
    const current = promptAnswers[0].text
    setAnswerText(prompt.id, 0, current.length > 0 ? `${current}\n${text}` : text)
  }

  const Icon = lens.icon
  const isWide = useContainerSize() === "wide"

  const rightColumn = (
    <div className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-white">
          {prompt.multipleAllowed ? "Your answers" : "Your answer"}
        </p>
        {useAnchorPicker || dimensionPickerColumn ? (
          <Button
            type="button"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            className="gap-1.5 shrink-0 bg-white text-foreground hover:bg-white/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add your own
          </Button>
        ) : prompt.multipleAllowed ? (
          <Button
            type="button"
            size="sm"
            onClick={() => addAnswerSlot(prompt.id)}
            className="gap-1.5 shrink-0 bg-white text-foreground hover:bg-white/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another answer
          </Button>
        ) : null}
      </div>
      {chipsCategory && !useAnchorPicker && !dimensionPickerColumn && (
        <SelfDiscoveryChips category={chipsCategory} onPick={handlePickChip} />
      )}

      {useLifeExperiencesPicker ? (
        <LifeExperiencesPicker
          selectedTitle={selectedAnchorTitle}
          onSelect={handleSelectAnchor}
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
        />
      ) : useWorkContextPicker ? (
        <WorkContextPicker
          selectedTitle={selectedAnchorTitle}
          onSelect={handleSelectAnchor}
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
        />
      ) : useOwnProblemsPicker ? (
        <OwnProblemsPicker
          selectedTitle={selectedAnchorTitle}
          onSelect={handleSelectAnchor}
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
        />
      ) : useAudiencePicker ? (
        <AudiencePicker
          selectedTitle={selectedAnchorTitle}
          onSelect={handleSelectAnchor}
          addDialogOpen={addDialogOpen}
          onAddDialogOpenChange={setAddDialogOpen}
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
        </div>
      )}
    </div>
  )

  const leftColumn = (
    <div className="flex flex-col gap-4 pr-3">
      {chosenAnchor && !isAnchorPrompt && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-600/30 bg-yellow-600/10 px-3 py-2">
          <Icon className="h-4 w-4 text-yellow-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-wrap items-baseline gap-x-2 text-base leading-snug">
            <span className="font-medium">Reflecting on:</span>
            <span>{chosenAnchor}</span>
          </div>
        </div>
      )}
      {prompt.helperText && (
        <p className="text-base leading-relaxed">{prompt.helperText}</p>
      )}
      {prompt.examples && prompt.examples.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg bg-accent/30 p-3">
          <span className="text-base font-medium uppercase tracking-wide">
            Examples
          </span>
          {prompt.examples.map((ex, i) => (
            <span key={i} className="text-base italic leading-relaxed">
              &ldquo;{ex}&rdquo;
            </span>
          ))}
        </div>
      )}
    </div>
  )

  const headerRow = (
    <div className="flex items-center gap-3 shrink-0 flex-wrap">
      <div className="flex items-center gap-3">
        <div
          className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", lens.tileColor)}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold leading-tight">{lens.title}</h3>
      </div>
      <div className="flex items-center gap-2 pl-3 ml-3 border-l border-border">
        <HelpCircle className="h-5 w-5 text-tertiary shrink-0" aria-hidden="true" />
        <p className="text-xl font-bold leading-snug">{prompt.question}</p>
      </div>
    </div>
  )

  return (
    <div className={cn("flex flex-col gap-6 w-full", isWide && "flex-1 min-h-0")}>
      {headerRow}
      <div
        className={cn(
          "flex gap-6",
          isWide ? "flex-row items-stretch flex-1 min-h-0" : "flex-col"
        )}
      >
        {isWide ? (
          <ScrollArea className="w-1/2 shrink-0 min-h-0">
            {leftColumn}
          </ScrollArea>
        ) : (
          <div className="w-full">{leftColumn}</div>
        )}
        {isWide ? (
          <ScrollArea className="w-1/2 shrink-0 min-h-0">
            <div className="pr-3">{rightColumn}</div>
          </ScrollArea>
        ) : (
          <div className="w-full">{rightColumn}</div>
        )}
      </div>

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

function ReviewPanel({
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
        description: trimmedTitle,
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
        className="group inline-flex items-center gap-2 text-left text-base font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
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
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-secondary-brand" aria-hidden="true">
            <ClipboardCheck className="h-5 w-5 text-secondary-brand-foreground" />
          </div>
          <h3 className="text-xl font-bold leading-tight">Review your answers</h3>
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
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-secondary-brand" aria-hidden="true">
          <ClipboardCheck className="h-5 w-5 text-secondary-brand-foreground" />
        </div>
        <h3 className="text-xl font-bold leading-tight">Review your answers</h3>
      </div>
      <p className="text-base leading-relaxed">
        {hasCandidate ? (
          <>
            Your answers will be saved as <span className="font-semibold">one problem</span> in your
            problem bank. Click any heading below to jump back to that step.
          </>
        ) : (
          <>
            Add {/aeiou/i.test(anchorLabel.charAt(0)) ? "an" : "a"} {anchorLabel.toLowerCase()} and at least one friction you noticed to save it as a problem.
          </>
        )}
      </p>

      {anchorPromptId && anchorValue.length > 0 && (
        <section className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-yellow-600" aria-hidden="true">
              <AnchorIcon className="h-4 w-4 text-white" />
            </div>
            <TitleButton onClick={() => onJumpToPrompt(anchorPromptId)}>
              {anchorLabel}
            </TitleButton>
          </div>
          <p className="text-base font-medium">{anchorValue}</p>
        </section>
      )}

      {problemsPrompt && filledLabels.problems.length > 0 && (
        <section className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(problemsPrompt.id)}>
            Problems you encountered
          </TitleButton>
          <p className="text-base">
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-base hover:bg-foreground/90"
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
        <section className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(customerPrompt.id)}>
            Who is this for?
          </TitleButton>
          <p className="text-base">
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
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-base hover:bg-foreground/90"
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
          <section key={prompt.id} className="rounded-lg border bg-card p-4 flex flex-col gap-3">
            <TitleButton onClick={() => onJumpToPrompt(prompt.id)}>{prompt.question}</TitleButton>
            <div className="flex flex-col gap-3">
              {list.map((answer, originalIdx) => {
                if (answer.text.trim().length === 0) return null
                return (
                  <div key={originalIdx} className="flex items-start gap-2">
                    <Textarea
                      value={answer.text}
                      onChange={(e) => setAnswerText(prompt.id, originalIdx, e.target.value)}
                      className="flex-1 text-base min-h-[4rem]"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeAnswerSlot(prompt.id, originalIdx)}
                      aria-label="Remove this answer"
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
        <section className="rounded-lg border bg-card p-4 flex flex-col gap-4">
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
                    <label htmlFor={inputId} className="text-base font-medium">
                      {field.label}
                    </label>
                    {field.helperText && <p className="text-base">{field.helperText}</p>}
                    <Input
                      id={inputId}
                      value={answer.context[fieldId] ?? ""}
                      onChange={(e) =>
                        setAnswerContext(prompt.id, originalIdx, fieldId, e.target.value)
                      }
                      placeholder="Optional"
                      className="text-base"
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
              Describe the problem in a sentence or two. You can refine it later in the problem
              bank.
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

/* ─── ReflectBuilder (main entry point) ─── */

export function ReflectBuilder({ resetRef }: { resetRef?: React.MutableRefObject<(() => void) | null> }) {
  const dispatch = useDispatch<AppDispatch>()
  const hydrated = useSelector((s: RootState) => s.reflectSessions.hydrated)
  const storedLensId = useSelector(
    (s: RootState) => s.reflectSessions.lastPickedLensId
  )
  const storedStep = useSelector((s: RootState) => s.reflectSessions.lastStep)
  const storedPromptIndex = useSelector(
    (s: RootState) => s.reflectSessions.lastPromptIndex
  )
  const [step, setStep] = useState<ReflectStep>("pick")
  const [lensId, setLensId] = useState<LensId | null>(null)
  const [promptIndex, setPromptIndex] = useState(0)
  const [restored, setRestored] = useState(false)
  const lens = lensId ? getReflectLens(lensId) ?? null : null

  useEffect(() => {
    if (restored) return
    if (!hydrated) return
    setRestored(true)
    if (storedLensId && getReflectLens(storedLensId)) {
      setLensId(storedLensId as LensId)
      const restoredLens = getReflectLens(storedLensId)!
      const total = restoredLens.prompts.length
      const safeIndex = Math.min(Math.max(storedPromptIndex, 0), Math.max(total - 1, 0))
      setPromptIndex(safeIndex)
      setStep(storedStep ?? "introduction")
    }
  }, [hydrated, storedLensId, storedStep, storedPromptIndex, restored])

  useEffect(() => {
    if (!restored) return
    dispatch.reflectSessions.setLastPosition({
      lensId,
      step: lensId ? step : null,
      promptIndex,
    })
  }, [restored, dispatch, lensId, step, promptIndex])

  function handlePick(id: LensId) {
    setLensId(id)
    setPromptIndex(0)
    setStep("introduction")
  }

  function isStepEnabled(id: ReflectStep): boolean {
    if (id === "pick") return true
    if (!lens) return false
    return true
  }

  function handleStepClick(id: ReflectStep) {
    if (id === "pick") {
      setStep("pick")
      return
    }
    if (!lens) return
    if (id === "prompts") setPromptIndex(0)
    setStep(id)
  }

  useEffect(() => {
    if (!resetRef) return
    resetRef.current = () => {
      dispatch.reflectSessions.clearAllSessions()
      setStep("pick")
      setLensId(null)
      setPromptIndex(0)
    }
  }, [resetRef, dispatch])

  const promptsProgress =
    step === "prompts" && lens
      ? { current: promptIndex + 1, total: lens.prompts.length }
      : null

  const content = (() => {
    if (step === "pick" || !lens) {
      return <PickMethodPanel onPick={handlePick} selectedLensId={lensId} />
    }
    if (step === "introduction") {
      return (
        <IntroductionPanel
          lens={lens}
          onBack={() => setStep("pick")}
          onStart={() => {
            setPromptIndex(0)
            setStep("prompts")
          }}
        />
      )
    }
    if (step === "prompts") {
      return (
        <PromptsPanel
          index={promptIndex}
          onIndexChange={setPromptIndex}
          onBackToIntro={() => setStep("introduction")}
          onReview={() => setStep("review")}
        />
      )
    }
    return (
      <ReviewPanel
        onBack={() => {
          setPromptIndex(0)
          setStep("prompts")
        }}
        onJumpToPrompt={(promptId) => {
          if (!lens) return
          const idx = lens.prompts.findIndex((p) => p.id === promptId)
          setPromptIndex(idx >= 0 ? idx : 0)
          setStep("prompts")
        }}
        onKeepIdentifying={() => {
          setStep("pick")
          setLensId(null)
          setPromptIndex(0)
        }}
      />
    )
  })()

  const inner = (
    <Card className="flex flex-col flex-1 min-h-0">
      <CardContent className="flex flex-col gap-6 pt-6 flex-1 min-h-0">
        <Stepper
          steps={REFLECT_STEPS}
          activeId={step}
          onStepClick={handleStepClick}
          isStepEnabled={isStepEnabled}
          promptsProgress={promptsProgress}
        />
        <div className={cn("flex-1 min-h-0 flex flex-col", step !== "prompts" && "overflow-y-auto")}>
          {content}
        </div>
      </CardContent>
    </Card>
  )

  if (step === "pick" || !lens) return inner
  return <ReflectProvider lens={lens}>{inner}</ReflectProvider>
}
