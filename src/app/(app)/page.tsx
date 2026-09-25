"use client"

import { useEffect, useMemo, useState } from "react"
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
import { projectRoutes } from "@/lib/projects"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"

const SELF_DISCOVERY_HREF = "/self-discovery"
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
          <CardTitle size="md" icon={Home} className="text-xl text-foreground">Home</CardTitle>
          <AboutDialog subject="the home page">
            <p>
              This is your <span className="font-bold">home</span>: an overview of your <span className="font-bold">Self Discovery</span> and your <span className="font-bold">projects</span>, with quick links to the reading sections.
              A <span className="font-bold">project</span> holds one problem and the solutions you find for it.
              Press <span className="font-bold">New project</span> to start one, then open it to identify its problem, explore and test it, and identify solutions.
            </p>
          </AboutDialog>
        </div>
        <Button onClick={() => setNewOpen(true)} className="gap-2 shrink-0" data-tour={TOUR_TARGETS.dashboardNewProject}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {/* Self Discovery beside the two reading sections; the projects take the rest of the page. */}
      <div className="@container shrink-0">
        <div className="grid grid-cols-1 gap-3 @[640px]:grid-cols-2 @[1000px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="@[640px]:col-span-2 @[1000px]:col-span-1">
            {/* One row, no taller than the section cards beside it: the ring, the title and the chevron. */}
            <CardContent className="p-3 flex items-center gap-4">
              <ProgressRing
                label="Self Discovery progress"
                labelPosition="none"
                completed={mounted ? progress.completed : 0}
                total={progress.total}
                size={44}
                strokeWidth={4}
              />
              <CardTitle size="md" icon={Compass} className="flex-1 min-w-0 text-foreground">
                <Link href={SELF_DISCOVERY_HREF} className="hover:underline">Self Discovery</Link>
              </CardTitle>
              {/* The same chevron the section cards carry: it leads into the questionnaire, picking up where the user left off. */}
              <Link
                href={SELF_DISCOVERY_FLOW_HREF}
                aria-label={selfDiscoveryStarted ? "Continue Self Discovery" : "Start Self Discovery"}
                title={selfDiscoveryStarted ? "Continue Self Discovery" : "Start Self Discovery"}
                className="flex items-center justify-center h-9 w-9 rounded-lg shrink-0 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
          <SectionLink href="/foundations" icon={BookOpen} title="Why It Matters" />
          <SectionLink href="/next-steps" icon={Milestone} title="Next Steps" />
        </div>
      </div>

      {/* Nothing until the projects have loaded, so the empty state never flashes over a list that is about to arrive. */}
      {!hydrated ? null : projects.length === 0 ? (
        <Card className={cn("flex flex-col", isWide && "flex-1 min-h-0 overflow-y-auto")}>
          <CardContent className="p-6 flex flex-col flex-1">
            <ProjectsEmptyState onNew={() => setNewOpen(true)} compact />
          </CardContent>
        </Card>
      ) : (
        <ProjectsTable
          projects={projects}
          className={cn(isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")}
          headerExtra={
            <Button asChild variant="secondary-brand-outline" className="gap-1.5">
              <Link href={projectRoutes.list()}>
                <FolderKanban className="h-4 w-4" />
                All projects
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
      )}
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}

/** A quick link into a reading section, drawn like the section cards on Why It Matters and Next Steps, without their tagline. */
function SectionLink({ href, icon: Icon, title }: { href: string; icon: LucideIcon; title: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-lg bg-secondary-brand text-white hover:bg-secondary-brand/90 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-white">
        <Icon className="h-5 w-5 text-secondary-brand" aria-hidden="true" />
      </span>
      <p className="flex-1 min-w-0 font-semibold">{title}</p>
      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </Link>
  )
}
