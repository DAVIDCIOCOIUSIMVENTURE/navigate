"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { ArrowRight, BookOpen, ChevronRight, Compass, FolderKanban, Home, Milestone, Plus, Sparkles, type LucideIcon } from "lucide-react"
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
  const router = useRouter()
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
            <CardContent className="p-5 flex flex-wrap items-center gap-5">
              <ProgressRing
                label="Self Discovery progress"
                labelPosition="none"
                completed={mounted ? progress.completed : 0}
                total={progress.total}
                size={64}
                strokeWidth={6}
              />
              <div className="flex-1 min-w-[12rem] flex flex-col gap-1.5">
                <CardTitle size="md" icon={Compass} className="text-foreground">
                  <Link href={SELF_DISCOVERY_HREF} className="hover:underline">Self Discovery</Link>
                </CardTitle>
                <p className="text-base">
                  Capture what you bring to a venture: your strengths, interests and lived experiences. They feed the You column when you identify a problem.
                </p>
                <p className="text-base font-medium">
                  {selfDiscoveryStarted
                    ? `${progress.completed} of ${progress.total} questions answered`
                    : "Not started yet"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selfDiscoveryStarted && (
                  <Button asChild variant="secondary-brand-outline">
                    <Link href={SELF_DISCOVERY_HREF}>Your answers</Link>
                  </Button>
                )}
                <Button onClick={() => router.push(SELF_DISCOVERY_FLOW_HREF)} className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  {selfDiscoveryStarted ? "Continue Self Discovery" : "Start Self Discovery"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <SectionLink
            href="/foundations"
            icon={BookOpen}
            title="Why It Matters"
            tagline="Why finding the right problem matters, and what happens to founders who skip the work."
          />
          <SectionLink
            href="/next-steps"
            icon={Milestone}
            title="Next Steps"
            tagline="Where to go once you have a tested problem and a solution worth pursuing."
          />
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

/** A quick link into a reading section, drawn like the section cards on Why It Matters and Next Steps. */
function SectionLink({ href, icon: Icon, title, tagline }: { href: string; icon: LucideIcon; title: string; tagline: string }) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 rounded-lg bg-secondary-brand text-white hover:bg-secondary-brand/90 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-white">
        <Icon className="h-5 w-5 text-secondary-brand" aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="text-base italic mt-0.5 flex items-start gap-1.5">
          <Sparkles className="h-3 w-3 shrink-0 mt-1.5" aria-hidden="true" />
          <span>{tagline}</span>
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 mt-1" aria-hidden="true" />
    </Link>
  )
}
