"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, X, PieChart } from "lucide-react"

export default function MarketSegmentPage() {
  const [segment, setSegment] = useState("")
  const [description, setDescription] = useState("")

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

        <div className="rounded-lg border p-8 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">What you&apos;ll do here</h3>
          <p className="text-sm">
            Name and describe the specific group of people you want to focus on. This segment becomes the lens through
            which you&apos;ll explore problems in the next steps.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Examples</p>
            <div className="flex flex-col gap-2">
              {[
                {
                  title: "Gig economy workers",
                  description: "People in platform-based work (delivery, rideshare, freelancing) without access to sick pay, pensions, or employment protections.",
                },
                {
                  title: "First-generation university students",
                  description: "Students whose parents did not attend university, navigating applications, finance, and campus life without family guidance.",
                },
                {
                  title: "Small restaurant owners",
                  description: "Independent food businesses squeezed by high fees from third-party delivery platforms and rising ingredient costs.",
                },
              ].map((ex) => (
                <div key={ex.title} className="rounded-md bg-muted/40 px-3 py-2">
                  <p className="text-sm font-medium">{ex.title}</p>
                  <p className="text-sm text-muted-foreground">{ex.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-border my-3" />
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-lg font-semibold text-primary">Your turn</h3>
          <p className="text-sm">Define your market segment</p>
        </div>
        <div className="rounded-lg bg-primary p-8 flex flex-col gap-4 text-primary-foreground">
          <p className="text-lg font-semibold flex items-center gap-2"><PieChart className="h-5 w-5" />Market Segment</p>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Market segment title</label>
            <div className="relative">
              <Input
                placeholder="e.g. Gig economy workers"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className={`bg-white border-white/20 text-foreground placeholder:text-muted-foreground${segment ? " pr-8" : ""}`}
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
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Describe your market segment</label>
            <Textarea
              placeholder="What characteristics define this group? What situation are they in?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
