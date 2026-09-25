"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CASE_STUDY_PANEL_CLASS } from "@/components/strategy-tabs"
import type { GuidedInspiration } from "@/data/guidedDiscovery"

/**
 * The Inspiration tab of a Guided discovery picker question: one inner tab
 * per theme ("Work friction", "Money"), each saying what in that theme
 * counts and giving one example. Drawn as the case studies beside the
 * Explore and Identify Solutions strategies are, on the same muted panel,
 * and read only like them: the answer is given on the picker, not here.
 */
export function GuidedInspirationPanel({ inspirations }: { inspirations: GuidedInspiration[] }) {
  if (inspirations.length === 0) return null
  return (
    <div className={`${CASE_STUDY_PANEL_CLASS} gap-5`}>
      <p className="text-base text-foreground">
        A few themes to think along. Open each for what to look for and an example, then answer under &ldquo;Your answer&rdquo;.
      </p>
      <Tabs defaultValue={inspirations[0].theme} className="flex flex-col gap-4">
        <TabsList className="self-center bg-background h-auto flex-wrap">
          {inspirations.map((item) => (
            <TabsTrigger key={item.theme} value={item.theme} className="text-base">
              {item.theme}
            </TabsTrigger>
          ))}
        </TabsList>
        {inspirations.map((item) => (
          <TabsContent key={item.theme} value={item.theme}>
            <div className="rounded-lg border bg-card p-6 flex flex-col gap-5">
              <p className="text-base font-semibold text-foreground">{item.theme}</p>
              <div>
                <span className="text-base font-semibold text-foreground">What to look for</span>
                <p className="mt-1 text-base text-foreground">{item.lookFor}</p>
              </div>
              <div className="rounded-md border bg-muted p-3">
                <span className="text-base font-semibold text-foreground">For example</span>
                <p className="mt-1 text-base text-foreground">&ldquo;{item.example}&rdquo;</p>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
