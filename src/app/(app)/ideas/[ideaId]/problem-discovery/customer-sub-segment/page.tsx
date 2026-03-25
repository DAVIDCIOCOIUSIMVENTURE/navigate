"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProblemDiscovery, getAdjacentSteps, type SubSegmentFields } from "../context"
import { USE_CASES } from "../use-cases"
import { UserSearch } from "lucide-react"

const FIELDS: {
  key: keyof SubSegmentFields
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  { key: "name", label: "Sub-Segment Name", placeholder: "e.g. Early-career Freelance Designers in the US..." },
  { key: "differentiators", label: "What Sets Them Apart", placeholder: "How do they differ from the broader segment?", multiline: true },
  { key: "specificContext", label: "Specific Context", placeholder: "What situation or environment are they in? e.g. remote-first, high-churn industry...", multiline: true },
  { key: "uniqueNeeds", label: "Unique Needs", placeholder: "What does this sub-segment need that the broader segment doesn't?", multiline: true },
]

type Tab = "strategy" | "use-cases"

export default function CustomerSubSegmentPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { customer, subSegment, setSubSegment } = useProblemDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)
  const [tab, setTab] = useState<Tab>("strategy")

  const set = (key: keyof SubSegmentFields, val: string) =>
    setSubSegment({ ...subSegment, [key]: val })

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={UserSearch}>Problem Discovery</CardEyebrow>
        <CardTitle icon={UserSearch} className="text-lg">Customer Sub-Segment</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-5">

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            A <strong className="text-foreground/80">customer sub-segment</strong> is a narrower slice of your broader customer group, people who share even more specific characteristics, circumstances, or needs. The tighter your focus, the easier it is to uncover sharp, actionable problems.
          </p>
          <p className="text-sm text-muted-foreground">
            Think about what makes a particular subset of your customer segment distinct: their career stage, geography, company size, life situation, or level of urgency. A well-defined sub-segment helps you avoid building for a vague average and instead target someone real.
          </p>
          <p className="text-sm text-muted-foreground">
            Use what you filled in on the <strong className="text-foreground/80">Customers</strong> page as your starting point; the sub-segment should feel like a zoomed-in version of the segment you already described.
          </p>
        </div>

        {customer.segmentName && (
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Based on segment: </span>
            <span className="font-medium">{customer.segmentName}</span>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setTab("strategy")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "strategy"
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Your Strategy
          </button>
          <button
            onClick={() => setTab("use-cases")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "use-cases"
                ? "bg-surface text-surface-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Use Cases
          </button>
        </div>

        {/* Tab content */}
        {tab === "strategy" && (
          <div className="rounded-xl border border-brand/20 bg-brand p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-brand-foreground">{FIELDS[0].label}</label>
              <Input
                placeholder={FIELDS[0].placeholder}
                value={subSegment[FIELDS[0].key]}
                onChange={(e) => set(FIELDS[0].key, e.target.value)}
                className="text-sm h-8 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELDS.filter((f) => f.multiline).map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-brand-foreground">{f.label}</label>
                  <Textarea
                    rows={4}
                    placeholder={f.placeholder}
                    value={subSegment[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="resize-none text-sm focus-visible:ring-1 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "use-cases" && (
          <div className="rounded-xl border border-surface/20 bg-surface p-5 flex flex-col gap-4">
            <p className="text-sm text-surface-foreground/70">
              These examples correspond to the customer segments on the previous page, each one narrowing the broader segment into a more specific, actionable group.
            </p>
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="rounded-lg border border-surface-foreground/10 bg-surface-foreground/10 p-4 flex flex-col gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-surface-foreground">{uc.title}</p>
                  <p className="text-xs text-surface-foreground/50 mt-0.5">
                    Segment: {uc.customer.segment}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Sub-Segment Name</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.subSegment.name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">What Sets Them Apart</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.subSegment.differentiators}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Specific Context</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.subSegment.specificContext}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Unique Needs</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.subSegment.uniqueNeeds}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : (
            <div />
          )}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
