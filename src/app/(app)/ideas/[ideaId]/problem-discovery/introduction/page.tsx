"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAdjacentSteps } from "../context"
import { BookOpen, Users, UserSearch, Briefcase, AlertCircle, CheckCircle2, Search } from "lucide-react"

const STEPS = [
  { icon: Search, title: "Problem Exploration", description: "Brainstorm from your existing knowledge and experience before diving into the structured flow.", bg: "bg-amber-100 dark:bg-amber-950", color: "text-amber-600 dark:text-amber-400" },
  { icon: Users, title: "Customers", description: "Define your target customer segment — who they are, what drives them, and what their daily lives look like.", bg: "bg-blue-100 dark:bg-blue-950", color: "text-blue-600 dark:text-blue-400" },
  { icon: UserSearch, title: "Customer Sub-Segment", description: "Narrow your segment to a more specific group with distinct needs, context, and differentiators.", bg: "bg-sky-100 dark:bg-sky-950", color: "text-sky-600 dark:text-sky-400" },
  { icon: Briefcase, title: "Jobs to Be Done", description: "Identify the tasks, goals, and outcomes your customers are trying to achieve.", bg: "bg-violet-100 dark:bg-violet-950", color: "text-violet-600 dark:text-violet-400" },
  { icon: AlertCircle, title: "Problems", description: "Uncover the pains, frustrations, and obstacles that get in the way of those outcomes.", bg: "bg-orange-100 dark:bg-orange-950", color: "text-orange-600 dark:text-orange-400" },
  { icon: CheckCircle2, title: "Summary", description: "Review your findings and capture a concise problem statement to guide your solution work.", bg: "bg-green-100 dark:bg-green-950", color: "text-green-600 dark:text-green-400" },
]

export default function IntroductionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { nextPath } = getAdjacentSteps(pathname, ideaId)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={BookOpen}>Problem Discovery</CardEyebrow>
        <CardTitle icon={BookOpen} className="text-lg">Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-6">

        <p className="text-sm text-muted-foreground leading-relaxed">
          Before building a solution, you need a clear picture of the problem. Problem Discovery helps you deeply understand who you&apos;re building for, what they&apos;re trying to accomplish, and where they&apos;re struggling — so you can ensure your idea addresses a real, meaningful need.
        </p>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What you&apos;ll work through</p>
          <div className="flex flex-col">
            {STEPS.map(({ icon: Icon, title, description, bg, color }, index) => (
              <div key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-5">
                  <p className="text-sm font-medium leading-8">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
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
