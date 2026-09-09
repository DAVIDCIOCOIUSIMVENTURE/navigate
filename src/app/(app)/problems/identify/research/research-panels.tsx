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
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContainerSize } from "@/context/container-size-context"
import {
  RESEARCH_METHODS,
  getToolCategoryLabel,
  type ResearchMethodId,
  type ResearchTool,
  type ResearchToolCategory,
} from "@/data/researchMethods"
import { useResearch } from "@/components/research/research-context"
import { MethodPickerBoard, type MethodPickerItem } from "@/components/method-picker-board"
import { MethodTile } from "@/components/method-tile"
import { IdentifyDimensionPicker } from "@/components/reflect/identify-dimension-picker"
import { useResolveOrCreate } from "@/lib/dimension-labels"
import { ProblemSavedDialog } from "@/components/problem-saved-dialog"
import type { ResearchCapture } from "@/types/research"

/*
 * Step content panels for the Research identify flow. Each panel is rendered
 * by its own route page (see ./routes.ts); the shared shell, stepper and store
 * sync live in ./layout.tsx.
 */

const ENABLED_METHOD_IDS = new Set<ResearchMethodId>(["abandoned-products"])

const PICK_GUIDANCE = {
  title: "Pick a method",
  description:
    "Each method is a different angle for hunting problems out in the world. Pick one, then we'll walk you through curated tools and a guided capture form.",
  tips: [
    "Pick the method where the source material feels most concrete to you.",
    "Each run focuses on a single finding so the capture stays specific. Run the tool again to explore another.",
  ],
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
      <ul className="flex flex-col gap-1.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className="text-tertiary mt-0.5 shrink-0">&#8226;</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Pick method ─── */

export function PickMethodPanel({
  onPick,
  selectedMethodId,
}: {
  onPick: (methodId: ResearchMethodId) => void
  selectedMethodId: ResearchMethodId | null
}) {
  const items: MethodPickerItem[] = RESEARCH_METHODS.map((method) => ({
    id: method.id,
    title: method.title,
    shortDescription: method.shortDescription,
    longDescription: method.longDescription,
    helperText: method.helperText,
    icon: method.icon,
    estimatedMinutes: method.estimatedMinutes,
    enabled: ENABLED_METHOD_IDS.has(method.id),
  }))

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto">
      <GuidancePanel {...PICK_GUIDANCE} stepNumber={1} />
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold">Research methods</h3>
        <MethodPickerBoard
          items={items}
          selectedId={selectedMethodId}
          onPick={(id) => onPick(id as ResearchMethodId)}
        />
      </div>
    </div>
  )
}

/* ─── Pick a tool ─── */

const TOOL_CATEGORY_ORDER: ResearchToolCategory[] = [
  "software",
  "physical",
  "services",
  "ip",
  "general",
]

export function ToolPickerPanel({
  onBack,
  onContinue,
}: {
  onBack: () => void
  onContinue: () => void
}) {
  const { method, toolId, setTool } = useResearch()
  const [openToolId, setOpenToolId] = useState<string | null>(null)
  const openTool = openToolId ? method.tools.find((t) => t.id === openToolId) ?? null : null

  const toolsByCategory = useMemo(() => {
    const groups = new Map<ResearchToolCategory, ResearchTool[]>()
    for (const tool of method.tools) {
      const list = groups.get(tool.category) ?? []
      list.push(tool)
      groups.set(tool.category, list)
    }
    return groups
  }, [method.tools])

  const selectedTool = method.tools.find((t) => t.id === toolId) ?? null

  const guidance = {
    title: "Pick a tool",
    description:
      "Each tool is a different doorway into the same kind of research. Click a tile to preview it, then pick one to focus on for this run.",
    tips: [
      "Open the tool in a new tab once you've picked it. Keep this app open so you can capture what you find.",
      "Don't shop for the 'best' tool. Pick one that feels concrete and start.",
    ],
  }

  const MethodIcon = method.icon

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto">
      <GuidancePanel {...guidance} stepNumber={2} />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xl font-bold">Curated tools ({method.tools.length})</h3>
          {selectedTool && (
            <a
              href={selectedTool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-base font-medium text-primary hover:underline"
            >
              Open {selectedTool.name}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div className="@container flex flex-col gap-6">
          {TOOL_CATEGORY_ORDER.map((category) => {
            const list = toolsByCategory.get(category)
            if (!list || list.length === 0) return null
            return (
              <section key={category} className="flex flex-col gap-3">
                <h4 className="text-base font-semibold tracking-wide">
                  {getToolCategoryLabel(category)}
                </h4>
                <div className="grid grid-cols-1 @[560px]:grid-cols-2 gap-3">
                  {list.map((tool) => {
                    const isSelected = tool.id === toolId
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setOpenToolId(tool.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                        )}
                      >
                        <MethodTile icon={MethodIcon} />
                        <span className="flex-1 min-w-0 flex flex-col gap-1">
                          <span className="flex items-center gap-2">
                            <span className="flex-1 min-w-0 text-base font-semibold leading-tight">
                              {tool.name}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-base font-semibold shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Selected
                              </span>
                            )}
                          </span>
                          <span className="text-base leading-snug line-clamp-2">
                            {tool.description}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <Dialog
          open={openToolId !== null}
          onOpenChange={(open) => {
            if (!open) setOpenToolId(null)
          }}
        >
          <DialogContent className="max-w-xl">
            {openTool && (
              <>
                <DialogHeader>
                  <DialogTitle>{openTool.name}</DialogTitle>
                  <DialogDescription>{getToolCategoryLabel(openTool.category)}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <p className="text-base leading-relaxed">{openTool.description}</p>
                  {openTool.tip && (
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-base leading-relaxed italic">
                        <span className="font-semibold not-italic">Tip:</span> {openTool.tip}
                      </p>
                    </div>
                  )}
                  <a
                    href={openTool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-base font-medium text-primary hover:underline"
                  >
                    Open this tool
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenToolId(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setTool(openTool.id)
                      setOpenToolId(null)
                      onContinue()
                    }}
                  >
                    {openTool.id === toolId ? "Continue with this tool" : "Choose this tool"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 shrink-0">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={onContinue} className="gap-2" disabled={!selectedTool}>
            Continue to capture
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Capture prompts ─── */

export function CapturePanel({
  index,
  onIndexChange,
  onBackToTool,
  onReview,
}: {
  index: number
  onIndexChange: (next: number) => void
  onBackToTool: () => void
  onReview: () => void
}) {
  const { method, answers, setAnswerText, setAnswerSlots, addAnswerSlot, removeAnswerSlot } = useResearch()
  const isNarrow = useContainerSize() === "narrow"
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const prompt = method.prompts[index]
  const total = method.prompts.length
  const isLast = index === total - 1
  const promptAnswers = useMemo(
    () => answers[prompt.id] ?? [{ text: "" }],
    [answers, prompt.id]
  )

  const Icon = method.icon

  const dimensionColumn: "customers" | "problems" | null =
    prompt.role === "customers" ? "customers" : prompt.role === "problems" ? "problems" : null

  const selectedDimensionLabels = useMemo(() => {
    if (!dimensionColumn) return [] as string[]
    return promptAnswers.map((a) => a.text.trim()).filter((t) => t.length > 0)
  }, [dimensionColumn, promptAnswers])

  function handleDimensionChange(next: string[]) {
    const slots = next.map((label) => ({ text: label.trim() }))
    setAnswerSlots(prompt.id, slots)
  }

  function goPrev() {
    if (index > 0) onIndexChange(index - 1)
    else onBackToTool()
  }

  function goNext() {
    if (isLast) onReview()
    else onIndexChange(index + 1)
  }

  const headerRow = (
    <div className="flex items-center gap-2.5">
      <MethodTile icon={Icon} size="lg" />
      <h2 className="text-2xl font-bold leading-none tracking-tight text-secondary-brand">{method.title}</h2>
    </div>
  )

  const rightColumn = (
    <div className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-4 min-h-0 max-h-full w-full">
      <div className="flex items-start justify-between gap-3 shrink-0">
        <p className="text-xl font-bold leading-snug text-white">{prompt.question}</p>
        {dimensionColumn ? (
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
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
      {dimensionColumn ? (
        <IdentifyDimensionPicker
          columnId={dimensionColumn}
          selectedLabels={selectedDimensionLabels}
          onChange={handleDimensionChange}
          addPlaceholder={
            prompt.examples && prompt.examples.length > 0
              ? `e.g. ${prompt.examples[0]}`
              : dimensionColumn === "customers"
                ? "e.g. First-time freelancers, parents of teenagers"
                : "e.g. School pickup logistics, finding a trusted plumber"
          }
          ariaLabel={
            dimensionColumn === "customers"
              ? "Pick one or more customer segments"
              : "Pick one or more problem types"
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
                aria-label={prompt.multipleAllowed ? `Answer ${i + 1}` : "Your answer"}
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

/* ─── Review & save ─── */

export function ReviewPanel({
  onBack,
  onJumpToPrompt,
  onKeepResearching,
}: {
  onBack: () => void
  onJumpToPrompt: (promptId: string) => void
  onKeepResearching: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const resolveOrCreate = useResolveOrCreate()
  const { method, toolId, answers, setAnswerText, removeAnswerSlot, clearSession } = useResearch()
  const [saving, setSaving] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [nextStepDialogOpen, setNextStepDialogOpen] = useState(false)
  const [lastSavedProblemId, setLastSavedProblemId] = useState<number | null>(null)

  const titlePromptId = useMemo(() => method.prompts[0]?.id ?? null, [method.prompts])
  const problemsPromptId = useMemo(
    () => method.prompts.find((p) => p.role === "problems")?.id ?? null,
    [method.prompts]
  )
  const customersPromptId = useMemo(
    () => method.prompts.find((p) => p.role === "customers")?.id ?? null,
    [method.prompts]
  )

  const productName = titlePromptId
    ? (answers[titlePromptId]?.[0]?.text ?? "").trim()
    : ""

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

  const hasCandidate = productName.length > 0 && filledLabels.problems.length > 0

  const otherPrompts = method.prompts.filter(
    (p) => p.id !== titlePromptId && p.id !== problemsPromptId && p.id !== customersPromptId
  )

  const Icon = method.icon
  const selectedTool = method.tools.find((t) => t.id === toolId) ?? null

  function openSaveDialog() {
    setDialogTitle(productName)
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

      const research: ResearchCapture = {
        methodId: method.id,
        toolId,
        capturedAt: new Date().toISOString(),
        prompts: method.prompts
          .map((p) => ({
            promptId: p.id,
            answers: (answers[p.id] ?? [])
              .map((a) => a.text.trim())
              .filter((t) => t.length > 0),
          }))
          .filter((p) => p.answers.length > 0),
      }

      const newProblem = await dispatch.problems.create({
        source: "research",
        title: trimmedTitle,
        customers: customerIds,
        contexts: [],
        problems: problemIds,
        you: [],
      })

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`navigate-problem-research-${newProblem.id}`, JSON.stringify(research))
        }
      } catch {
        // ignore storage errors
      }

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

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary"
          aria-hidden="true"
        >
          <ClipboardCheck className="h-5 w-5 text-primary-foreground [stroke-width:2.5]" />
        </div>
        <h2 className="text-2xl font-bold leading-none tracking-tight text-primary">Review your research</h2>
      </div>
      <p className="text-base leading-relaxed">
        {hasCandidate ? (
          <>
            Your research will be saved as <span className="font-semibold">one problem</span> in your
            problem library. Click any heading to jump back to that step.
          </>
        ) : (
          <>Add a product name and at least one unmet need to save it as a problem.</>
        )}
      </p>

      {selectedTool && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-2">
          <p className="text-base font-semibold text-white">Source</p>
          <a
            href={selectedTool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-base text-white hover:underline"
          >
            {selectedTool.name}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </section>
      )}

      {titlePromptId && productName.length > 0 && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-yellow-600" aria-hidden="true">
              <Icon className="h-4 w-4 text-white" />
            </div>
            <TitleButton onClick={() => onJumpToPrompt(titlePromptId)}>
              Product
            </TitleButton>
          </div>
          <p className="text-base font-medium text-white">{productName}</p>
        </section>
      )}

      {problemsPromptId && filledLabels.problems.length > 0 && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(problemsPromptId)}>
            Unmet needs (saved as problems)
          </TitleButton>
          <p className="text-base text-white">
            {filledLabels.problems.length}{" "}
            {filledLabels.problems.length === 1 ? "problem" : "problems"} selected. Remove anything
            that doesn&apos;t belong.
          </p>
          <div className="flex flex-wrap gap-2">
            {(answers[problemsPromptId] ?? []).map((answer, idx) => {
              if (answer.text.trim().length === 0) return null
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => removeAnswerSlot(problemsPromptId, idx)}
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

      {customersPromptId && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToPrompt(customersPromptId)}>
            Who is this for?
          </TitleButton>
          <p className="text-base text-white">
            {filledLabels.customers.length > 0
              ? `${filledLabels.customers.length} ${filledLabels.customers.length === 1 ? "customer" : "customers"} selected.`
              : "No customers selected yet. Optional, but helps frame the problem."}
          </p>
          {filledLabels.customers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(answers[customersPromptId] ?? []).map((answer, idx) => {
                if (answer.text.trim().length === 0) return null
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => removeAnswerSlot(customersPromptId, idx)}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Edit capture
        </Button>
        <Button onClick={openSaveDialog} disabled={saving || !hasCandidate} className="gap-2">
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
              library.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="research-problem-description" className="text-base font-medium">
                Problem description
              </label>
              <Textarea
                id="research-problem-description"
                value={dialogTitle}
                onChange={(e) => setDialogTitle(e.target.value)}
                placeholder="Describe the problem in a sentence or two."
                rows={2}
                className="text-base"
              />
            </div>

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
        onKeepIdentifying={onKeepResearching}
      />
    </div>
  )
}
