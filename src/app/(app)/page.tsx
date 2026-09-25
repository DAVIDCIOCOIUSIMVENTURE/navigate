"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useSelector } from "react-redux"
import { BookOpen, ChevronRight, Compass, FolderKanban, Home, Milestone, type LucideIcon } from "lucide-react"
import type { RootState } from "@/store"
import { CardTitle } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { AboutDialog } from "@/components/about-toggle"
import { getSelfDiscoveryProgress } from "@/lib/self-discovery-progress"
import { PAGE_TITLE_CLASS } from "@/lib/nav-item-styles"
import { projectRoutes, summariseProjects } from "@/lib/projects"

const SELF_DISCOVERY_FLOW_HREF = "/self-discovery/discover"

/**
 * Home is the overview: the four sections of Navigate as one row each, in the
 * order they are meant to be taken (Why It Matters, Self Discovery, Projects,
 * Next Steps), each with a line on what it is for. The Self Discovery row
 * shows how far the questionnaire has got and the Projects row how many
 * projects there are, how many problems have a verdict and how many solutions
 * have been found; the list itself lives on the Projects page (`/projects`),
 * with the New project button and the import and export menu.
 */
export default function HomePage() {
  const projects = useSelector((state: RootState) => state.projects.projects)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const selfDiscoveryAnswers = useSelector((state: RootState) => state.selfDiscoveryItems.items)
  const customYouItems = useSelector((state: RootState) => state.customDimensionItems.byColumn.you ?? [])
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const progress = useMemo(() => getSelfDiscoveryProgress(selfDiscoveryAnswers), [selfDiscoveryAnswers])
  const summary = useMemo(() => summariseProjects(projects, problems, solutions), [projects, problems, solutions])
  const selfDiscoveryStarted = mounted && selfDiscoveryAnswers.length + customYouItems.length > 0
  const answered = mounted ? progress.completed : 0

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle size="md" icon={Home} className={PAGE_TITLE_CLASS}>Home</CardTitle>
          <AboutDialog subject="the home page">
            <p>
              This is your <span className="font-bold">home</span>: the four sections of Navigate in the order they are meant to be taken,
              with how far your <span className="font-bold">Self Discovery</span> has got and what your <span className="font-bold">projects</span> add up to.
              A <span className="font-bold">project</span> holds one problem and the solutions you find for it.
              Open <span className="font-bold">Projects</span> to start one, then open it to identify its problem, explore and test it, and identify solutions.
            </p>
          </AboutDialog>
        </div>
      </div>

      {/* One row per section, in journey order. The whole row is the link. */}
      <div className="flex flex-col gap-3">
        <HomeRow
          href="/foundations"
          icon={BookOpen}
          title="Why It Matters"
          description="Why finding the right problem matters and what happens to founders who skip the work: short pages, videos and real case studies. Optional, but worth reading first."
        />
        {/* Leads into the questionnaire, picking up where the user left off. */}
        <HomeRow
          href={SELF_DISCOVERY_FLOW_HREF}
          icon={Compass}
          title="Self Discovery"
          description={
            selfDiscoveryStarted
              ? "Pick up where you left off. Your strengths, interests and lived experiences feed the You column when you identify a problem."
              : "Capture what you bring to a venture: your strengths, interests and lived experiences. They feed the You column when you identify a problem."
          }
          trailing={
            <ProgressRing
              label="Self Discovery progress"
              labelPosition="none"
              completed={answered}
              total={progress.total}
              size={48}
              strokeWidth={4}
            />
          }
          metrics={[{ value: `${answered} of ${progress.total}`, label: "questions answered" }]}
        />
        <HomeRow
          href={projectRoutes.list()}
          icon={FolderKanban}
          title="Projects"
          description="A project holds one problem and the solutions you find for it. Start one, identify its problem, explore and test it, then identify and compare solutions."
          metrics={[
            { value: summary.projects, label: summary.projects === 1 ? "project" : "projects" },
            { value: summary.problemsTested, label: summary.problemsTested === 1 ? "problem tested" : "problems tested" },
            { value: summary.solutions, label: summary.solutions === 1 ? "solution found" : "solutions found" },
          ]}
        />
        <HomeRow
          href="/next-steps"
          icon={Milestone}
          title="Next Steps"
          description="How to take a tested problem and solution into a real-world experiment, a prototype or a commitment. Reference only: there is nothing to fill in."
        />
      </div>
    </div>
  )
}

type HomeMetric = {
  /** The figure, already formatted. */
  value: ReactNode
  /** What the figure counts, drawn under it. */
  label: string
}

/**
 * One of the four rows on Home. The whole row is the link, and every row is
 * laid out the same way: the icon tile on the left, the title and description
 * beside it, then the figures (the Self Discovery progress ring and the
 * metrics) and the chevron on the right, so only the figures differ. Every row
 * is a white card, as the app's cards are, with the primary title tile.
 */
function HomeRow({
  href,
  icon: Icon,
  title,
  description,
  trailing,
  metrics,
}: {
  href: string
  icon: LucideIcon
  title: string
  /** One or two sentences on what the section is for. */
  description: string
  /** Drawn on the right before the metrics, such as a progress ring. */
  trailing?: ReactNode
  /** Figures drawn on the right, before the chevron. */
  metrics?: HomeMetric[]
}) {
  return (
    <Link
      href={href}
      className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 rounded-xl border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex flex-1 min-w-[16rem] items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-md shrink-0 bg-primary text-primary-foreground">
          <Icon className="h-5 w-5 [stroke-width:2.5]" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1.5 min-w-0">
          <h2 className="text-lg font-bold leading-none tracking-tight">{title}</h2>
          <p className="text-base leading-snug">{description}</p>
        </div>
      </div>
      {(trailing || (metrics && metrics.length > 0)) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 shrink-0">
          {trailing}
          {metrics && metrics.length > 0 && (
            <dl className="flex flex-wrap gap-x-6 gap-y-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col items-center gap-1 min-w-[5rem] text-center">
                  <dd className="order-1 text-2xl font-bold leading-none tabular-nums">{metric.value}</dd>
                  <dt className="order-2 text-base leading-tight">{metric.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
      <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Link>
  )
}
