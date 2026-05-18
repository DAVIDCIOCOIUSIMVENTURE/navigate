"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ArrowLeft, ArrowRight, ChevronDown, Plus, Trash2 } from "lucide-react"
import { useReflect } from "../context"
import { SelfDiscoveryChips } from "@/components/reflect/self-discovery-chips"
import { LifeExperiencesPicker } from "@/components/reflect/life-experiences-picker"
import { PromptExamples } from "@/components/reflect/prompt-examples"
import { LIFE_PROMPT_EXAMPLES } from "@/data/reflectLifeExamples"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function LensPromptsPage() {
  const router = useRouter()
  const { lens, answers, setAnswerText, addAnswerSlot, removeAnswerSlot } = useReflect()
  const [index, setIndex] = useState(0)
  const [examplesOpen, setExamplesOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"strategy" | "examples">("strategy")
  const isNarrow = useContainerSize() === "narrow"

  const prompt = lens.prompts[index]
  const total = lens.prompts.length
  const isLast = index === total - 1
  const promptAnswers = answers[prompt.id] ?? [{ text: "", context: {} }]

  const chipsCategory = useMemo(() => {
    const src = lens.selfDiscoverySources?.find((s) => s.promptIds.includes(prompt.id))
    return src?.category
  }, [lens, prompt.id])

  const useLifeExperiencesPicker =
    lens.id === "life" && prompt.id === "significant-experience"

  const selectedExperienceTitle = useMemo(() => {
    if (!useLifeExperiencesPicker) return null
    const firstFilled = promptAnswers.find((a) => a.text.trim().length > 0)
    return firstFilled ? firstFilled.text.trim() : null
  }, [useLifeExperiencesPicker, promptAnswers])

  const chosenLifeExperience = useMemo(() => {
    if (lens.id !== "life" || prompt.id === "significant-experience") return null
    const list = answers["significant-experience"] ?? []
    const firstFilled = list.find((a) => a.text.trim().length > 0)
    return firstFilled ? firstFilled.text.trim() : null
  }, [lens.id, prompt.id, answers])

  const lifeExamples = useMemo(() => {
    if (lens.id !== "life") return null
    const list = LIFE_PROMPT_EXAMPLES[prompt.id]
    return list && list.length > 0 ? list : null
  }, [lens.id, prompt.id])

  function handleSelectExperience(title: string | null) {
    setAnswerText(prompt.id, 0, title ?? "")
  }

  useEffect(() => {
    setExamplesOpen(false)
    setActiveTab("strategy")
  }, [prompt.id])

  function goPrev() {
    if (index > 0) {
      setIndex(index - 1)
    } else {
      router.push(`/problems/reflect/${lens.id}/introduction`)
    }
  }

  function goNext() {
    if (isLast) {
      router.push(`/problems/reflect/${lens.id}/review`)
    } else {
      setIndex(index + 1)
    }
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

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-3">
        <span className="text-base font-medium shrink-0">
          Prompt {index + 1} of {total}
        </span>
        <div
          className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index + 1}
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-6">
          <CardTitle icon={Icon} iconBg={lens.tileColor} as="h2">
            {lens.title}
          </CardTitle>
          {chosenLifeExperience && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-600/30 bg-yellow-600/10 px-3 py-2">
              <Icon className="h-4 w-4 text-yellow-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-wrap items-baseline gap-x-2 text-base leading-snug">
                <span className="font-medium">Reflecting on:</span>
                <span>{chosenLifeExperience}</span>
              </div>
            </div>
          )}
          <p className="text-lg font-semibold leading-snug">{prompt.question}</p>
          {prompt.helperText && (
            <p className="text-base leading-relaxed">{prompt.helperText}</p>
          )}
          {prompt.contextOnly && (
            <p className="text-base italic">
              This answer sets context for the prompts that follow. It won&apos;t be saved as a
              candidate.
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {(() => {
            const strategyBlock = (
              <div className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-4">
                {prompt.examples && prompt.examples.length > 0 && !lifeExamples && (
                  <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="gap-2 self-start">
                        <span>Examples</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            examplesOpen && "rotate-180"
                          )}
                          aria-hidden="true"
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      <ul className="text-base leading-relaxed list-disc pl-5 space-y-1">
                        {prompt.examples.map((ex) => (
                          <li key={ex}>{ex}</li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {chipsCategory && !useLifeExperiencesPicker && (
                  <SelfDiscoveryChips category={chipsCategory} onPick={handlePickChip} />
                )}

                {useLifeExperiencesPicker ? (
                  <LifeExperiencesPicker
                    selectedTitle={selectedExperienceTitle}
                    onSelect={handleSelectExperience}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {promptAnswers.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Textarea
                          value={a.text}
                          onChange={(e) => setAnswerText(prompt.id, i, e.target.value)}
                          placeholder="Type your answer."
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
                        onClick={() => addAnswerSlot(prompt.id)}
                        className="self-start gap-2 bg-white text-foreground hover:bg-white/90"
                      >
                        <Plus className="h-4 w-4" />
                        Add another answer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )

            if (!lifeExamples) return strategyBlock

            return (
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "strategy" | "examples")}
                className="flex flex-col gap-4"
              >
                <TabsList className="self-center">
                  <TabsTrigger value="strategy">Your strategy</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>
                <TabsContent value="strategy">{strategyBlock}</TabsContent>
                <TabsContent value="examples">
                  <PromptExamples examples={lifeExamples} />
                </TabsContent>
              </Tabs>
            )
          })()}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={goPrev}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" onClick={goNext}>
            Skip
          </Button>
          <Button onClick={goNext} className="gap-2">
            {isLast ? "Review" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
