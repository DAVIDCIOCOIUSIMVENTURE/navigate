"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams, useRouter, notFound } from "next/navigation"
import { NEXT_STEPS_TOPICS, getNextStepsTopic, type NextStepsApproach } from "@/data/nextStepsData"
import { getNextStepsTopicIcon } from "@/config/navigation"
import { ChevronLeft, ChevronRight, Sparkles, AlertTriangle } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function NextStepsTopicPage() {
  const params = useParams<{ topicUrl: string }>()
  const router = useRouter()
  const size = useContainerSize()
  const roomy = size !== "narrow"

  const topic = getNextStepsTopic(params.topicUrl)
  if (!topic) {
    notFound()
  }

  const index = NEXT_STEPS_TOPICS.findIndex((t) => t.url === topic.url)
  const prev = index > 0 ? NEXT_STEPS_TOPICS[index - 1] : null
  const next = index < NEXT_STEPS_TOPICS.length - 1 ? NEXT_STEPS_TOPICS[index + 1] : null

  const Icon = getNextStepsTopicIcon(topic.iconKey)

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
        <CardTitle icon={Icon}>{topic.title}</CardTitle>
      </CardHeader>
      <CardContent className={cn("flex-1 flex flex-col gap-8 overflow-y-auto min-h-0", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
        <div className="@container">
          <div className="flex flex-col gap-6 @[800px]:flex-row @[800px]:items-center">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <p className="text-base italic flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0 mt-1" aria-hidden="true" />
                <span>{topic.tagline}</span>
              </p>
              <p className="text-base text-foreground leading-relaxed">{topic.intro}</p>
            </div>
            {topic.url === "build-a-prototype" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/illustrations/21-toolbox.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
            {topic.url === "run-a-customer-test" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/illustrations/23-customer.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
            {topic.url === "map-a-learning-roadmap" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/illustrations/19-mindmap.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
            {topic.url === "decide-on-commitment" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/illustrations/04-terrain.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
          </div>
        </div>

        {topic.keyPoints.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground">Key points</h3>
            <ul className="flex flex-col gap-2">
              {topic.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-base text-foreground leading-relaxed flex-1">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {topic.approaches.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground">Ways to do this</h3>
            <div className={cn("grid gap-3", roomy && topic.approaches.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
              {topic.approaches.map((a) => (
                <ApproachCard key={a.title} approach={a} />
              ))}
            </div>
          </div>
        )}

        {topic.pitfalls.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground">Common pitfalls</h3>
            <ul className="flex flex-col gap-2">
              {topic.pitfalls.map((p, i) => (
                <li key={i} className="flex gap-3 items-start rounded-lg border border-destructive/20 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-base text-foreground leading-relaxed flex-1">{p}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("shrink-0 flex items-center justify-between border-t gap-3", roomy ? "px-10 py-6" : "px-6 py-4")}>
        {prev ? (
          <Button variant="ghost" onClick={() => router.push(`/next-steps/${prev.url}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {prev.shortTitle}
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => router.push("/next-steps")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Overview
          </Button>
        )}
        {next ? (
          <Button onClick={() => router.push(`/next-steps/${next.url}`)}>
            {next.shortTitle}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => router.push("/next-steps")}>
            Back to overview
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function ApproachCard({ approach }: { approach: NextStepsApproach }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border p-4 h-full">
      <p className="font-semibold text-foreground">{approach.title}</p>
      <p className="text-sm leading-relaxed">{approach.description}</p>
    </div>
  )
}
