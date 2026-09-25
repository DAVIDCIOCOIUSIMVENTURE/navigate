"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import type { Note } from "@/store/notes-model"
import type { Problem } from "@/store/problems-model"
import type { Project } from "@/store/projects-model"
import type { Solution } from "@/types/solution"
import type { Job, JobKind } from "@/types/validation"
import { Card, CardContent } from "@/components/ui/card"
import { MarkdownView } from "@/components/ui/markdown-view"
import { MemberAvatarStack } from "@/components/member-avatar"
import { TrafficLightLabel } from "@/components/traffic-light"
import { useDimensionLabels } from "@/lib/dimension-labels"
import { completedJourneySteps, summariseProblemJourney } from "@/lib/journey-steps"
import type { ProjectNotes } from "@/lib/note-links"
import { memberDisplayName } from "@/lib/project-team"
import { projectDisplayName, projectRoutes } from "@/lib/projects"
import {
  JOB_KIND_COPY,
  PROBLEM_VERDICT_COPY,
  PROJECT_NOTES_COPY,
  SOLUTION_VERDICT_COPY,
  countWord,
  describeAnchorJob,
  describeAudience,
  describeCompetition,
  describeExistingSolutions,
  describeJobs,
  describeMarket,
  describeMethod,
  describeNoteDates,
  describeProgress,
  describeSegmentSize,
  describeSolutionScores,
  describeSolutions,
  formatList,
  formatPreviewDate,
  jobIntensityPhrase,
  noteHeading,
  pluralise,
} from "@/lib/project-preview"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  Compass,
  EyeOff,
  Gavel,
  Lightbulb,
  LifeBuoy,
  NotebookText,
  PoundSterling,
  Swords,
  Target,
  Users,
  Wrench,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * The public, read-only account of one project: the problem a team chose, what
 * they learned about it, and the solutions they found. It is written to be read
 * straight through by somebody who has never opened Navigate, which is why the
 * sections are prose with the structure underneath rather than the app's
 * canvases. The sentences that adapt to the data come from
 * `src/lib/project-preview.ts`.
 *
 * The page renders whatever is in this browser's storage. Once projects live in
 * a database, a private project will simply not be served to anyone but its
 * team, and the "not shared yet" notice below becomes the owner's own view of
 * that.
 */
export function ProjectPreview({ projectId }: { projectId: number }) {
  const dispatch = useDispatch<AppDispatch>()

  // The preview renders outside the app shell, so it loads the slices it needs itself.
  useEffect(() => {
    dispatch.projects.init()
    dispatch.problems.init()
    dispatch.solutions.init()
    dispatch.customDimensionItems.init()
    dispatch.selfDiscoveryItems.init()
  }, [dispatch])

  const hydrated = useSelector((state: RootState) => state.projects.hydrated)
  const project = useSelector((state: RootState) => state.projects.projects.find((p) => p.id === projectId))
  const problem = useSelector((state: RootState) =>
    project?.problemId == null ? undefined : state.problems.problems.find((p) => p.id === project.problemId),
  )
  const allSolutions = useSelector((state: RootState) => state.solutions.solutions)
  const solutions = useMemo(
    () => (problem ? allSolutions.filter((s) => s.problemId === problem.id) : []),
    [allSolutions, problem],
  )

  if (!hydrated) return null

  if (!project) return <PreviewNotice title="This portfolio is not available" body={NOT_FOUND_BODY} />

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PreviewTopBar />
      {project.visibility === "private" && <NotSharedBanner projectId={project.id} />}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8 lg:py-12">
        <ProjectPreviewBody project={project} problem={problem} solutions={solutions} />
      </main>
    </div>
  )
}

const NOT_FOUND_BODY =
  "The link may be wrong, or the project it pointed at may have been deleted by the people who made it."

/**
 * The portfolio itself, without the public page's chrome: the heading, the
 * contents rail and every section. The public page renders it as is; the
 * admin panel renders it inside the app with `notes`, the team's journal
 * notes about the project, drawn in a margin down the right like the
 * comments in a word processor: the project's own notes beside the problem,
 * each solution's beside that solution, every one collapsed to its heading
 * until it is opened. The public page never passes `notes`: the journal is
 * the team's own.
 */
export function ProjectPreviewBody({
  project,
  problem,
  solutions,
  notes,
}: {
  project: Project
  problem: Problem | undefined
  solutions: Solution[]
  notes?: ProjectNotes
}) {
  const margin = useNotesMargin(notes)
  const noProblem = (
    <Card className={cn(margin ? undefined : "mt-10")}>
      <CardContent className="p-10 text-center">
        <p className="text-base">This team has not chosen a problem to work on yet, so there is nothing to read here.</p>
      </CardContent>
    </Card>
  )

  return (
    <>
      <ProjectHeading project={project} problem={problem} solutions={solutions} />
      {problem ? (
        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <Contents />
          <div className="flex min-w-0 flex-1 flex-col gap-10">
            <NotesMargin margin={margin} notes={margin?.notes.project} heading={PROJECT_NOTES_COPY.projectHeading} controls>
              <ProblemSections problem={problem} />
            </NotesMargin>
            <SolutionsSection solutions={solutions} margin={margin} />
          </div>
        </div>
      ) : margin ? (
        // A project with no problem still carries the notes written about it.
        <div className="mt-10">
          <NotesMargin margin={margin} notes={margin.notes.project} heading={PROJECT_NOTES_COPY.projectHeading} controls>
            {noProblem}
          </NotesMargin>
        </div>
      ) : (
        noProblem
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Chrome                                                             */
/* ------------------------------------------------------------------ */

function PreviewTopBar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-quaternary">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <span className="text-lg font-bold text-quaternary-foreground">Navigate</span>
        <span className="text-base text-quaternary-foreground/80">Project portfolio, read only</span>
      </div>
    </header>
  )
}

/**
 * Only the people working on the project can reach this page while it is
 * private, so the banner is addressed to them.
 */
function NotSharedBanner({ projectId }: { projectId: number }) {
  return (
    <div className="border-b bg-yellow-600/15">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
        <EyeOff className="h-4 w-4 shrink-0 text-yellow-700" />
        <p className="text-base">
          This project is private, so nobody else can open this page yet. Turn on{" "}
          <span className="font-semibold">Share a public portfolio</span> in the project settings to give out the link.
        </p>
        <Link
          href={projectRoutes.page(projectId)}
          className="text-base font-semibold text-secondary-brand underline underline-offset-4"
        >
          Back to the project
        </Link>
      </div>
    </div>
  )
}

function PreviewNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PreviewTopBar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-brand">
              <Compass className="h-7 w-7 text-secondary-brand-foreground" />
            </div>
            <h1 className="text-xl font-bold text-secondary-brand">{title}</h1>
            <p className="max-w-md text-base">{body}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Heading                                                            */
/* ------------------------------------------------------------------ */

function ProjectHeading({
  project,
  problem,
  solutions,
}: {
  project: Project
  problem: Problem | undefined
  solutions: Solution[]
}) {
  const name = projectDisplayName(project, problem?.title)
  const updated = formatPreviewDate(project.editedAt)
  const progress = problem
    ? describeProgress(completedJourneySteps(summariseProblemJourney(problem, solutions)))
    : describeProgress([])
  // With no team recorded there is nobody to name, so the byline is the date alone.
  const team = project.members.map(memberDisplayName)
  const byline = [team.length > 0 ? `Worked on by ${formatList(team)}.` : "", updated ? `Last updated ${updated}.` : ""]
    .filter((part) => part.length > 0)
    .join(" ")

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-semibold uppercase tracking-wide text-secondary-brand">An innovation project</p>
      <h1 className="text-3xl font-bold leading-tight lg:text-4xl">{name}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {project.members.length > 0 && <MemberAvatarStack members={project.members} />}
        {byline.length > 0 && <p className="text-base">{byline}</p>}
      </div>
      <p className="max-w-3xl text-lg leading-relaxed">
        This page is the whole story of one project: the problem the team decided to work on, what they found out about
        the people who have it, and the solutions they came up with. {progress}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Contents                                                           */
/* ------------------------------------------------------------------ */

const SECTIONS: { id: string; label: string }[] = [
  { id: "the-problem", label: "The problem" },
  { id: "who-has-it", label: "Who has it" },
  { id: "what-they-want", label: "What they want done" },
  { id: "coping-today", label: "How they cope today" },
  { id: "what-it-is-worth", label: "What it could be worth" },
  { id: "the-competition", label: "The competition" },
  { id: "why-this-team", label: "Why this team" },
  { id: "the-verdict", label: "The verdict" },
  { id: "the-solutions", label: "The solutions" },
]

function Contents() {
  const items = SECTIONS
  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:w-56 lg:shrink-0">
      <p className="mb-3 text-base font-semibold">On this page</p>
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {items.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block rounded-md px-3 py-1.5 text-base hover:bg-muted lg:px-2"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Section shell and small parts                                      */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  icon: Icon,
  lead,
  children,
}: {
  id: string
  title: string
  icon: LucideIcon
  lead?: string
  children?: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary-brand">
          <Icon className="h-4 w-4 text-secondary-brand-foreground" strokeWidth={2.5} />
        </span>
        <h2 className="text-xl font-bold text-secondary-brand">{title}</h2>
      </div>
      {lead && <p className="max-w-3xl text-lg leading-relaxed">{lead}</p>}
      {children && <div className="mt-4 flex flex-col gap-4">{children}</div>}
    </section>
  )
}

/** A paragraph of the team's own writing, or a note that they left it blank. */
function Quoted({ text, fallback }: { text: string; fallback: string }) {
  const trimmed = text.trim()
  if (trimmed.length === 0) return <p className="text-base italic opacity-70">{fallback}</p>
  return (
    <p className="border-l-4 border-secondary-brand/40 pl-4 text-lg leading-relaxed whitespace-pre-line">{trimmed}</p>
  )
}

/** Dimension ids resolved to their labels and shown as a labelled row of chips. */
function Chips({ columnId, ids, label }: { columnId: string; ids: string[]; label: string }) {
  const labels = useDimensionLabels(columnId, ids)
  if (labels.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-semibold">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {labels.map((text, index) => (
          <li
            key={`${text}-${index}`}
            className="rounded-full bg-secondary-brand/10 px-3 py-1 text-base text-secondary-brand"
          >
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Card className={cn("w-full", className)}><CardContent className="flex flex-col gap-4 p-5">{children}</CardContent></Card>
}

/* ------------------------------------------------------------------ */
/*  The problem                                                        */
/* ------------------------------------------------------------------ */

function ProblemSections({ problem }: { problem: Problem }) {
  const verdict = PROBLEM_VERDICT_COPY[problem.validationStatus] ?? PROBLEM_VERDICT_COPY.unvalidated
  const market = describeMarket(problem.validationAssessment)
  const anchor = describeAnchorJob(problem)
  const shortcomingCount = problem.existingSolutions.reduce((total, item) => total + item.shortcomings.length, 0)
  const segment = describeSegmentSize(problem.segmentSize)

  return (
    <>
      <Section
        id="the-problem"
        title="The problem"
        icon={Target}
        lead="Every project starts with a problem somebody actually has. This is the one this team chose to work on, in their own words."
      >
        <Panel>
          <h3 className="text-xl font-bold leading-snug">{problem.title.trim() || "Untitled problem"}</h3>
          <Quoted text={problem.description} fallback="The team has not written a description of the problem yet." />
        </Panel>
      </Section>

      <Section
        id="who-has-it"
        title="Who has this problem, and when"
        icon={Users}
        lead={describeAudience(problem.customers.length, problem.contexts.length)}
      >
        {/* Each panel is left out entirely when the team recorded nothing for it, rather than showing an empty card. */}
        {(problem.customers.length > 0 || problem.customerDescription.trim().length > 0 || segment) && (
          <Panel>
            <Chips columnId="customers" ids={problem.customers} label="The people who have it" />
            {problem.customerDescription.trim().length > 0 && (
              <p className="text-base leading-relaxed whitespace-pre-line">{problem.customerDescription.trim()}</p>
            )}
            {segment && <p className="text-base">{segment}</p>}
          </Panel>
        )}
        {(problem.contexts.length > 0 || problem.contextWhen.trim().length > 0 || problem.problems.length > 0) && (
          <Panel>
            <Chips columnId="contexts" ids={problem.contexts} label="The situations it comes up in" />
            {problem.contextWhen.trim().length > 0 && (
              <p className="text-base leading-relaxed whitespace-pre-line">{problem.contextWhen.trim()}</p>
            )}
            <Chips columnId="problems" ids={problem.problems} label="The kind of problem it is" />
          </Panel>
        )}
      </Section>

      <Section
        id="what-they-want"
        title="What these people are trying to get done"
        icon={Wrench}
        lead={describeJobs(problem.jobsToBeDone)}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {(Object.keys(JOB_KIND_COPY) as JobKind[]).map((kind) => (
            <JobList key={kind} kind={kind} jobs={problem.jobsToBeDone[kind]} />
          ))}
        </div>
        {anchor && <p className="max-w-3xl text-base leading-relaxed">{anchor}</p>}
      </Section>

      <Section
        id="coping-today"
        title="How people cope with it today"
        icon={LifeBuoy}
        lead={describeExistingSolutions(problem.existingSolutions.length, shortcomingCount)}
      >
        {problem.existingSolutions.length > 0 && (
          <div className="flex flex-col gap-3">
            {problem.existingSolutions.map((item) => (
              <Panel key={item.id}>
                <p className="text-lg font-semibold leading-snug">{item.text.trim() || "Untitled"}</p>
                {item.shortcomings.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-base font-semibold">Where it falls short</p>
                    <ul className="flex flex-col gap-1.5">
                      {item.shortcomings.map((shortcoming) => (
                        <li key={shortcoming.id} className="flex gap-2 text-base leading-relaxed">
                          <span aria-hidden className="text-secondary-brand">&bull;</span>
                          <span>{shortcoming.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-base italic opacity-70">No shortcomings were recorded for this one.</p>
                )}
              </Panel>
            ))}
          </div>
        )}
      </Section>

      <Section
        id="what-it-is-worth"
        title="What solving it could be worth"
        icon={PoundSterling}
        lead={market.paragraphs[0]}
      >
        {market.ready && (
          <>
            {market.paragraphs.slice(1).map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
            <div className="grid gap-4 md:grid-cols-3">
              {market.figures.map((figure) => (
                <Panel key={figure.label}>
                  <p className="text-base font-semibold">{figure.label}</p>
                  <p className="text-2xl font-bold text-secondary-brand">{figure.value}</p>
                  <p className="text-base leading-relaxed">{figure.blurb}</p>
                </Panel>
              ))}
            </div>
            <p className="max-w-3xl text-base leading-relaxed opacity-80">
              These are the team&apos;s own estimates rather than measured figures, so read them as the size of the prize
              they are aiming at.
            </p>
          </>
        )}
      </Section>

      <Section
        id="the-competition"
        title="Where the competition sits"
        icon={Swords}
        lead="A problem worth solving is not the same as a problem you can win. These three readings are how the team judged what they would be up against."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {describeCompetition(problem.validationAssessment).map((signal) => (
            <Panel key={signal.label}>
              <p className="text-base font-semibold">{signal.label}</p>
              <p className="text-xl font-bold capitalize text-secondary-brand">{signal.value ?? "Not judged yet"}</p>
              <p className="text-base leading-relaxed">{signal.question}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section
        id="why-this-team"
        title="Why this team"
        icon={Compass}
        lead={
          problem.you.length > 0
            ? `The team came to this problem with ${countWord(problem.you.length)} ${pluralise(problem.you.length, "thing", "things")} of their own: what they have lived, learned or care about that makes them the right people to work on it.`
            : "The team has not yet recorded what they personally bring to this problem."
        }
      >
        {problem.you.length > 0 && (
          <Panel>
            <Chips columnId="you" ids={problem.you} label="What they bring to it" />
          </Panel>
        )}
      </Section>

      <Section id="the-verdict" title="The verdict on the problem" icon={Gavel} lead={verdict.reading}>
        <Panel>
          <p className="text-base font-semibold">Where the team landed</p>
          <p className="text-2xl font-bold text-secondary-brand">{verdict.label}</p>
        </Panel>
      </Section>
    </>
  )
}

function JobList({ kind, jobs }: { kind: JobKind; jobs: Job[] }) {
  const copy = JOB_KIND_COPY[kind]
  const written = jobs.filter((job) => job.text.trim().length > 0)
  return (
    <Panel>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">{copy.label}</p>
        <p className="text-base leading-relaxed opacity-80">{copy.blurb}</p>
      </div>
      {written.length === 0 ? (
        <p className="text-base italic opacity-70">None recorded.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {written.map((job) => {
            const intensity = jobIntensityPhrase(job.intensity)
            return (
              <li key={job.id} className="text-base leading-relaxed">
                {job.text.trim()}
                {intensity && <span className="ml-1.5 opacity-80">({intensity})</span>}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/*  Journal notes in the margin (only when the admin panel passes them) */
/* ------------------------------------------------------------------ */

/**
 * The margin's shared state: which notes are open. It is kept here rather
 * than in each comment so "Expand all" and "Collapse all" can reach every
 * note on the page. Null when the page shows no notes.
 */
type NotesMarginState = {
  notes: ProjectNotes
  isOpen: (noteId: number) => boolean
  toggle: (noteId: number) => void
  allOpen: boolean
  setAll: (open: boolean) => void
}

function useNotesMargin(notes: ProjectNotes | undefined): NotesMarginState | null {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set())
  const allIds = useMemo(
    () => (notes ? [...notes.project, ...Object.values(notes.bySolution).flat()].map((n) => n.id) : []),
    [notes],
  )
  if (!notes) return null
  return {
    notes,
    isOpen: (noteId) => open.has(noteId),
    toggle: (noteId) =>
      setOpen((current) => {
        const next = new Set(current)
        if (next.has(noteId)) next.delete(noteId)
        else next.add(noteId)
        return next
      }),
    allOpen: allIds.length > 0 && allIds.every((id) => open.has(id)),
    setAll: (value) => setOpen(value ? new Set(allIds) : new Set()),
  }
}

/**
 * The content with its notes in a margin to its right on wide containers,
 * below it on narrow ones. Without a margin state (the public page) it is
 * the content alone. Every row reserves the same margin width, so the
 * content column keeps one width down the page whether or not a row has
 * notes, and the margin sticks while its content scrolls so a long section
 * keeps its notes in view.
 */
function NotesMargin({
  margin,
  notes = [],
  heading,
  controls = false,
  children,
}: {
  margin: NotesMarginState | null
  notes?: Note[]
  heading: string
  /** Whether this margin carries the page's Expand all / Collapse all button (the first one does). */
  controls?: boolean
  children: React.ReactNode
}) {
  if (!margin) return <>{children}</>
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-10">{children}</div>
      <aside
        aria-label={heading}
        className="flex flex-col gap-3 lg:sticky lg:top-24 lg:w-72 lg:shrink-0 lg:border-l-2 lg:border-dashed lg:border-secondary-brand/30 lg:pl-4"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-base font-semibold text-secondary-brand">
            <NotebookText className="h-4 w-4 shrink-0" aria-hidden="true" />
            {heading}
            {notes.length > 0 && <span className="font-normal">({notes.length})</span>}
          </p>
          {controls && (
            <button
              type="button"
              onClick={() => margin.setAll(!margin.allOpen)}
              className="text-base text-secondary-brand underline-offset-4 hover:underline"
            >
              {margin.allOpen ? PROJECT_NOTES_COPY.collapseAll : PROJECT_NOTES_COPY.expandAll}
            </button>
          )}
        </div>
        {notes.length === 0 ? (
          controls && <p className="text-base italic opacity-70">{PROJECT_NOTES_COPY.projectEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <li key={note.id}>
                <NoteComment note={note} open={margin.isOpen(note.id)} onToggle={() => margin.toggle(note.id)} />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  )
}

/**
 * One journal note as a comment in the margin: collapsed to its heading and
 * date, opened to the full note as the team wrote it. The Markdown view is
 * only mounted while open, so a page of notes costs nothing until one is read.
 */
function NoteComment({ note, open, onToggle }: { note: Note; open: boolean; onToggle: () => void }) {
  const heading = noteHeading(note.title, note.text)
  const dates = describeNoteDates(note.createdAt, note.editedAt)
  const bodyId = `note-${note.id}-body`
  return (
    <div className={cn("rounded-lg border border-l-4 border-l-secondary-brand bg-card shadow-sm", open && "border-secondary-brand/40")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        className="flex w-full items-start gap-2 rounded-lg p-3 text-left hover:bg-secondary-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={cn("text-base font-semibold leading-snug", !open && "line-clamp-2")}>{heading}</span>
          {dates && <span className="text-base leading-snug opacity-80">{dates}</span>}
        </span>
        <ChevronDown
          className={cn("mt-1 h-4 w-4 shrink-0 text-secondary-brand transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={bodyId} className="border-t px-3 py-3">
          {/* Keyed so a note edited in the journal is redrawn: the view does not follow later changes to its Markdown. */}
          <MarkdownView key={`${note.id}-${note.editedAt}`} markdown={note.text} />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  The solutions                                                      */
/* ------------------------------------------------------------------ */

function SolutionsSection({ solutions, margin }: { solutions: Solution[]; margin: NotesMarginState | null }) {
  if (solutions.length === 0) {
    return (
      <Section
        id="the-solutions"
        title="The solutions"
        icon={Lightbulb}
        lead={describeSolutions(solutions)}
      />
    )
  }
  return (
    <Section
      id="the-solutions"
      title="The solutions"
      icon={Lightbulb}
      lead={`${describeSolutions(solutions)} Each one is set out below with how it was arrived at and how it scored.`}
    >
      {solutions.map((solution, index) => (
        <NotesMargin
          key={solution.id}
          margin={margin}
          notes={margin?.notes.bySolution[solution.id]}
          heading={PROJECT_NOTES_COPY.solutionHeading}
        >
          <SolutionArticle solution={solution} position={index + 1} />
        </NotesMargin>
      ))}
    </Section>
  )
}

function SolutionArticle({ solution, position }: { solution: Solution; position: number }) {
  const verdict = SOLUTION_VERDICT_COPY[solution.validationStatus] ?? SOLUTION_VERDICT_COPY.unvalidated
  const method = describeMethod(solution)
  const scores = describeSolutionScores(solution)

  return (
    <article>
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold opacity-70">Candidate {position}</p>
            <h3 className="text-xl font-bold leading-snug">{solution.title.trim() || "Untitled solution"}</h3>
          </div>
          <TrafficLightLabel light={solution.trafficLight} className="text-base" />
        </div>

        <Quoted text={solution.description} fallback="The team has not written up what this solution is yet." />

        {method && (
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold">How they got to it</p>
            <p className="text-base leading-relaxed">{method}</p>
          </div>
        )}

        {scores.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold">How it scored</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              {scores.map((score) => (
                <div key={score.key} className="rounded-lg bg-secondary-brand/5 p-3">
                  <dt className="text-base">{score.label}</dt>
                  <dd className="text-base font-bold text-secondary-brand">{score.word}</dd>
                  <dd className="mt-1 text-base leading-relaxed opacity-80">{score.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="flex flex-col gap-1 border-t pt-4">
          <p className="text-base font-semibold">{verdict.label}</p>
          <p className="text-base leading-relaxed">{verdict.reading}</p>
        </div>
      </Panel>
    </article>
  )
}
