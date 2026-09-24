"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Pencil, Plus, Trash2, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useContainerSize } from "@/context/container-size-context"
import { GUIDED_TOOL, type GuidedChoiceNode, type GuidedPromptNode } from "@/data/guidedDiscovery"
import {
  buildGuidedCapture,
  chosenOption,
  filledAnswers,
  guidedAnchor,
  guidedHasCandidate,
  guidedRoleNode,
  guidedStartingDimension,
} from "@/lib/guided-discovery"
import { ANSWER_REMOVE_DESCRIPTION, ConfirmDialog, removeCopy } from "@/components/ui/confirm-dialog"
import { RemovablePill } from "@/components/ui/removable-pill"
import { MethodTile } from "@/components/method-tile"
import { DimensionPill } from "@/components/dimension-pill"
import { DIMENSION_ICONS, DIMENSION_LABELS, type DimensionKey } from "@/lib/dimension-visuals"
import { useGuided } from "@/components/guided/guided-context"
import { AudiencePicker } from "@/components/reflect/audience-picker"
import { IdentifyDimensionPicker } from "@/components/reflect/identify-dimension-picker"
import { DimensionAnchorPicker } from "@/components/guided/dimension-anchor-picker"
import { SelfDiscoveryAnchorPicker } from "@/components/guided/self-discovery-anchor-picker"
import { useResolveOrCreate } from "@/lib/dimension-labels"
import { ProblemSavedDialog } from "@/components/problem-saved-dialog"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"

/*
 * Step content panels for Guided discovery. Each panel is rendered by its own
 * route page (see ./routes.ts); the shared shell, stepper and store sync live
 * in ./layout.tsx. The question shown at a given index comes from the path the
 * answers so far have opened up (`useGuided().path`), so a choice made earlier
 * changes which questions follow.
 */

/** The id of the picked catalogue item, kept beside an anchor's label. */
const ANCHOR_ITEM_FIELD = "anchorItemId"

/** Placeholder and accessible name for the multi-select picker of each dimension column. */
const DIMENSION_PICKER_COPY: Record<Exclude<DimensionKey, "you">, { placeholder: string; ariaLabel: string }> = {
  problems: { placeholder: "e.g. School pickup logistics, finding a trusted plumber", ariaLabel: "Pick one or more problem types" },
  customers: { placeholder: "e.g. First-time freelancers, parents of teenagers", ariaLabel: "Pick one or more customer segments" },
  contexts: { placeholder: "e.g. During a lunch break, in an emergency", ariaLabel: "Pick one or more contexts" },
}

/** What the anchor of each dimension is called in the add dialog and the review. */
const ANCHOR_NOUN: Record<DimensionKey, string> = {
  you: "experience",
  customers: "audience",
  problems: "annoyance",
  contexts: "moment",
}

const PANEL_CLASS = "rounded-xl bg-secondary-brand p-6 flex flex-col gap-4 min-h-0 max-h-full w-full"
const OUTLINE_ON_BRAND = "bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"

/* ─── Header shared by the panels ─── */

function PanelHeader() {
  const { answers } = useGuided()
  const dimension = guidedStartingDimension(answers)
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <MethodTile icon={GUIDED_TOOL.icon} size="lg" />
      <h2 className="text-2xl font-bold leading-none tracking-tight text-secondary-brand">{GUIDED_TOOL.title}</h2>
      {dimension && <DimensionPill dimension={dimension} />}
    </div>
  )
}

/* ─── Question step ─── */

export function QuestionPanel({
  index,
  onIndexChange,
  onLeave,
  onReview,
}: {
  index: number
  onIndexChange: (next: number) => void
  /** Back from the first question: out of the tool, to the list of tools. */
  onLeave: () => void
  onReview: () => void
}) {
  const { path, answers } = useGuided()
  const node = path.nodes[index]

  // The layout redirects an index the path does not reach; render nothing until it lands.
  if (!node) return null

  const isLast = path.complete && index === path.nodes.length - 1
  // A choice has to be made before the next question is known.
  const canContinue = node.kind === "prompt" || chosenOption(node, answers) !== null

  function goPrev() {
    if (index > 0) onIndexChange(index - 1)
    else onLeave()
  }

  function goNext() {
    if (!canContinue) return
    if (isLast) onReview()
    else onIndexChange(index + 1)
  }

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      <div className="shrink-0">
        <PanelHeader />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {node.kind === "choice" ? <ChoiceQuestion node={node} /> : <PromptQuestion node={node} />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <Button variant="outline" onClick={goPrev} className="gap-2 bg-white border-primary text-primary hover:bg-primary/10 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={goNext} disabled={!canContinue} className="gap-2">
          {isLast ? "Review" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/** A choice: one option opens the next stretch of questions. */
function ChoiceQuestion({ node }: { node: GuidedChoiceNode }) {
  const { answers, chooseOption } = useGuided()
  const chosen = chosenOption(node, answers)

  return (
    <div className={PANEL_CLASS}>
      <div className="flex flex-col gap-1.5 min-w-0 shrink-0">
        <p className="text-lg font-bold leading-snug text-white">{node.question}</p>
        {node.helperText && <p className="text-base leading-snug text-white/90">{node.helperText}</p>}
      </div>
      <div role="radiogroup" aria-label={node.question} className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
        {node.options.map((option) => {
          const isSelected = chosen?.id === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => chooseOption(node.id, option)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                isSelected ? "border-primary ring-2 ring-primary" : "border-transparent hover:bg-card/90",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid place-content-center h-5 w-5 shrink-0 rounded-full border",
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className="flex flex-1 min-w-0 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-base font-semibold leading-snug">{option.label}</span>
                  {option.dimension && <DimensionPill dimension={option.dimension} />}
                </span>
                {option.description && <span className="text-base leading-snug">{option.description}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** A prompt: the anchor picker, a dimension picker or free text, by the node's role. */
function PromptQuestion({ node }: { node: GuidedPromptNode }) {
  const { answers, setAnswerText, setAnswerContext, addAnswerSlot, removeAnswerSlot, setAnswerSlots } = useGuided()
  const isNarrow = useContainerSize() === "narrow"
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const promptAnswers = useMemo(() => answers[node.id] ?? [{ text: "", context: {} }], [answers, node.id])
  const isAnchor = node.anchor === true
  const pickerColumn = !isAnchor && node.role && node.role !== "you" ? node.role : null
  const hasPicker = isAnchor || pickerColumn !== null

  const selectedLabels = useMemo(() => promptAnswers.map((a) => a.text.trim()).filter((t) => t.length > 0), [promptAnswers])

  function handleDimensionChange(next: string[]) {
    const byLabel = new Map<string, (typeof promptAnswers)[number]>()
    for (const a of promptAnswers) {
      const key = a.text.trim().toLowerCase()
      if (key.length > 0 && !byLabel.has(key)) byLabel.set(key, a)
    }
    setAnswerSlots(
      node.id,
      next.map((label) => {
        const existing = byLabel.get(label.trim().toLowerCase())
        return existing ? { ...existing, text: label.trim() } : { text: label.trim(), context: {} }
      }),
    )
  }

  const selectedAnchorId = useMemo(() => {
    if (!isAnchor) return null
    const id = promptAnswers[0]?.context?.[ANCHOR_ITEM_FIELD]
    return id && id.length > 0 ? id : null
  }, [isAnchor, promptAnswers])

  function handleSelectAnchor(id: string | null, label: string | null) {
    setAnswerText(node.id, 0, label ?? "")
    setAnswerContext(node.id, 0, ANCHOR_ITEM_FIELD, id ?? "")
  }

  const example = node.examples && node.examples.length > 0 ? `e.g. ${node.examples[0]}` : undefined
  const pickerProps = {
    addDialogOpen,
    onAddDialogOpenChange: setAddDialogOpen,
    editDialogOpen,
    onEditDialogOpenChange: setEditDialogOpen,
  }

  let field: ReactNode
  if (isAnchor && node.role === "you") {
    field = (
      <SelfDiscoveryAnchorPicker
        selectedId={selectedAnchorId}
        onSelect={handleSelectAnchor}
        addToQuestionUrl={node.selfDiscoveryQuestionUrl ?? "life-experiences"}
        addPlaceholder={example ?? "Put it in your own words"}
        {...pickerProps}
      />
    )
  } else if (isAnchor && node.role === "customers") {
    field = <AudiencePicker selectedId={selectedAnchorId} onSelect={handleSelectAnchor} {...pickerProps} />
  } else if (isAnchor && (node.role === "contexts" || node.role === "problems")) {
    field = (
      <DimensionAnchorPicker
        columnId={node.role}
        selectedId={selectedAnchorId}
        onSelect={handleSelectAnchor}
        noun={ANCHOR_NOUN[node.role]}
        addPlaceholder={example ?? "Put it in your own words"}
        {...pickerProps}
      />
    )
  } else if (pickerColumn) {
    field = (
      <IdentifyDimensionPicker
        columnId={pickerColumn}
        selectedLabels={selectedLabels}
        onChange={handleDimensionChange}
        addPlaceholder={example ?? DIMENSION_PICKER_COPY[pickerColumn].placeholder}
        ariaLabel={DIMENSION_PICKER_COPY[pickerColumn].ariaLabel}
        {...pickerProps}
      />
    )
  } else {
    field = (
      <div className="flex flex-col gap-2">
        {promptAnswers.map((a, i) => (
          <div key={i} className="flex items-start gap-2">
            <Textarea
              value={a.text}
              onChange={(e) => setAnswerText(node.id, i, e.target.value)}
              placeholder={example ?? "Type your answer."}
              aria-label={node.multipleAllowed ? `Answer ${i + 1}` : "Your answer"}
              className={cn(
                "flex-1 text-base bg-white border-white text-foreground placeholder:text-muted-foreground",
                isNarrow ? "min-h-[7rem]" : "min-h-[5rem]",
              )}
            />
            {node.multipleAllowed && promptAnswers.length > 1 && (
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
                onConfirm={() => removeAnswerSlot(node.id, i)}
              />
            )}
          </div>
        ))}
        {node.multipleAllowed && (
          <Button type="button" variant="outline" onClick={() => addAnswerSlot(node.id)} className={cn("w-full gap-1.5", OUTLINE_ON_BRAND)}>
            <Plus className="h-3.5 w-3.5" />
            Add another answer
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={PANEL_CLASS}>
      <div className="flex items-start justify-between gap-3 shrink-0">
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-lg font-bold leading-snug text-white">{node.question}</p>
          {node.helperText && <p className="text-base leading-snug text-white/90">{node.helperText}</p>}
        </div>
        {hasPicker && (
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" size="sm" onClick={() => setAddDialogOpen(true)} className="gap-1.5 bg-white text-foreground hover:bg-white/90">
              <Plus className="h-3.5 w-3.5" />
              Add your own
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditDialogOpen(true)} className={cn("gap-1.5", OUTLINE_ON_BRAND)}>
              <Pencil className="h-3.5 w-3.5" />
              <span className="font-semibold">Edit</span>
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">{field}</div>
    </div>
  )
}

/* ─── Review step ─── */

export function ReviewPanel({
  onBack,
  onJumpToQuestion,
}: {
  onBack: () => void
  /** Opens the question for this node, by its position on the path. */
  onJumpToQuestion: (nodeId: string) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const resolveOrCreate = useResolveOrCreate()
  const router = useRouter()
  const { path, answers, setAnswerText, removeAnswerSlot, clearSession } = useGuided()
  const [saving, setSaving] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [nextStepDialogOpen, setNextStepDialogOpen] = useState(false)
  const [lastSavedProblemId, setLastSavedProblemId] = useState<number | null>(null)
  // Inside a project that already has its problem, saving updates that problem rather than creating one.
  const { projectId, problem: existing } = useProjectScope()

  const dimension = guidedStartingDimension(answers)
  const anchor = guidedAnchor(path)
  const anchorValue = anchor ? filledAnswers(answers, anchor.id)[0] ?? "" : ""
  const anchorItemId = anchor ? answers[anchor.id]?.[0]?.context?.[ANCHOR_ITEM_FIELD] ?? "" : ""
  const problemsNode = guidedRoleNode(path, "problems")
  const customersNode = guidedRoleNode(path, "customers")
  const contextsNode = guidedRoleNode(path, "contexts")
  const hasCandidate = guidedHasCandidate(path, answers)

  const filledLabels = useMemo(
    () => ({
      // The anchor of a run that starts from a dimension is that column's first entry.
      problems: [...(anchor?.role === "problems" ? [anchorValue] : []), ...(problemsNode && !problemsNode.anchor ? filledAnswers(answers, problemsNode.id) : [])],
      customers: [...(anchor?.role === "customers" ? [anchorValue] : []), ...(customersNode && !customersNode.anchor ? filledAnswers(answers, customersNode.id) : [])],
      contexts: [...(anchor?.role === "contexts" ? [anchorValue] : []), ...(contextsNode && !contextsNode.anchor ? filledAnswers(answers, contextsNode.id) : [])],
    }),
    [anchor, anchorValue, problemsNode, customersNode, contextsNode, answers],
  )

  const choices = path.nodes.filter((n): n is GuidedChoiceNode => n.kind === "choice")
  const freePrompts = path.nodes.filter(
    (n): n is GuidedPromptNode => n.kind === "prompt" && !n.anchor && n.role === undefined && filledAnswers(answers, n.id).length > 0,
  )

  function openSaveDialog() {
    setDialogTitle(anchorValue)
    setSaveDialogOpen(true)
  }

  async function handleSave() {
    if (!hasCandidate || !anchor) return
    const trimmedTitle = dialogTitle.trim()
    if (trimmedTitle.length === 0) return
    setSaving(true)
    try {
      const ids = (column: "customers" | "contexts" | "problems") =>
        filledLabels[column].map((label) => resolveOrCreate(column, label)).filter((id) => id.length > 0)
      const problemIds = ids("problems")
      const customerIds = ids("customers")
      const contextIds = ids("contexts")
      // A You anchor picked from self-discovery goes into the problem's You column.
      const youIds = anchor.role === "you" && anchorItemId.length > 0 ? [anchorItemId] : []
      const reflection = buildGuidedCapture(path, answers, new Date().toISOString())

      if (existing) {
        // Only the columns this branch asked about change, so revisiting leaves the others as they were.
        dispatch.problems.update({
          id: existing.id,
          patch: {
            title: trimmedTitle,
            reflection,
            ...(problemsNode ? { problems: problemIds } : {}),
            ...(customersNode ? { customers: customerIds } : {}),
            ...(contextsNode ? { contexts: contextIds } : {}),
            ...(anchor.role === "you" ? { you: youIds } : {}),
          },
        })
        clearSession()
        setSaveDialogOpen(false)
        toast.success("Problem updated.")
        router.push(projectRoutes.page(projectId))
        return
      }
      const created = await dispatch.problems.create({
        source: "identify",
        projectId,
        title: trimmedTitle,
        customers: customerIds,
        contexts: contextIds,
        problems: problemIds,
        you: youIds,
        reflection,
      })
      clearSession()
      setSaveDialogOpen(false)
      setLastSavedProblemId(created.id)
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
        <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
        <span className="sr-only">Edit this step</span>
      </button>
    )
  }

  /** The filled answers to one picker prompt as removable pills. */
  function AnswerPills({ nodeId }: { nodeId: string }) {
    return (
      <div className="flex flex-wrap gap-2">
        {(answers[nodeId] ?? []).map((answer, idx) => {
          const label = answer.text.trim()
          if (label.length === 0) return null
          return (
            <RemovablePill
              key={idx}
              label={label}
              noun="answer"
              description={ANSWER_REMOVE_DESCRIPTION}
              onRemove={() => removeAnswerSlot(nodeId, idx)}
            />
          )
        })}
      </div>
    )
  }

  /** One dimension column's section: the prompt that fills it, with its pills. */
  function ColumnSection({ node, heading, column, emptyText, pruneText }: { node: GuidedPromptNode | null; heading: string; column: Exclude<DimensionKey, "you">; emptyText: string; pruneText: string }) {
    if (!node || node.anchor) return null
    const count = filledAnswers(answers, node.id).length
    const noun = column === "problems" ? "problem" : column === "customers" ? "customer" : "context"
    return (
      <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
        <TitleButton onClick={() => onJumpToQuestion(node.id)}>{heading}</TitleButton>
        <p className="text-base text-white">
          {count > 0 ? `${count} ${count === 1 ? noun : `${noun}s`} selected. ${pruneText}` : emptyText}
        </p>
        {count > 0 && <AnswerPills nodeId={node.id} />}
      </section>
    )
  }

  const AnchorIcon = dimension ? DIMENSION_ICONS[dimension] : GUIDED_TOOL.icon
  const anchorNoun = anchor?.role ? ANCHOR_NOUN[anchor.role] : "starting point"
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
            Click any heading below to jump back to that question.
          </>
        ) : !path.complete ? (
          <>Answer each question in turn to reach the end of your route, then come back here to save.</>
        ) : (
          <>Pick {/^[aeiou]/i.test(anchorNoun) ? "an" : "a"} {anchorNoun} and answer at least one more question to save it as a problem.</>
        )}
      </p>

      {choices.length > 0 && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <p className="text-base font-semibold text-white">Your route</p>
          <ul className="flex flex-col gap-2">
            {choices.map((choice) => {
              const option = chosenOption(choice, answers)
              return (
                <li key={choice.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <TitleButton onClick={() => onJumpToQuestion(choice.id)}>{choice.question}</TitleButton>
                  <span className="text-base text-white">{option ? option.label : "Not answered yet"}</span>
                  {option?.dimension && <DimensionPill dimension={option.dimension} className="bg-white/15 border-white/40 text-white" />}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {anchor && anchorValue.length > 0 && (
        <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-yellow-600" aria-hidden="true">
              <AnchorIcon className="h-4 w-4 text-white" />
            </div>
            <TitleButton onClick={() => onJumpToQuestion(anchor.id)}>
              {dimension ? DIMENSION_LABELS[dimension] : "Starting from"}
            </TitleButton>
          </div>
          <p className="text-base font-medium text-white">{anchorValue}</p>
        </section>
      )}

      <ColumnSection
        node={problemsNode}
        heading="Problems you encountered"
        column="problems"
        emptyText="No problems selected yet. At least one is needed to save."
        pruneText="Remove anything that doesn't belong."
      />
      <ColumnSection
        node={customersNode}
        heading="Who is this for?"
        column="customers"
        emptyText="No customers selected yet. Optional, but helps frame the problem."
        pruneText="Remove any segments who probably wouldn't feel this the same way."
      />
      <ColumnSection
        node={contextsNode}
        heading="When and where it bites"
        column="contexts"
        emptyText="No contexts selected yet. Optional, but helps pin down when a solution would need to show up."
        pruneText="Remove any moments where the problem is only a mild nuisance."
      />

      {freePrompts.map((node) => (
        <section key={node.id} className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
          <TitleButton onClick={() => onJumpToQuestion(node.id)}>{node.question}</TitleButton>
          <div className="flex flex-col gap-3">
            {(answers[node.id] ?? []).map((answer, originalIdx) => {
              if (answer.text.trim().length === 0) return null
              return (
                <div key={originalIdx} className="flex items-start gap-2">
                  <Textarea
                    value={answer.text}
                    onChange={(e) => setAnswerText(node.id, originalIdx, e.target.value)}
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
                    onConfirm={() => removeAnswerSlot(node.id, originalIdx)}
                  />
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Edit answers
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
            <DialogDescription>Describe the problem in a sentence or two. You can refine it later from the project.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="guided-problem-description" className="text-base font-medium">
                Problem description
              </label>
              <Textarea
                id="guided-problem-description"
                value={dialogTitle}
                onChange={(e) => setDialogTitle(e.target.value)}
                placeholder={
                  problemsNode?.examples && problemsNode.examples.length > 0
                    ? `e.g. ${problemsNode.examples[0]}`
                    : "Describe the problem in a sentence or two."
                }
                rows={2}
                className="text-base"
              />
            </div>

            {filledLabels.customers.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-medium">Customers</p>
                <div className="flex flex-wrap gap-2">
                  {filledLabels.customers.map((label) => (
                    <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-base">
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
                    <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-base">
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
                    <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-base">
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
            <Button onClick={handleSave} disabled={saving || dialogTitle.trim().length === 0}>
              {saving ? "Saving..." : existing ? "Update problem" : "Save problem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProblemSavedDialog open={nextStepDialogOpen} onOpenChange={setNextStepDialogOpen} problemId={lastSavedProblemId} />
    </div>
  )
}
