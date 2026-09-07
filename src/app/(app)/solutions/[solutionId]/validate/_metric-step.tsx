"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAdjacentSteps, useSolution } from "./context"
import { MetricStrategy, type MetricContent, type MetricCaseStudy, type ScaleStop } from "@/components/solution-strategies/metric-strategy"
import { ProblemContextCard, SolutionContextCard } from "@/components/context-card"

export type { MetricContent, MetricCaseStudy, ScaleStop }

interface MetricStepProps {
  content: MetricContent
  value: number | null
  onChange: (val: number | null) => void
  iconBg?: string
}

export function MetricStep({ content, value, onChange, iconBg }: MetricStepProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionId, solution, problem } = useSolution()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionId)

  const { icon: Icon, title, summary, intro, readFor, pickLevel, yourTurnTitle, yourTurnBody, strategyTitle, strategyLabel, strategyDescription, scale, caseStudies, accent } = content

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Icon} iconBg={iconBg}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {(solution?.title || problem?.title || problem?.description) && (
          <div className="flex flex-col gap-2">
            {solution?.title && <SolutionContextCard solution={solution} />}
            <ProblemContextCard problem={problem} />
          </div>
        )}

        <div className="flex flex-col gap-3 text-base">
          <p>{summary}</p>
          {intro.map((para) => (
            <p key={para}>{para}</p>
          ))}

          <h3 className="mt-4 text-xl font-bold text-foreground">What to read for</h3>
          <div className="flex flex-col gap-3">
            {readFor.map((tile) => {
              const TileIcon = tile.icon
              return (
                <div key={tile.title} className="flex items-start gap-3">
                  <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5", tile.iconBg)}>
                    <TileIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{tile.title}</p>
                    <p className="text-base">{tile.body}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <h3 className="mt-4 text-xl font-bold text-foreground">How to pick a level</h3>
          <p>{pickLevel}</p>
        </div>

        <hr className="border-border/40 my-4" />

        <div className="flex flex-col gap-2 items-center text-center">
          <h3 className="text-xl font-bold"><span className="text-primary">Your Turn:</span> {yourTurnTitle}</h3>
          <p className="text-base max-w-xl">{yourTurnBody}</p>
        </div>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <MetricStrategy
              icon={Icon}
              strategyTitle={strategyTitle}
              strategyLabel={strategyLabel}
              strategyDescription={strategyDescription}
              scale={scale}
              value={value}
              onChange={onChange}
              accent={accent}
            />
          </TabsContent>

          <TabsContent value="case-studies">
            <CaseStudies caseStudies={caseStudies} scale={scale} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          {nextPath ? (
            <Button onClick={() => router.push(nextPath)}>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => router.push("/solutions")}>Finish</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CaseStudies({
  caseStudies,
  scale,
}: {
  caseStudies: MetricCaseStudy[]
  scale: ScaleStop[]
}) {
  if (caseStudies.length === 0) {
    return null
  }
  return (
    <div className="rounded-xl border bg-muted p-8 flex flex-col gap-4">
      <p className="text-base text-foreground">
        See how companies have thought about this metric. Each example shows the score they would have given, the reasoning behind it, and what happened next.
      </p>
      <Tabs defaultValue={caseStudies[0].company} className="flex flex-col gap-4">
        <TabsList className="self-center bg-background">
          {caseStudies.map((cs) => {
            const Icon = cs.icon
            return (
              <TabsTrigger
                key={cs.company}
                value={cs.company}
                className="gap-1.5"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cs.company}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {caseStudies.map((cs) => {
          const scaleStop = scale.find((s) => s.score === cs.score)
          const Icon = cs.icon
          return (
            <TabsContent key={cs.company} value={cs.company}>
              <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      cs.iconBg ?? "bg-muted",
                      cs.iconBg ? "text-white" : "text-foreground",
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-base font-semibold text-foreground">{cs.company}</p>
                  <span className="ml-auto rounded-full bg-primary text-primary-foreground px-3 py-0.5 text-base font-semibold">
                    Score {cs.score} / 5
                  </span>
                </div>
                <div>
                  <span className="text-base font-semibold uppercase tracking-wide text-foreground">Context</span>
                  <p className="mt-0.5 text-base text-foreground">{cs.context}</p>
                </div>
                <div className={cn("rounded-md border bg-card p-3")}>
                  <span className="text-base font-semibold uppercase tracking-wide text-foreground">
                    Reasoning ({scaleStop?.label ?? `Score ${cs.score}`})
                  </span>
                  <p className="mt-1 text-base text-foreground">{cs.reasoning}</p>
                </div>
                <div className="border-t pt-3 mt-1">
                  <span className="text-base font-semibold uppercase tracking-wide text-foreground">Outcome</span>
                  <p className="mt-0.5 text-base text-foreground">{cs.outcome}</p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
