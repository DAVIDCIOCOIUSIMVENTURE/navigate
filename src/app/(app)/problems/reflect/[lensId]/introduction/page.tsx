"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, ArrowRight, ChevronDown, Clock } from "lucide-react"
import { useReflect } from "../context"
import { cn } from "@/lib/utils"

export default function LensIntroductionPage() {
  const { lens } = useReflect()
  const Icon = lens.icon
  const [previewOpen, setPreviewOpen] = useState(false)
  const isSingleForm = lens.flowKind === "single-form"

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button asChild variant="ghost" size="default" className="self-start gap-2">
        <Link href="/problems/reflect">
          <ArrowLeft className="h-4 w-4" />
          Back to lenses
        </Link>
      </Button>

      <Card>
        <CardHeader className="space-y-6">
          <CardTitle icon={Icon} iconBg={lens.tileColor}>
            {lens.title}
          </CardTitle>
          <p className="text-base leading-relaxed">{lens.longDescription}</p>
          <div className="flex items-center gap-1.5 text-base">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>About {lens.estimatedMinutes} minutes</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
            <h3 className="text-base font-semibold">What you&apos;ll get out of this</h3>
            <ul className="text-base leading-relaxed list-disc pl-5 space-y-1">
              <li>Short prompts to react to, instead of a blank canvas.</li>
              <li>Your answers saved as candidate problems you can curate before refining.</li>
              <li>A nudge to look at a part of your experience you may not have mined yet.</li>
            </ul>
          </div>

          <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2">
                <span>Preview the prompts</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    previewOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <ol className="flex flex-col gap-2 list-none m-0 p-0">
                {lens.prompts.map((prompt, i) => (
                  <li
                    key={prompt.id}
                    className="rounded-lg border bg-card p-3 flex items-start gap-3"
                  >
                    <span className="flex items-center justify-center h-7 w-7 rounded-full border-2 border-primary/40 text-base font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-medium leading-snug">{prompt.question}</p>
                      {prompt.contextOnly && (
                        <p className="text-base italic">
                          Sets context for the prompts that follow. Not saved as a candidate.
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button asChild className="gap-2">
              <Link
                href={
                  isSingleForm
                    ? `/problems/reflect/${lens.id}/capture`
                    : `/problems/reflect/${lens.id}/prompts`
                }
              >
                Start lens
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
