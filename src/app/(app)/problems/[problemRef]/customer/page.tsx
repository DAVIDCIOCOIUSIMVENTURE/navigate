"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { Users, Target, MapPin, Briefcase, Filter } from "lucide-react"

export default function CustomerSegmentPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problemId, segmentSize, setSegmentSize, customerDescription, setCustomerDescription } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )
  const customerSegments = problem?.customerSegments ?? []

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Users}>Customer Size</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-md text-muted-foreground">
          <p>
            Who exactly experiences this problem? The more precisely you define your customer, the
            easier it becomes to validate the problem, estimate the market, and eventually craft a
            solution that resonates.
          </p>
          <p>
            Avoid broad labels like &quot;everyone&quot; or &quot;businesses&quot; —
            narrow down until you can picture a real person. A well-defined customer isn&apos;t just
            a demographic — it&apos;s someone whose daily life you understand well enough to describe
            their frustrations, habits, and the workarounds they already use.
          </p>
        </div>

        {customerSegments.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Defined Segments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {customerSegments.map((segment) => (
                <span key={segment} className="rounded-md bg-muted px-2.5 py-1 text-md">
                  {segment}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 text-md text-muted-foreground">
          <p className="font-medium text-foreground">How to narrow down your customer</p>
          <p>
            Start broad, then layer on filters until you reach a specific group. Each filter
            sharpens your focus and makes the problem more concrete.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 shrink-0">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">Role &amp; industry</strong> — what do they do, and in which sector? (e.g. freelance graphic designers, NHS nurses, SaaS founders)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shrink-0">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">Demographics &amp; geography</strong> — age range, location, income level, company size</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0">
                <Target className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">Behaviour &amp; situation</strong> — what triggers the problem? When and how often does it happen?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 shrink-0">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">Urgency &amp; willingness</strong> — how badly do they need a solution? Are they already spending time or money trying to fix it?</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-2 text-md text-muted-foreground">
          <p className="font-medium text-foreground">Why this matters</p>
          <p>
            A vague customer means vague problems and vague solutions. When you can describe
            your customer precisely — their role, context, and pain points — you unlock sharper
            insights at every later stage: better alternatives analysis, more accurate market sizing,
            and a problem statement that actually resonates.
          </p>
          <p>
            Great founders don&apos;t try to serve everyone. They pick a narrow, well-understood
            group, solve their problem exceptionally well, and expand from there.
          </p>
        </div>

        <h3 className="mt-4 text-xl font-bold text-foreground">What you&apos;ll do</h3>
        <div className="flex flex-col gap-3 text-md text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">1</span>
            <p><strong className="text-foreground">Describe your customer</strong> — paint a clear picture of who experiences this problem, using the filters above to be as specific as possible.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">2</span>
            <p><strong className="text-foreground">Estimate the segment size</strong> — how many people fit this description? An order-of-magnitude is fine.</p>
          </div>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Who is your customer?</h3>

        <div className="bg-primary rounded-xl p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="customer-description" className="text-sm font-medium text-white">
                Describe your customer
              </label>
              <Textarea
                id="customer-description"
                placeholder="e.g. Early-career freelance designers (1–3 years experience) in the UK who struggle to price their work competitively..."
                value={customerDescription}
                onChange={(e) => setCustomerDescription(e.target.value)}
                rows={3}
                className="text-md bg-white border-white text-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="segment-size" className="text-sm font-medium text-white">
                Estimated number of people affected
              </label>
              <Input
                id="segment-size"
                type="number"
                min={0}
                placeholder="e.g. 500000"
                value={segmentSize ?? ""}
                onChange={(e) => {
                  const val = e.target.value
                  setSegmentSize(val === "" ? null : Number(val))
                }}
                className="text-md h-9 max-w-xs bg-white border-white text-foreground"
              />
              <p className="text-sm text-white/70 mt-1">
                An order-of-magnitude estimate is fine — thousands, hundreds of thousands, or millions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
