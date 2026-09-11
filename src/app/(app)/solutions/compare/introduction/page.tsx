"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ListOrdered, SlidersHorizontal, TrafficCone } from "lucide-react"
import { getAdjacentSteps } from "../steps"

const STEPS = [
  {
    icon: SlidersHorizontal,
    title: "Say what matters to you",
    description: "Mark each of the four validation metrics (feasibility, impact, cost and time to implement) as essential, important, nice to have, or something to ignore.",
  },
  {
    icon: ListOrdered,
    title: "See your solutions ranked",
    description: "Every solution gets a weighted score from its metrics and the table re-orders as you change the weights. Cheaper and faster solutions score higher, not lower.",
  },
  {
    icon: TrafficCone,
    title: "Give each one a traffic light",
    description: "Green to pursue, amber to keep considering, red to park. The light shows on the Solutions page, where you can sort your solutions by it.",
  },
]

export default function CompareIntroductionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { nextPath } = getAdjacentSteps(pathname)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={BookOpen}>Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="@container">
          <div className="flex flex-col gap-6 @[800px]:flex-row @[800px]:items-center">
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <p className="text-base leading-relaxed">
                Validating a solution tells you whether it stands up on its own. Comparing solutions tells you which one to pursue first. This section lines up every solution you have scored, weighs those scores by what matters most to you, and lets you record a verdict on each.
              </p>
              <p className="text-base leading-relaxed">
                Two solutions with the same scores can deserve different verdicts: a bootstrapped team should favour cheap, quick wins, while a funded one can afford to chase impact. Setting the weights first makes that trade-off explicit, so the ranking reflects your situation rather than a generic average.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/16-success.svg"
              alt=""
              className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-foreground mb-1">How it works</h3>
          <div className="flex flex-col">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-brand">
                    <Icon className="h-3.5 w-3.5 text-secondary-brand-foreground" />
                  </div>
                  {index < STEPS.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className="flex flex-col gap-0.5 pb-5">
                  <p className="text-base font-medium leading-8 text-secondary-brand">{title}</p>
                  <p className="text-base leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-2">
          {nextPath && <Button onClick={() => router.push(nextPath)}>Get Started</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
