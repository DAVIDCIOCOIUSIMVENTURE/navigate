"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, ClipboardCheck, Trash2 } from "lucide-react"
import { useReflect } from "../context"
import { LENS_CONTEXT_FIELDS } from "@/data/reflectLenses"
import type { SessionAnswer } from "@/store/problem-candidates-model"

export default function LensReviewPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { lens, sessionId, answers, setAnswerText, setAnswerContext, removeAnswerSlot, clearSession } =
    useReflect()
  const [saving, setSaving] = useState(false)

  const candidatePrompts = lens.prompts.filter((p) => !p.contextOnly)
  const totalKept = candidatePrompts.reduce((sum, p) => {
    return sum + (answers[p.id] ?? []).filter((a) => a.text.trim().length > 0).length
  }, 0)

  async function handleSave() {
    setSaving(true)
    try {
      const payload: SessionAnswer[] = []
      for (const p of candidatePrompts) {
        const list = answers[p.id] ?? []
        for (const a of list) {
          if (a.text.trim().length === 0) continue
          payload.push({
            promptId: p.id,
            title: a.text.trim(),
            context: { ...a.context },
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
                    className="rounded-lg border bg-card p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-2">
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
                            className="text-base"
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
          onClick={handleSave}
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
