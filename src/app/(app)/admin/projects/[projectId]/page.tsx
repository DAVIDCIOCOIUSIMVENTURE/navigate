"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectPreviewBody } from "@/components/preview/project-preview"
import { projectNotesBySection } from "@/lib/note-links"
import { ADMIN_HREF, problemOfProject, projectRoutes } from "@/lib/projects"
import { ArrowLeft, FolderKanban, ShieldCheck } from "lucide-react"

/**
 * `/admin/projects/<projectId>`: the admin's read-only view of one project.
 * It is the project's portfolio, the same page a reader is given when the
 * project is shared, with one addition the public page never shows: the
 * team's journal notes, in a margin down the right like a word processor's
 * comments, each solution's beside that solution and the rest beside the
 * problem, collapsed until the admin opens them.
 */
export default function AdminProjectPage() {
  const params = useParams()
  const projectId = Number(params.projectId)

  const hydrated = useSelector((state: RootState) => state.projects.hydrated)
  const project = useSelector((state: RootState) => state.projects.projects.find((p) => p.id === projectId))
  const problems = useSelector((state: RootState) => state.problems.problems)
  const allSolutions = useSelector((state: RootState) => state.solutions.solutions)
  const allNotes = useSelector((state: RootState) => state.notes.notes)

  const problem = problemOfProject(project, problems)
  const solutions = useMemo(
    () => (problem ? allSolutions.filter((s) => s.problemId === problem.id) : []),
    [allSolutions, problem],
  )
  const notes = useMemo(
    () => projectNotesBySection(allNotes, projectId, solutions.map((s) => s.id)),
    [allNotes, projectId, solutions],
  )

  if (!hydrated) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild className="gap-2 bg-white">
          <Link href={ADMIN_HREF}>
            <ArrowLeft className="h-4 w-4" />
            Back to admin panel
          </Link>
        </Button>
        {project && (
          <Button variant="outline" size="sm" asChild className="gap-2 bg-white">
            <Link href={projectRoutes.page(project.id)}>
              <FolderKanban className="h-4 w-4" />
              Open the project
            </Link>
          </Button>
        )}
      </div>

      {project ? (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-md border bg-secondary-brand/10 px-4 py-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-secondary-brand" aria-hidden="true" />
            <p className="text-base">
              <span className="font-semibold">Admin view.</span> This is the project&apos;s portfolio with the team&apos;s
              journal notes in the margin beside the part they are about. Click a note to read it. The notes never
              appear on the public portfolio.
            </p>
          </div>
          <div className="mx-auto w-full max-w-7xl">
            <ProjectPreviewBody project={project} problem={problem} solutions={solutions} notes={notes} />
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-base font-semibold">This project is not available</p>
            <p className="mt-2 text-base">It may have been deleted by the people who made it.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
