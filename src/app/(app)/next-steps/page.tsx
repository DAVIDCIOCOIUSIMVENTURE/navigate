"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { getProblemLabel } from "@/store/problems-model"
import { Sparkles, Lightbulb, Target, ChevronRight } from "lucide-react"
import { NEXT_STEPS_TOPICS, NEXT_STEPS_TOPIC_ICON_BG, type NextStepsTopic } from "@/data/nextStepsData"
import { getNextStepsTopicIcon } from "@/config/navigation"

export default function NextStepsPage() {
  const router = useRouter()
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const customByColumn = useSelector((state: RootState) => state.customBrainstormItems.byColumn)
  const selfDiscoveryItems = useSelector((state: RootState) => state.selfDiscoveryItems.items)
  const size = useContainerSize()
  const roomy = size !== "narrow"

  const problemsWithSolutions = problems
    .map((p) => ({
      problem: p,
      solutions: solutions.filter((s) => s.problemId === p.id),
    }))
    .filter((entry) => entry.solutions.length > 0)
    .sort((a, b) => b.solutions.length - a.solutions.length)

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardContent className={cn("flex-1 flex flex-col gap-8 overflow-y-auto min-h-0", roomy ? "p-10" : "p-6")}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground italic flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-1" aria-hidden="true" />
            <span>You&apos;ve found problems worth solving and solutions worth testing. Here&apos;s where most founders go next.</span>
          </p>
          <p className="text-base text-foreground leading-relaxed">
            This section is for reference. There&apos;s nothing to fill in: just guidance on how to take what you&apos;ve already
            built in Navigate and turn it into a real-world experiment, a prototype, or a commitment.
            Use it as a checkpoint before you sink time and money into the wrong direction.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-foreground">Your solutions so far</h3>
          {problemsWithSolutions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center flex flex-col gap-3 items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                <Lightbulb className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">No solutions to summarise yet</p>
                <p className="text-sm text-muted-foreground">
                  Once you&apos;ve generated and validated a few solutions, they&apos;ll appear here grouped by the problem they solve.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/solutions">
                  Go to Solutions
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {problemsWithSolutions.map(({ problem, solutions: linked }) => {
                const label = problem.description || getProblemLabel(problem, customByColumn, selfDiscoveryItems) || `Problem #${problem.id}`
                return (
                  <div key={problem.id} className="rounded-lg border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b">
                      <Target className="h-4 w-4 text-primary shrink-0" />
                      <Link
                        href={`/problems/${problem.id}`}
                        className="flex-1 min-w-0 text-sm font-medium truncate hover:underline"
                      >
                        {label}
                      </Link>
                      <StatusPill status={problem.validationStatus.replace("_", " ")} />
                      <span className="text-xs text-muted-foreground shrink-0">
                        {linked.length} solution{linked.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <ul className="divide-y">
                      {linked.map((s) => {
                        const solutionLabel = s.title || `Solution #${s.id}`
                        return (
                          <li key={s.id}>
                            <Link
                              href={`/solutions/${s.id}`}
                              className="flex items-center gap-2 px-4 py-2 group hover:bg-accent/40 transition-colors"
                            >
                              <Lightbulb className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="flex-1 min-w-0 text-sm truncate group-hover:underline">
                                {solutionLabel}
                              </span>
                              <StatusPill status={s.validationStatus.replace("_", " ")} />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-foreground">Where to go from here</h3>
          <div className={cn("grid gap-3", roomy ? "grid-cols-2" : "grid-cols-1")}>
            {NEXT_STEPS_TOPICS.map((topic) => (
              <TopicCard key={topic.url} topic={topic} onClick={() => router.push(`/next-steps/${topic.url}`)} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TopicCard({ topic, onClick }: { topic: NextStepsTopic; onClick: () => void }) {
  const Icon = getNextStepsTopicIcon(topic.iconKey)
  const bgClass = NEXT_STEPS_TOPIC_ICON_BG[topic.url] ?? "bg-primary"
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left flex items-start gap-3 p-4 rounded-lg border hover:border-primary hover:bg-accent/40 transition-colors h-full"
    >
      <span className={cn("flex items-center justify-center w-9 h-9 rounded-lg shrink-0", bgClass)}>
        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{topic.title}</p>
        <p className="text-sm text-muted-foreground italic mt-0.5 flex items-start gap-1.5">
          <Sparkles className="h-3 w-3 shrink-0 mt-1" aria-hidden="true" />
          <span>{topic.tagline}</span>
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
    </button>
  )
}

const statusColors: Record<string, string> = {
  unvalidated: "bg-gray-100 text-gray-700",
  "in progress": "bg-amber-100 text-amber-700",
  valid: "bg-green-100 text-green-700",
  invalid: "bg-red-100 text-red-700",
  unsure: "bg-yellow-100 text-yellow-700",
  "not started": "bg-gray-100 text-gray-700",
  pursue: "bg-green-100 text-green-700",
  revisit: "bg-amber-100 text-amber-700",
  abandon: "bg-red-100 text-red-700",
}

function StatusPill({ status }: { status: string }) {
  const colors = statusColors[status] ?? "bg-gray-100 text-gray-700"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize shrink-0 ${colors}`}>
      {status}
    </span>
  )
}
