"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { FOUNDATIONS_SECTIONS } from "@/data/foundationsData"
import { BookOpen, ChevronRight, Sparkles } from "lucide-react"
import { getFoundationsSectionIcon } from "@/config/navigation"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

const SECTION_ICON_BG: Record<string, string> = {
  "why-the-right-idea": "bg-yellow-600",
  "why-validate-the-problem": "bg-teal-700",
  "why-validate-the-solution": "bg-blue-900",
  "the-cost-of-skipping": "bg-red-800",
  "when-it-goes-right": "bg-green-800",
}

export default function FoundationsPage() {
  const router = useRouter()
  const firstSectionUrl = FOUNDATIONS_SECTIONS[0].url
  const size = useContainerSize()
  const roomy = size !== "narrow"

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
        <CardTitle icon={BookOpen} iconBg="bg-secondary-brand">Introduction</CardTitle>
      </CardHeader>
      <CardContent className={cn("flex-1 flex flex-col gap-6 overflow-y-auto min-h-0", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <div className="flex flex-col gap-6 flex-1 min-w-0">
            <p className="text-base text-foreground leading-relaxed">
              This section is optional, but highly recommended. Before you dive into self discovery, problems, or solutions,
              it&apos;s worth understanding <span className="font-semibold">why</span> each of those stages matters, and what happens to founders who skip them.
            </p>
            <p className="text-base text-foreground leading-relaxed">
              What you&apos;ll find here: short pages, videos, and real case studies about the <span className="font-semibold">whys</span> and the <span className="font-semibold">whats</span>.
              Why finding the right idea matters. What goes wrong when people skip validation. What went well for founders who did the work. We don&apos;t cover <span className="italic">how</span> to solve things here: that&apos;s what the Problems and Solutions sections are for.
            </p>
          </div>
          <img
            src="/illustrations/13-validate-problem.svg"
            alt=""
            className="hidden lg:block w-96 h-auto shrink-0 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-foreground">Browse the sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FOUNDATIONS_SECTIONS.map((section) => {
              const Icon = getFoundationsSectionIcon(section.iconKey)
              const bgClass = SECTION_ICON_BG[section.url] ?? "bg-primary"
              return (
                <button
                  key={section.url}
                  onClick={() => router.push(`/foundations/${section.url}`)}
                  className="text-left flex items-start gap-3 p-4 rounded-lg border hover:border-primary hover:bg-accent/40 transition-colors"
                >
                  <span className={cn("flex items-center justify-center w-9 h-9 rounded-lg shrink-0", bgClass)}>
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{section.title}</p>
                    <p className="text-sm italic mt-0.5 flex items-start gap-1.5">
                      <Sparkles className="h-3 w-3 shrink-0 mt-1" aria-hidden="true" />
                      <span>{section.tagline}</span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className={cn("shrink-0 flex justify-between border-t gap-3", roomy ? "px-10 py-6" : "px-6 py-4")}>
        <Button variant="secondary-brand-outline" onClick={() => router.push("/self-discovery")}>
          Skip to Self Discovery
        </Button>
        <Button onClick={() => router.push(`/foundations/${firstSectionUrl}`)}>
          Start Reading
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
