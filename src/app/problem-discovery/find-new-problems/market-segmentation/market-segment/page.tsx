"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

export default function MarketSegmentPage() {
  const [segment, setSegment] = useState("")

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Market Segmentation</span>
        </div>
        <h2 className="text-xl font-semibold">Market Segment</h2>

        <div className="flex flex-col gap-3 text-sm">
          <p>
            A <span className="font-medium text-foreground">market segment</span> is a distinct group of people who
            share common characteristics — such as their role, life stage, situation, or behaviour — that means they
            tend to experience the same kinds of problems. The more specific your segment, the easier it is to uncover
            frustrations that are genuine and underserved.
          </p>
          <p>
            Segments can be defined by <span className="font-medium">who people are</span> (age, occupation,
            income), <span className="font-medium">what they do</span> (habits, buying behaviour),{" "}
            <span className="font-medium">what they believe</span> (values, lifestyle), or{" "}
            <span className="font-medium">where they are</span> (location, context).
          </p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What you&apos;ll do here</p>
          <p className="text-sm">
            Name and describe the specific group of people you want to focus on. This segment becomes the lens through
            which you&apos;ll explore problems in the next steps.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Describe your market segment</label>
          <div className="relative">
            <Input
              placeholder="e.g. Remote freelancers aged 25–40"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className={segment ? "pr-8" : ""}
            />
            {segment && (
              <button
                onClick={() => setSegment("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "Freelance designers",
              "First-generation students",
              "Small restaurant owners",
              "Gig economy workers",
              "Parents of young children",
              "Retirees managing finances",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setSegment(example)}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
