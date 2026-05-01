"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAdjacentSteps, useSolutionValidation } from "./context"

export type ScaleStop = {
  score: number
  label: string
  description: string
}

export type MetricCaseStudy = {
  company: string
  context: string
  score: number
  reasoning: string
  outcome: string
  icon?: LucideIcon
}

export type MetricContent = {
  icon: LucideIcon
  title: string
  summary: string
  guidance: string[]
  scale: ScaleStop[]
  caseStudies: MetricCaseStudy[]
  accent: string
}

interface MetricStepProps {
  content: MetricContent
  value: number | null
  onChange: (val: number | null) => void
}

export function MetricStep({ content, value, onChange }: MetricStepProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionId, solution, problem } = useSolutionValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionId)

  const { icon: Icon, title, summary, guidance, scale, caseStudies, accent } = content

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Icon}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {(solution?.title || problem?.description) && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-2">
            {solution?.title && (
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solution</p>
                <p className="text-sm font-medium">{solution.title}</p>
              </div>
            )}
            {problem?.description && (
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-md leading-relaxed">{summary}</p>

        <Tabs defaultValue="guidance" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="guidance">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="guidance">
            <GuidanceBody
              guidance={guidance}
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
            <Button variant="outline" onClick={() => router.push(prevPath)}>
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

function GuidanceBody({
  guidance,
  scale,
  value,
  onChange,
  accent,
}: {
  guidance: string[]
  scale: ScaleStop[]
  value: number | null
  onChange: (val: number | null) => void
  accent: string
}) {
  return (
    <div className={cn("rounded-xl p-8 flex flex-col gap-6", accent)}>
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">How to think about it</h3>
        <ul className="flex flex-col gap-2">
          {guidance.map((g) => (
            <li key={g} className="text-sm text-white flex items-start gap-2">
              <span className="text-white/50 mt-0.5">&bull;</span>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Your score (1 to 5)</h3>
        <p className="text-sm text-white/80">Pick the row that best matches your situation. You can change it any time.</p>

        <div className="flex flex-col gap-2">
          {scale.map((stop) => {
            const selected = value === stop.score
            return (
              <button
                key={stop.score}
                type="button"
                onClick={() => onChange(selected ? null : stop.score)}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-left flex items-start gap-4 transition-colors",
                  selected
                    ? "bg-white border-white shadow-md"
                    : "bg-white/5 border-white/30 hover:bg-white/10 hover:border-white/60"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl font-bold",
                    selected ? "bg-primary/10 text-primary" : "bg-white/10 text-white"
                  )}
                >
                  {stop.score}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className={cn("text-sm font-semibold", selected ? "text-foreground" : "text-white")}>
                    {stop.label}
                  </p>
                  <p className={cn("text-sm", selected ? "text-muted-foreground" : "text-white/70")}>
                    {stop.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CaseStudies({
  caseStudies,
  scale,
}: {
  caseStudies: MetricCaseStudy[]
  scale: ScaleStop[]
}) {
  return (
    <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-4">
      <p className="text-md text-white">
        See how companies have thought about this metric. Each example shows the score they would have given, the reasoning behind it, and what happened next.
      </p>
      <div className="flex flex-col gap-4">
        {caseStudies.map((cs) => {
          const scaleStop = scale.find((s) => s.score === cs.score)
          const Icon = cs.icon
          return (
            <div
              key={cs.company}
              className="rounded-lg border border-white/10 bg-white/10 p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2.5">
                {Icon && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                <p className="text-md font-semibold text-white">{cs.company}</p>
                <span className="ml-auto rounded-full bg-white text-primary px-3 py-0.5 text-sm font-semibold">
                  Score {cs.score} / 5
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Context</span>
                <p className="mt-0.5 text-md text-white">{cs.context}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Reasoning ({scaleStop?.label ?? `Score ${cs.score}`})
                </span>
                <p className="mt-1 text-md text-white">{cs.reasoning}</p>
              </div>
              <div className="border-t border-white/10 pt-3 mt-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Outcome</span>
                <p className="mt-0.5 text-md text-white">{cs.outcome}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
