"use client"

import { useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrafficLightDot } from "@/components/traffic-light"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { selectComparisonWeights } from "@/store/solution-comparison-model"
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
import { ArrowLeft, ExternalLink, LayoutTemplate, Lightbulb } from "lucide-react"
import { getAdjacentSteps } from "../steps"

/**
 * The read-only close of Compare solutions: the weights that were chosen,
 * then every solution in the project grouped by its traffic light (green
 * first) with its weighted score, and the ones not rated yet at the end.
 */
export default function CompareReviewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { projectId, problem } = useProjectScope()
  const { prevPath } = getAdjacentSteps(pathname, projectId)
  const allSolutions = useSelector((state: RootState) => state.solutions.solutions)
  const weights = useSelector((state: RootState) => selectComparisonWeights(state, projectId))

  const solutions = useMemo(
    () => (problem ? allSolutions.filter((s) => s.problemId === problem.id) : []),
    [allSolutions, problem],
  )
  const ranked = useMemo(() => rankSolutions(solutions, weights), [solutions, weights])

  const groups = useMemo(() => {
    const byLight = new Map<TrafficLight | null, typeof ranked>()
    for (const light of [...TRAFFIC_LIGHTS, null]) byLight.set(light, [])
    for (const entry of ranked) {
      byLight.get(entry.solution.trafficLight ?? null)?.push(entry)
    }
    return byLight
  }, [ranked])

  const renderGroup = (light: TrafficLight | null) => {
    const entries = groups.get(light) ?? []
    const heading = light ? TRAFFIC_LIGHT_META[light] : null
    return (
      <section key={light ?? "none"} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {light ? <TrafficLightDot light={light} className="h-4 w-4" /> : null}
          <h3 className={cn("text-xl font-bold", heading ? heading.textClass : "text-foreground")}>
            {heading ? `${heading.label}: ${heading.description.replace(/\.$/, "")}` : "Not rated yet"}
          </h3>
          <span className="text-base">({entries.length})</span>
        </div>
        {entries.length === 0 ? (
          <p className="text-base italic opacity-60">None.</p>
        ) : (
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {entries.map(({ solution, score, rank }) => (
              <li key={solution.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
                <span className="text-base font-semibold w-8 shrink-0">#{rank}</span>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-base font-medium truncate">{solution.title || "Untitled solution"}</span>
                </div>
                <span className="text-base font-medium whitespace-nowrap">{formatWeightedScore(score)}</span>
                <Button variant="outline" size="sm" onClick={() => router.push(projectRoutes.solution(projectId, solution.id))}>
                  View canvas
                </Button>
              </li>
            ))}
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
          A read-only overview of how you weighed the metrics and where each solution landed. The lights show in the project&apos;s solutions list, where you can sort by them.
        </p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="rounded-xl border bg-muted p-6 flex flex-col gap-6">
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
        </div>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          <Button
            variant="outline"
            className="bg-[#fcfbf8] border-tertiary/40 text-tertiary hover:bg-tertiary/5 hover:text-tertiary"
            onClick={() => router.push(projectRoutes.page(projectId))}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Back to the project
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
