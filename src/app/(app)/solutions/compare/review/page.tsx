"use client"

import { useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrafficLightDot } from "@/components/traffic-light"
import {
  IMPORTANCE_LEVELS,
  SOLUTION_METRICS,
  TRAFFIC_LIGHTS,
  TRAFFIC_LIGHT_META,
  formatWeightedScore,
  rankSolutions,
} from "@/lib/solution-comparison"
import { cn } from "@/lib/utils"
import type { TrafficLight } from "@/types/solution"
import { ArrowLeft, ExternalLink, LayoutTemplate, Lightbulb, Target } from "lucide-react"
import { getAdjacentSteps } from "../steps"

/**
 * The read-only close of Compare solutions: the weights that were chosen,
 * then every solution grouped by its traffic light (green first) with its
 * weighted score, and the ones still without a light at the end.
 */
export default function CompareReviewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { prevPath } = getAdjacentSteps(pathname)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const weights = useSelector((state: RootState) => state.solutionComparison.weights)

  const ranked = useMemo(() => rankSolutions(solutions, weights), [solutions, weights])

  const groups = useMemo(() => {
    const byLight = new Map<TrafficLight | null, typeof ranked>()
    for (const light of [...TRAFFIC_LIGHTS, null]) byLight.set(light, [])
    for (const entry of ranked) {
      byLight.get(entry.solution.trafficLight ?? null)?.push(entry)
    }
    return byLight
  }, [ranked])

  const problemTitle = (problemId: number) => {
    const problem = problems.find((p) => p.id === problemId)
    return problem ? problem.title || `Problem #${problem.id}` : null
  }

  const renderGroup = (light: TrafficLight | null) => {
    const entries = groups.get(light) ?? []
    const heading = light ? TRAFFIC_LIGHT_META[light] : null
    return (
      <section key={light ?? "none"} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {light ? <TrafficLightDot light={light} className="h-4 w-4" /> : null}
          <h3 className={cn("text-xl font-bold", heading ? heading.textClass : "text-foreground")}>
            {heading ? `${heading.label}: ${heading.description.replace(/\.$/, "")}` : "Not yet given a light"}
          </h3>
          <span className="text-base">({entries.length})</span>
        </div>
        {entries.length === 0 ? (
          <p className="text-base italic opacity-60">None.</p>
        ) : (
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {entries.map(({ solution, score, rank }) => {
              const problem = problemTitle(solution.problemId)
              return (
                <li key={solution.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
                  <span className="text-base font-semibold w-8 shrink-0">#{rank}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-base font-medium truncate">{solution.title || "Untitled solution"}</span>
                    </div>
                    {problem && (
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-tertiary shrink-0" />
                        <span className="text-base truncate">{problem}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-base font-medium whitespace-nowrap">{formatWeightedScore(score)}</span>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/solutions/${solution.id}`)}>
                    View canvas
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    )
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0 space-y-6">
        <CardTitle icon={LayoutTemplate}>Review</CardTitle>
        <p className="text-base">
          A read-only overview of how you weighed the metrics and where each solution landed. The lights show on the Solutions page, where you can sort by them.
        </p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-foreground">Your weights</h3>
          <div className="flex flex-wrap gap-2">
            {SOLUTION_METRICS.map((metric) => {
              const Icon = metric.icon
              const level = IMPORTANCE_LEVELS.find((l) => l.value === weights[metric.key])
              return (
                <span key={metric.key} className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-base">
                  <Icon className="h-3.5 w-3.5 text-secondary-brand" aria-hidden="true" />
                  <span className="font-medium">{metric.label}</span>
                  <span>{level?.label ?? "Important"}</span>
                </span>
              )
            })}
          </div>
        </section>

        {[...TRAFFIC_LIGHTS, null].map((light) => renderGroup(light))}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          <Button
            variant="outline"
            className="bg-[#fcfbf8] border-tertiary/40 text-tertiary hover:bg-tertiary/5 hover:text-tertiary"
            onClick={() => router.push("/solutions")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Back to Solutions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
