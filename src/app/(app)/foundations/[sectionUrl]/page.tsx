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

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
        <CardTitle>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-secondary-brand">
            <Icon className="h-5 w-5 text-white" />
          </div>
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("flex-1 flex flex-col gap-8 overflow-y-auto min-h-0", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
        <div className="@container">
          <div className="flex flex-col gap-6 @[800px]:flex-row @[800px]:items-center">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <p className="text-base italic flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0 mt-1" aria-hidden="true" />
                <span>{section.tagline}</span>
              </p>
              <p className="text-base text-foreground leading-relaxed">{section.intro}</p>
            </div>
            {section.url === "why-the-right-idea" && (
              <img
                src="/illustrations/18-sticky-wall.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
            {section.url === "why-validate-the-problem" && (
              <img
                src="/illustrations/06-flask.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
            {section.url === "why-validate-the-solution" && (
              <img
                src="/illustrations/06-flask.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
            {section.url === "the-cost-of-skipping" && (
              <img
                src="/illustrations/25-cost-of-skipping.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
            {section.url === "when-it-goes-right" && (
              <img
                src="/illustrations/16-success.svg"
                alt=""
                className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
              />
            )}
          </div>
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
                  <p className="text-base text-foreground leading-relaxed flex-1">{point}</p>
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
          <Button variant="primary-outline" onClick={() => router.push(`/foundations/${prev.url}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {prev.shortTitle}
          </Button>
        ) : (
          <Button variant="primary-outline" onClick={() => router.push("/foundations")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Introduction
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
            <p className="text-sm">Video coming soon</p>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-foreground">{video.title}</p>
        {video.description && (
          <p className="text-sm mt-1">{video.description}</p>
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
    ? "bg-success text-success-foreground shadow-sm"
    : "bg-destructive text-destructive-foreground shadow-sm"

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{caseStudy.title}</p>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium", outcomeClasses)}>
          <OutcomeIcon className="h-3 w-3" />
          {outcomeLabel}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{caseStudy.summary}</p>
      {caseStudy.link && (
        <a
          href={caseStudy.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline w-fit"
        >
          Read more
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}
