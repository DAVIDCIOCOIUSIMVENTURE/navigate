"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  HeartHandshake,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"
import { useReflect } from "../context"
import { LENS_CONTEXT_FIELDS } from "@/data/reflectLenses"
import type { SessionAnswer } from "@/store/problem-candidates-model"
import { useResolveOrCreate } from "@/lib/dimension-labels"

const LIFE_LENS_ORDER = [
  "harder-than-needed",
  "wish-told",
  "wasted-spend",
  "personal-workaround",
  "customer",
] as const

export default function LensReviewPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const resolveOrCreate = useResolveOrCreate()
  const {
    lens,
    sessionId,
    answers,
    setAnswerText,
    setAnswerContext,
    removeAnswerSlot,
    clearSession,
  } = useReflect()
  const [saving, setSaving] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")

  const candidatePrompts = lens.prompts.filter((p) => !p.contextOnly)
  const isLifeLens = lens.id === "life"

  const filledAnswers = candidatePrompts.reduce((sum, p) => {
    return sum + (answers[p.id] ?? []).filter((a) => a.text.trim().length > 0).length
  }, 0)

  const lifeExperience = isLifeLens
    ? (answers["significant-experience"]?.[0]?.text ?? "").trim()
    : ""
  const hasLifeCandidate = isLifeLens && lifeExperience.length > 0 && filledAnswers > 0
  const totalKept = isLifeLens ? (hasLifeCandidate ? 1 : 0) : filledAnswers

  const filledLabels = useMemo(() => {
    function labels(promptId: string): string[] {
      return (answers[promptId] ?? [])
        .map((a) => a.text.trim())
        .filter((t) => t.length > 0)
    }
    return {
      problems: labels("harder-than-needed"),
      customers: labels("customer"),
      wishTold: labels("wish-told"),
      wastedSpend: labels("wasted-spend"),
      workaround: labels("personal-workaround"),
    }
  }, [answers])

  function goToStep(stepId: string) {
    router.push(`/problems/reflect/${lens.id}/prompts?step=${stepId}`)
  }

  function openSaveDialog() {
    setDialogTitle(lifeExperience)
    setSaveDialogOpen(true)
  }

  async function handleSaveAsCandidates() {
    setSaving(true)
    try {
      const payload: SessionAnswer[] = []
      const lensContext: Record<string, string> = {}
      for (const p of candidatePrompts) {
        const list = answers[p.id] ?? []
        for (const a of list) {
          if (a.text.trim().length === 0) continue
          payload.push({
            promptId: p.id,
            title: a.text.trim(),
            context: { ...lensContext, ...a.context },
          })
        }
      }
      const created = await dispatch.problemCandidates.bulkCreateForSession({
        sessionId,
        lensId: lens.id,
        answers: payload,
      })
      clearSession()
      router.push(`/problems/reflect/${lens.id}/done?count=${created.length}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAsProblem() {
    if (!isLifeLens || !hasLifeCandidate) return
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

      const newProblem = await dispatch.problems.create({
        source: "reflect",
        description: trimmedTitle,
        customers: customerIds,
        contexts: [],
        problems: problemIds,
        you: [],
      })
      clearSession()
      setSaveDialogOpen(false)
      router.push(`/problems/${newProblem.id}/validation/introduction`)
    } finally {
      setSaving(false)
    }
  }

  function TitleButton({
    onClick,
    children,
  }: {
    onClick: () => void
    children: React.ReactNode
  }) {
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

  if (isLifeLens) {
    const orderedPrompts = LIFE_LENS_ORDER.map((id) =>
      candidatePrompts.find((p) => p.id === id)
    ).filter((p): p is NonNullable<typeof p> => Boolean(p))
    const problemsPrompt = orderedPrompts.find((p) => p.id === "harder-than-needed")
    const customerPrompt = orderedPrompts.find((p) => p.id === "customer")
    const otherPrompts = orderedPrompts.filter(
      (p) => p.id !== "harder-than-needed" && p.id !== "customer"
    )

    return (
      <div className="flex flex-col gap-4 w-full">
        <Card>
          <CardHeader className="space-y-6">
            <CardTitle icon={ClipboardCheck} iconBg="bg-secondary-brand">
              Review your answers
            </CardTitle>
            <p className="text-base leading-relaxed">
              {hasLifeCandidate ? (
                <>
                  Your answers will be saved as{" "}
                  <span className="font-semibold">one problem</span> in your
                  problem bank. Click any heading below to jump back to that
                  step.
                </>
              ) : (
                <>
                  Add a life experience and at least one friction-prompt answer
                  to save a problem.
                </>
              )}
            </p>
          </CardHeader>
        </Card>

        {lifeExperience.length > 0 && (
          <Card>
            <CardHeader className="space-y-6">
              <CardTitle icon={HeartHandshake} iconBg="bg-yellow-600" as="h2">
                <TitleButton onClick={() => goToStep("significant-experience")}>
                  Life experience
                </TitleButton>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-medium">{lifeExperience}</p>
            </CardContent>
          </Card>
        )}

        {problemsPrompt && filledLabels.problems.length > 0 && (
          <Card>
            <CardHeader className="space-y-3">
              <TitleButton onClick={() => goToStep(problemsPrompt.id)}>
                Problems you encountered
              </TitleButton>
              <p className="text-base">
                {filledLabels.problems.length}{" "}
                {filledLabels.problems.length === 1 ? "problem" : "problems"}{" "}
                selected. Remove anything that doesn&apos;t belong.
              </p>
            </CardHeader>
            <CardContent>
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
                      <span className="sr-only">
                        Remove {answer.text.trim()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {customerPrompt && (
          <Card>
            <CardHeader className="space-y-3">
              <TitleButton onClick={() => goToStep(customerPrompt.id)}>
                Who is this for?
              </TitleButton>
              <p className="text-base">
                {filledLabels.customers.length > 0
                  ? `${filledLabels.customers.length} ${filledLabels.customers.length === 1 ? "customer" : "customers"} selected. Remove anything that doesn't belong.`
                  : "No customers selected yet. Optional, but helps frame the problem."}
              </p>
            </CardHeader>
            {filledLabels.customers.length > 0 && (
              <CardContent>
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
                        <span className="sr-only">
                          Remove {answer.text.trim()}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {otherPrompts.map((prompt) => {
          const list = answers[prompt.id] ?? []
          const hasAny = list.some((a) => a.text.trim().length > 0)
          if (!hasAny) return null
          return (
            <Card key={prompt.id}>
              <CardHeader className="space-y-3">
                <TitleButton onClick={() => goToStep(prompt.id)}>
                  {prompt.question}
                </TitleButton>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {list.map((answer, originalIdx) => {
                  if (answer.text.trim().length === 0) return null
                  return (
                    <div key={originalIdx} className="flex items-start gap-2">
                      <Textarea
                        value={answer.text}
                        onChange={(e) =>
                          setAnswerText(prompt.id, originalIdx, e.target.value)
                        }
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
              </CardContent>
            </Card>
          )
        })}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/problems/reflect/${lens.id}/prompts`}>
              <ArrowLeft className="h-4 w-4" />
              Edit prompts
            </Link>
          </Button>
          <Button
            onClick={openSaveDialog}
            disabled={saving || totalKept === 0}
            className="gap-2"
          >
            Save Problem
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Problem</DialogTitle>
              <DialogDescription>
                Describe the problem in a sentence or two. You can refine it
                later in the problem bank.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reflect-problem-description"
                  className="text-base font-medium"
                >
                  Problem description
                </label>
                <Textarea
                  id="reflect-problem-description"
                  value={dialogTitle}
                  onChange={(e) => setDialogTitle(e.target.value)}
                  placeholder="A short sentence that describes the problem"
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
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAsProblem}
                disabled={saving || dialogTitle.trim().length === 0}
              >
                {saving ? "Saving..." : "Save Problem"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card>
        <CardHeader className="space-y-6">
          <CardTitle icon={ClipboardCheck} iconBg="bg-secondary-brand">
            Review your answers
          </CardTitle>
          <p className="text-base leading-relaxed">
            You have <span className="font-semibold">{totalKept}</span>{" "}
            {totalKept === 1 ? "answer" : "answers"} ready to save as{" "}
            {totalKept === 1 ? "a candidate" : "candidates"}. Edit or remove anything below,
            then save when you&apos;re happy. Optional context fields appear under each answer.
          </p>
        </CardHeader>
      </Card>

      {candidatePrompts.map((prompt) => {
        const list = answers[prompt.id] ?? []
        const hasAny = list.some((a) => a.text.trim().length > 0)
        if (!hasAny) return null
        return (
          <Card key={prompt.id}>
            <CardHeader className="space-y-3">
              <p className="text-base font-semibold">{prompt.question}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {list.map((answer, originalIdx) => {
                if (answer.text.trim().length === 0) return null
                return (
                  <div
                    key={originalIdx}
                    className="rounded-lg bg-secondary-brand text-white p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <Textarea
                        value={answer.text}
                        onChange={(e) => setAnswerText(prompt.id, originalIdx, e.target.value)}
                        className="flex-1 text-base min-h-[4rem] bg-white border-white text-foreground placeholder:text-muted-foreground"
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
                    {prompt.capturesContext?.map((fieldId) => {
                      const field = LENS_CONTEXT_FIELDS[fieldId]
                      if (!field) return null
                      const inputId = `ctx-${prompt.id}-${originalIdx}-${fieldId}`
                      return (
                        <div key={fieldId} className="flex flex-col gap-1">
                          <label htmlFor={inputId} className="text-base font-medium">
                            {field.label}
                          </label>
                          {field.helperText && (
                            <p className="text-base">{field.helperText}</p>
                          )}
                          <Input
                            id={inputId}
                            value={answer.context[fieldId] ?? ""}
                            onChange={(e) =>
                              setAnswerContext(prompt.id, originalIdx, fieldId, e.target.value)
                            }
                            placeholder="Optional"
                            className="text-base bg-white border-white text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/problems/reflect/${lens.id}/prompts`}>
            <ArrowLeft className="h-4 w-4" />
            Edit prompts
          </Link>
        </Button>
        <Button
          onClick={handleSaveAsCandidates}
          disabled={saving || totalKept === 0}
          className="gap-2"
        >
          {saving ? "Saving..." : "Save as candidates"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
