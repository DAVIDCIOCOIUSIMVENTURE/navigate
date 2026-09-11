"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TrafficLightPicker } from "@/components/traffic-light"
import { startIdentifySolutions } from "@/lib/active-discovery-problem"
import {
  IMPORTANCE_LEVELS,
  SOLUTION_METRICS,
  formatWeightedScore,
  isMetricImportance,
  rankSolutions,
} from "@/lib/solution-comparison"
import { cn } from "@/lib/utils"
import type { Solution, TrafficLight } from "@/types/solution"
import { ArrowLeft, ArrowRight, Lightbulb, Plus, SlidersHorizontal, Target } from "lucide-react"
import { getAdjacentSteps } from "../steps"

/**
 * The hands-on step of Compare solutions. A compact slider strip at the top
 * asks how important each metric is; the table underneath, which gets most
 * of the page, ranks every solution by the weighted score those weights
 * produce, re-ordering live, and lets the user give each one a traffic light. The weights persist in the `solutionComparison`
 * model, the light on the `Solution` itself so the library table can show
 * and sort by it.
 */
export default function RateSolutionsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const weights = useSelector((state: RootState) => state.solutionComparison.weights)
  const [problemFilter, setProblemFilter] = useState<"all" | number>("all")

  const problemOptions = useMemo(() => {
    const ids = new Set(solutions.map((s) => s.problemId))
    return problems.filter((p) => ids.has(p.id))
  }, [solutions, problems])

  const ranked = useMemo(() => {
    const pool = problemFilter === "all" ? solutions : solutions.filter((s) => s.problemId === problemFilter)
    return rankSolutions(pool, weights)
  }, [solutions, weights, problemFilter])

  const setLight = (solution: Solution, trafficLight: TrafficLight | null) => {
    dispatch.solutions.update({ id: solution.id, patch: { trafficLight } })
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0 space-y-6">
        <CardTitle icon={SlidersHorizontal}>Rate solutions</CardTitle>
        <p className="text-base">
          Slide each metric to say how much it should count (cost and time to implement are turned round, so a cheaper, faster solution always scores higher), then work down the ranked list and give each solution a light: green to pursue, amber to keep considering, red to park.
        </p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <section
          aria-label="How important is each metric to you?"
          className="rounded-xl bg-secondary-brand p-4 text-white"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            {SOLUTION_METRICS.map((metric) => {
              const Icon = metric.icon
              const value = weights[metric.key]
              const level = IMPORTANCE_LEVELS.find((l) => l.value === value)
              return (
                <div key={metric.key} className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="text-base font-semibold truncate" title={metric.scaleNote}>{metric.label}</span>
                    </span>
                    <span className={cn("text-base whitespace-nowrap", value === 0 && "opacity-70")}>{level?.label}</span>
                  </div>
                  <Slider
                    min={0}
                    max={IMPORTANCE_LEVELS.length - 1}
                    step={1}
                    value={[value]}
                    onValueChange={([raw]) => {
                      if (isMetricImportance(raw)) {
                        dispatch.solutionComparison.updateWeight({ key: metric.key, value: raw })
                      }
                    }}
                    thumbLabel={`Importance of ${metric.label.toLowerCase()}: ${level?.label ?? ""}`}
                  />
                </div>
              )
            })}
          </div>
        </section>

        <section aria-label="Ranked solutions" className="flex flex-col gap-4">
          {problemOptions.length > 1 && (
            <div className="flex justify-end">
              <Select
                value={problemFilter === "all" ? "all" : String(problemFilter)}
                onValueChange={(value) => setProblemFilter(value === "all" ? "all" : Number(value))}
              >
                <SelectTrigger className="h-8 w-64 text-sm" aria-label="Filter by problem">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All problems</SelectItem>
                  {problemOptions.map((problem) => (
                    <SelectItem key={problem.id} value={String(problem.id)}>
                      {problem.title || `Problem #${problem.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {solutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-16">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-brand">
                <Lightbulb className="h-8 w-8 text-secondary-brand-foreground" />
              </div>
              <div className="text-center flex flex-col gap-2 max-w-sm">
                <h2 className="text-lg font-semibold">No solutions to compare yet</h2>
                <p className="text-base">Identify and validate a few solutions first, then come back here to weigh them against each other.</p>
              </div>
              <Button onClick={() => startIdentifySolutions(router.push)} size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Identify solutions
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="w-full">Solution</TableHead>
                    {SOLUTION_METRICS.map((metric) => {
                      const Icon = metric.icon
                      return (
                        <TableHead key={metric.key} className="w-32">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                <Icon className="h-3.5 w-3.5 text-secondary-brand" />
                                {metric.label}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{metric.scaleNote}</TooltipContent>
                          </Tooltip>
                        </TableHead>
                      )
                    })}
                    <TableHead className="w-44">Weighted score</TableHead>
                    <TableHead className="w-36">Traffic light</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranked.map(({ solution, score, rank }, rowIndex) => {
                    const problem = problems.find((p) => p.id === solution.problemId)
                    const filled = score == null ? 0 : Math.round(score)
                    return (
                      <TableRow key={solution.id} className={rowIndex % 2 === 1 ? "bg-muted/20" : undefined}>
                        <TableCell className="text-sm font-semibold">{rank}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                              {solution.title ? (
                                <span className="line-clamp-2 font-medium">{solution.title}</span>
                              ) : (
                                <span className="text-muted-foreground italic">Untitled solution</span>
                              )}
                            </div>
                            {problem && (
                              <div className="flex items-center gap-2">
                                <Target className="h-3.5 w-3.5 text-tertiary shrink-0" />
                                <span className="line-clamp-1">{problem.title || `Problem #${problem.id}`}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        {SOLUTION_METRICS.map((metric) => {
                          const raw = solution[metric.key]
                          return (
                            <TableCell key={metric.key} className={cn("text-sm whitespace-nowrap", weights[metric.key] === 0 && "opacity-40")}>
                              {raw == null ? <span className="text-muted-foreground">-</span> : `${raw} / 5`}
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-sm">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1" aria-hidden="true">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <span
                                  key={n}
                                  className={cn("h-2 flex-1 rounded", n <= filled ? "bg-secondary-brand" : "bg-muted")}
                                />
                              ))}
                            </div>
                            <span className="font-medium whitespace-nowrap">{formatWeightedScore(score)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TrafficLightPicker
                            value={solution.trafficLight ?? null}
                            onChange={(light) => setLight(solution, light)}
                            label={solution.title || `solution ${solution.id}`}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          {nextPath && (
            <Button onClick={() => router.push(nextPath)}>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
