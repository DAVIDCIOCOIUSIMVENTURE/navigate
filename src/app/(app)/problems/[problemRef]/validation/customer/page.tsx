"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblem, getAdjacentSteps } from "../context"
import { CUSTOMER_CASE_STUDIES } from "./case-studies"
import { DimensionChips } from "@/components/dimension-chips"
import { CustomerStrategy } from "@/components/problem-strategies/customer-strategy"
import { Users, Target, MapPin, Briefcase, Filter } from "lucide-react"

export default function CustomerSegmentPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problemId } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )
  const customerSegments = problem?.customers ?? []

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Users} iconBg="bg-secondary-brand">Define your customer</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="@container">
          <div className="flex flex-col gap-6 @[800px]:flex-row @[800px]:items-center">
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <p className="text-base text-foreground leading-relaxed">
                Who exactly experiences this problem? The more precisely you define your customer, the
                easier it becomes to validate the problem, estimate the market, and eventually craft a
                solution that resonates.
              </p>
              <p className="text-base text-foreground leading-relaxed">
                Avoid broad labels like &quot;everyone&quot; or &quot;businesses.&quot;
                Narrow down until you can picture a real person. A well-defined customer isn&apos;t just
                a demographic, it&apos;s someone whose daily life you understand well enough to describe
                their frustrations, habits, and the workarounds they already use.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/23-customer.svg"
              alt=""
              className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
            />
          </div>
        </div>

        {customerSegments.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Defined Segments
            </p>
            <DimensionChips columnId="customers" ids={customerSegments} />
          </div>
        )}

        <div className="flex flex-col gap-3 text-base">
          <p className="text-xl font-bold text-foreground">How to narrow down your customer</p>
          <p>
            Start broad, then layer on filters until you reach a specific group. Each filter
            sharpens your focus and makes the problem more concrete.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-900 shrink-0 mt-0.5">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Role &amp; industry</p>
                <p className="text-base">What do they do, and in which sector? (e.g. freelance graphic designers, NHS nurses, SaaS founders)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 shrink-0 mt-0.5">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Demographics &amp; geography</p>
                <p className="text-base">Age range, location, income level, company size</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-600 shrink-0 mt-0.5">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Behaviour &amp; situation</p>
                <p className="text-base">What triggers the problem? When and how often does it happen?</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-800 shrink-0 mt-0.5">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Urgency &amp; willingness</p>
                <p className="text-base">How badly do they need a solution? Are they already spending time or money trying to fix it?</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-2 text-base">
          <p className="font-medium text-foreground">Why this matters</p>
          <p>
            A vague customer means vague problems and vague solutions. When you can describe
            your customer precisely, their role, context, and pain points, you unlock sharper
            insights at every later stage: better alternatives analysis, more accurate market sizing,
            and a problem statement that actually resonates.
          </p>
          <p>
            Great founders don&apos;t try to serve everyone. They pick a narrow, well-understood
            group, solve their problem exceptionally well, and expand from there.
          </p>
        </div>

        <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
        <div className="flex flex-col gap-3 text-base">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-800 text-white text-base font-bold shrink-0">1</span>
            <div>
              <p className="font-semibold text-foreground">Describe your customer</p>
              <p className="text-base">Paint a clear picture of who experiences this problem, using the filters above to be as specific as possible. You will size the population later, on the market step.</p>
            </div>
          </div>
        </div>

        <hr className="border-border/40 my-4" />

        <div className="flex flex-col gap-2 items-center text-center">
          <h3 className="text-xl font-bold"><span className="text-primary">Your Turn:</span> Who is your customer?</h3>
          <p className="text-base max-w-xl">
            Describe your customer segment in the box below. Be as specific as you can: a clearer picture here makes every later step easier.
          </p>
        </div>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <CustomerStrategy />
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border bg-muted p-8 flex flex-col gap-4">
              <p className="text-base text-foreground">
                See how successful companies defined their early customer. Notice how specific they were; they didn&apos;t try to serve everyone. Use these examples as inspiration when writing your own strategy.
              </p>
              <Tabs defaultValue={CUSTOMER_CASE_STUDIES[0]?.company} className="flex flex-col gap-4">
                <TabsList className="self-center bg-background">
                  {CUSTOMER_CASE_STUDIES.map((cs) => {
                    const Icon = cs.icon
                    return (
                      <TabsTrigger
                        key={cs.company}
                        value={cs.company}
                        className="gap-1.5"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cs.company}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                {CUSTOMER_CASE_STUDIES.map((cs) => {
                  const Icon = cs.icon
                  return (
                    <TabsContent key={cs.company} value={cs.company}>
                      <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${cs.iconBg}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-base font-semibold text-foreground">{cs.company}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-y-3 text-base">
                          <div>
                            <span className="text-base font-semibold text-foreground">Customer Description</span>
                            <p className="mt-1 text-base text-foreground">{cs.customerDescription}</p>
                          </div>
                          <div>
                            <span className="text-base font-semibold text-foreground">Why This Works</span>
                            <p className="mt-1 text-base text-foreground">{cs.whyThisWorks}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )
                })}
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
