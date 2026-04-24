"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { FOUNDATIONS_SECTIONS, getFoundationsSection, type FoundationsCaseStudy, type FoundationsVideo } from "@/data/foundationsData"
import { getFoundationsSectionIcon } from "@/config/navigation"
import { ChevronLeft, ChevronRight, Play, AlertTriangle, CheckCircle2, ExternalLink, Sparkles } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

const SECTION_ICON_BG: Record<string, string> = {
  "why-the-right-idea": "bg-amber-500",
  "why-validate-the-problem": "bg-sky-500",
  "why-validate-the-solution": "bg-violet-500",
  "the-cost-of-skipping": "bg-rose-500",
  "when-it-goes-right": "bg-emerald-500",
}

export default function FoundationsSectionPage() {
  const params = useParams<{ sectionUrl: string }>()
  const router = useRouter()
  const size = useContainerSize()
  const roomy = size !== "narrow"

  const section = getFoundationsSection(params.sectionUrl)
  if (!section) {
    notFound()
  }

  const index = FOUNDATIONS_SECTIONS.findIndex((s) => s.url === section.url)
  const prev = index > 0 ? FOUNDATIONS_SECTIONS[index - 1] : null
  const next = index < FOUNDATIONS_SECTIONS.length - 1 ? FOUNDATIONS_SECTIONS[index + 1] : null

  const Icon = getFoundationsSectionIcon(section.iconKey)
  const bgClass = SECTION_ICON_BG[section.url] ?? "bg-primary"

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
        <CardTitle>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", bgClass)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("flex-1 flex flex-col gap-8 overflow-y-auto min-h-0", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground italic flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-1" aria-hidden="true" />
            <span>{section.tagline}</span>
          </p>
          <p className="text-md text-foreground leading-relaxed">{section.intro}</p>
        </div>

        {section.keyPoints.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground">Key points</h3>
            <ul className="flex flex-col gap-2">
              {section.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-md text-foreground leading-relaxed flex-1">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {section.videos.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground">Watch</h3>
            <div className={cn("grid gap-3", roomy && section.videos.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
              {section.videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {section.caseStudies.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground">Case studies</h3>
            <div className="flex flex-col gap-3">
              {section.caseStudies.map((cs) => (
                <CaseStudyCard key={cs.id} caseStudy={cs} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("shrink-0 flex items-center justify-between border-t gap-3", roomy ? "px-10 py-6" : "px-6 py-4")}>
        {prev ? (
          <Button variant="ghost" onClick={() => router.push(`/foundations/${prev.url}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {prev.shortTitle}
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => router.push("/foundations")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Intro
          </Button>
        )}
        {next ? (
          <Button onClick={() => router.push(`/foundations/${next.url}`)}>
            {next.shortTitle}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => router.push("/self-discovery")}>
            Continue to Self Discovery
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function VideoCard({ video }: { video: FoundationsVideo }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border overflow-hidden">
      <div className="relative aspect-video bg-muted flex items-center justify-center">
        {video.youtubeId ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.youtubeId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border">
              <Play className="h-5 w-5" />
            </div>
            <p className="text-xs">Video coming soon</p>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-foreground">{video.title}</p>
        {video.description && (
          <p className="text-xs text-muted-foreground mt-1">{video.description}</p>
        )}
      </div>
    </div>
  )
}

function CaseStudyCard({ caseStudy }: { caseStudy: FoundationsCaseStudy }) {
  const isRight = caseStudy.outcome === "went-right"
  const OutcomeIcon = isRight ? CheckCircle2 : AlertTriangle
  const outcomeLabel = isRight ? "What went right" : "What went wrong"
  const outcomeClasses = isRight
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{caseStudy.title}</p>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", outcomeClasses)}>
          <OutcomeIcon className="h-3 w-3" />
          {outcomeLabel}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{caseStudy.summary}</p>
      {caseStudy.link && (
        <a
          href={caseStudy.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline w-fit"
        >
          Read more
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}
