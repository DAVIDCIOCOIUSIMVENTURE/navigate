"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { LifePromptExample } from "@/data/reflectLifeExamples"

/**
 * Tabbed example list for a single Reflect prompt. Mirrors the "Case Studies"
 * pattern used on solution validation steps, but renamed to "Examples" for
 * Reflect since these are illustrative personas rather than real companies.
 */
export function PromptExamples({ examples }: { examples: LifePromptExample[] }) {
  if (examples.length === 0) return null

  return (
    <div className="rounded-xl border bg-muted p-6 flex flex-col gap-4">
      <p className="text-base">
        Examples of the kind of answer this prompt is meant to surface. They are not
        templates to copy: they show the level of specificity that makes an answer useful.
      </p>
      <Tabs defaultValue={examples[0].experience} className="flex flex-col gap-4">
        <TabsList className="self-center bg-background flex-wrap h-auto gap-1">
          {examples.map((ex) => {
            const Icon = ex.icon
            return (
              <TabsTrigger key={ex.experience} value={ex.experience} className="gap-1.5">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {ex.experience}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {examples.map((ex) => {
          const Icon = ex.icon
          return (
            <TabsContent key={ex.experience} value={ex.experience}>
              <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                        ex.iconBg ?? "bg-muted"
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-base font-semibold">{ex.experience}</p>
                </div>
                <div>
                  <span className="text-base font-semibold uppercase tracking-wide">
                    Observation
                  </span>
                  <p className="mt-0.5 text-base">{ex.answer}</p>
                </div>
                <div className="rounded-md border bg-muted p-3">
                  <span className="text-base font-semibold uppercase tracking-wide">
                    Why it matters
                  </span>
                  <p className="mt-1 text-base">{ex.whyItMatters}</p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
