"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useSelector } from "react-redux"
import { BookOpen, ChevronRight, Compass, FolderKanban, Home, Milestone, Plus, type LucideIcon } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { AboutDialog } from "@/components/about-toggle"
import { NewProjectDialog } from "@/components/project-name-dialog"
import { ProjectsEmptyState } from "@/components/projects-empty-state"
import { ProjectsTable } from "@/components/projects-table"
import { useContainerSize } from "@/context/container-size-context"
import { getSelfDiscoveryProgress } from "@/lib/self-discovery-progress"
import { PAGE_TITLE_CLASS } from "@/lib/nav-item-styles"
import { projectRoutes } from "@/lib/projects"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"

const SELF_DISCOVERY_FLOW_HREF = "/self-discovery/discover"

/**
 * Home is the overview: where Self Discovery has got to, the projects, and
 * a quick way into the two reading sections (Why It Matters and Next Steps).
 * The Projects page (`/projects`) is the same list on its own, with the
 * import and export menu; Self Discovery has its own page for the answers.
 */
export default function HomePage() {
  const projects = useSelector((state: RootState) => state.projects.projects)
  const hydrated = useSelector((state: RootState) => state.projects.hydrated)
  const selfDiscoveryAnswers = useSelector((state: RootState) => state.selfDiscoveryItems.items)
  const customYouItems = useSelector((state: RootState) => state.customDimensionItems.byColumn.you ?? [])
  const [newOpen, setNewOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isWide = useContainerSize() === "wide"

  useEffect(() => { setMounted(true) }, [])

  const progress = useMemo(() => getSelfDiscoveryProgress(selfDiscoveryAnswers), [selfDiscoveryAnswers])
  const selfDiscoveryStarted = mounted && selfDiscoveryAnswers.length + customYouItems.length > 0

  return (
    <div
      className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle size="md" icon={Home} className={PAGE_TITLE_CLASS}>Home</CardTitle>
          <AboutDialog subject="the home page">
            <p>
              This is your <span className="font-bold">home</span>: an overview of your <span className="font-bold">Self Discovery</span> and your <span className="font-bold">projects</span>, with quick links to the reading sections.
              A <span className="font-bold">project</span> holds one problem and the solutions you find for it.
              Press <span className="font-bold">New project</span> to start one, then open it to identify its problem, explore and test it, and identify solutions.
            </p>
          </AboutDialog>
        </div>
      </div>

      {/* Why It Matters, then Self Discovery (the widest card), then Next Steps; the projects take the rest of the page. */}
      <div className="@container shrink-0">
        <div className="grid grid-cols-1 gap-3 @[640px]:grid-cols-2 @[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
          <HomeCard href="/foundations" icon={BookOpen} title="Why It Matters" tone="brand" />
          {/* Leads into the questionnaire, picking up where the user left off. */}
          <HomeCard
            href={SELF_DISCOVERY_FLOW_HREF}
            icon={Compass}
            title="Self Discovery"
            tone="card"
            label={selfDiscoveryStarted ? "Continue Self Discovery" : "Start Self Discovery"}
            leading={
              <ProgressRing
                label="Self Discovery progress"
                labelPosition="none"
                completed={mounted ? progress.completed : 0}
                total={progress.total}
                size={40}
                strokeWidth={4}
              />
            }
          />
          {/* On two columns the first two share a row and this one takes the row below. */}
          <HomeCard
            href="/next-steps"
            icon={Milestone}
            title="Next Steps"
            tone="brand"
            className="@[640px]:col-span-2 @[1000px]:col-span-1"
          />
        </div>
      </div>

      {/* Nothing until the projects have loaded, so the empty state never flashes over a list that is about to arrive. */}
      {!hydrated ? null : projects.length === 0 ? (
        <Card className={cn("flex flex-col", isWide && "flex-1 min-h-0 overflow-y-auto")}>
          <CardContent className="p-6 flex flex-col flex-1">
            <ProjectsEmptyState onNew={() => setNewOpen(true)} compact tourTarget={TOUR_TARGETS.dashboardNewProject} />
          </CardContent>
        </Card>
      ) : (
        <ProjectsTable
          projects={projects}
          className={cn(isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")}
          headerExtra={
            <>
              <Button onClick={() => setNewOpen(true)} className="gap-2" data-tour={TOUR_TARGETS.dashboardNewProject}>
                <Plus className="h-4 w-4" />
                New project
              </Button>
              <Button asChild variant="secondary-brand-outline" className="gap-1.5">
                <Link href={projectRoutes.list()}>
                  <FolderKanban className="h-4 w-4" />
                  All projects
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          }
        />
      )}
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}

const HOME_CARD_TONES = {
  /** A white card, as the app's cards are, with the primary title tile. */
  card: {
    root: "border-border bg-card text-foreground hover:bg-muted",
    tile: "bg-primary text-primary-foreground",
  },
  /** A cobalt section card, like the ones on Why It Matters and Next Steps, with the tile inverted on white. */
  brand: {
    root: "border-secondary-brand bg-secondary-brand text-white hover:bg-secondary-brand/90",
    tile: "bg-white text-secondary-brand",
  },
} as const

/**
 * One of the three cards at the top of Home. The whole card is the link, and every card
 * shares the same shape, padding, title (the md CardTitle sizes) and chevron, so only the
 * tone and what leads the row (the Self Discovery progress ring) differ.
 */
function HomeCard({
  href,
  icon: Icon,
  title,
  tone,
  label,
  leading,
  className,
}: {
  href: string
  icon: LucideIcon
  title: string
  tone: keyof typeof HOME_CARD_TONES
  /** Accessible name and tooltip when the title alone does not say what the click does. */
  label?: string
  /** Drawn before the title, such as a progress ring. */
  leading?: ReactNode
  className?: string
}) {
  const tones = HOME_CARD_TONES[tone]
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center gap-3 min-h-16 px-4 py-3 rounded-xl border shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tones.root,
        className,
      )}
    >
      {leading}
      <h2 className="flex flex-1 min-w-0 items-center gap-2 text-lg font-bold leading-none tracking-tight">
        <span className={cn("flex items-center justify-center w-8 h-8 rounded-md shrink-0", tones.tile)}>
          <Icon className="h-4 w-4 [stroke-width:2.5]" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </Link>
  )
}
