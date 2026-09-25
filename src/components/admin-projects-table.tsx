"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MemberAvatarStack } from "@/components/member-avatar"
import { isNoteInProject } from "@/store/notes-model"
import { adminProjectHref, problemOfProject, projectDisplayName } from "@/lib/projects"
import { TABLE_STATUS_META } from "@/lib/status-table"
import { formatPreviewDate } from "@/lib/project-preview"

/**
 * The Projects tab of the admin panel: every project in this workspace, one
 * row each, opening the admin's read-only view of it (the portfolio with the
 * team's journal notes beside each section). There is no backend yet, so the
 * list is everything in this browser's storage; once there is one it narrows
 * to the projects the admin is allowed to see.
 */
export function AdminProjectsTable() {
  const router = useRouter()
  const projects = useSelector((state: RootState) => state.projects.projects)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const notes = useSelector((state: RootState) => state.notes.notes)

  // Newest first, like the projects list.
  const rows = useMemo(
    () =>
      [...projects]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
        .map((project) => {
          const problem = problemOfProject(project, problems)
          return {
            project,
            problem,
            name: projectDisplayName(project, problem?.title),
            solutionCount: problem ? solutions.filter((s) => s.problemId === problem.id).length : 0,
            noteCount: notes.filter((n) => isNoteInProject(n, project.id)).length,
          }
        }),
    [projects, problems, solutions, notes],
  )

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-foreground">
        Every project in this workspace. Open one to read its portfolio with the team&apos;s journal notes beside each
        section. Once accounts arrive, this list narrows to the projects you are allowed to see.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Problem status</TableHead>
            <TableHead>Solutions</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Portfolio</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-base">
                No projects yet.
              </TableCell>
            </TableRow>
          ) : (
            rows.map(({ project, problem, name, solutionCount, noteCount }) => {
              const statusMeta = problem ? TABLE_STATUS_META[problem.validationStatus ?? "unvalidated"] : null
              const href = adminProjectHref(project.id)
              return (
                <TableRow key={project.id} onClick={() => router.push(href)} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <div className="flex flex-col min-w-0">
                      {/* The row is the click target; this link is what keyboard users tab to, so it must not navigate twice. */}
                      <Link
                        href={href}
                        onClick={(event) => event.stopPropagation()}
                        className="text-secondary-brand hover:underline"
                      >
                        {name}
                      </Link>
                      {problem ? (
                        <span className="line-clamp-1 text-base font-normal opacity-70">
                          {problem.title.trim() || "Untitled problem"}
                        </span>
                      ) : (
                        <span className="text-base font-normal italic opacity-70">No problem identified yet</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {statusMeta ? (
                      <div className={`flex items-center gap-1.5 text-base font-medium ${statusMeta.className}`}>
                        <statusMeta.icon className="h-3.5 w-3.5" />
                        {statusMeta.label}
                      </div>
                    ) : (
                      <span className="text-base opacity-70">-</span>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums">{solutionCount}</TableCell>
                  <TableCell className="tabular-nums">{noteCount}</TableCell>
                  <TableCell>
                    {project.members.length > 0 ? (
                      <MemberAvatarStack members={project.members} max={3} className="[&>*]:h-7 [&>*]:w-7" />
                    ) : (
                      <span className="text-base opacity-70">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.visibility === "public" ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">shared</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-foreground">private</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatPreviewDate(project.createdAt) ?? "-"}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
