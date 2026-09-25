"use client"

import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { RootState } from "@/store"
import type { Project } from "@/store/projects-model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MemberAvatarStack } from "@/components/member-avatar"
import { ProjectSettingsDialog } from "@/components/project-settings-dialog"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FolderKanban,
  Lightbulb,
  Search,
  Settings,
  Target,
} from "lucide-react"
import { problemOfProject, projectDisplayName, projectRoutes } from "@/lib/projects"
import { TABLE_STATUS_META, STATUS_ORDER } from "@/lib/status-table"
import { cn } from "@/lib/utils"

type SortKey = "created" | "name" | "status" | "solutions"
type SortDirection = "asc" | "desc"

/**
 * The projects list, on the Projects page and in the Home overview: one row
 * per project with its problem, the problem's validation status and how
 * many solutions it has.
 * The whole row opens the project. Its one button, at the end of the row,
 * opens the project's settings dialog, which is where everything else about a
 * project (its portfolio, its team and the way to delete it) lives.
 * Newest project first by default, so the one just created is at the top.
 */
export function ProjectsTable({
  projects,
  className,
  headerExtra,
}: {
  projects: Project[]
  className?: string
  /** Anything to place after the search box in the card header (Home puts its link to the Projects page there). */
  headerExtra?: React.ReactNode
}) {
  const router = useRouter()
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const [search, setSearch] = useState("")
  const [settingsId, setSettingsId] = useState<number | null>(null)
  // Newest project first by default, so the one just created is at the top.
  const [sortKey, setSortKey] = useState<SortKey>("created")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const rows = useMemo(
    () =>
      projects.map((project, index) => {
        const problem = problemOfProject(project, problems)
        const solutionCount = problem ? solutions.filter((s) => s.problemId === problem.id).length : 0
        return { project, problem, solutionCount, index, name: projectDisplayName(project, problem?.title) }
      }),
    [projects, problems, solutions],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter(({ name, problem }) =>
      `${name} ${problem?.title ?? ""} ${problem?.description ?? ""}`.toLowerCase().includes(query),
    )
  }, [rows, search])

  const editing = settingsId === null ? undefined : projects.find((p) => p.id === settingsId)

  const sorted = useMemo(() => {
    const list = [...filtered]
    const dir = sortDirection === "asc" ? 1 : -1
    list.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir
        case "status": {
          const aStatus = a.problem?.validationStatus ?? "unvalidated"
          const bStatus = b.problem?.validationStatus ?? "unvalidated"
          return (STATUS_ORDER[aStatus] - STATUS_ORDER[bStatus]) * dir
        }
        case "solutions":
          return (a.solutionCount - b.solutionCount) * dir
        default: {
          // ISO timestamps compare as strings; store position breaks ties for
          // projects created in the same instant (an import, say).
          const byCreated = a.project.createdAt.localeCompare(b.project.createdAt)
          return (byCreated || a.index - b.index) * dir
        }
      }
    })
    return list
  }, [filtered, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 opacity-40" />
    return sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  const sortButton = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="flex items-center gap-1 cursor-pointer select-none hover:text-foreground"
    >
      {label}
      {renderSortIcon(key)}
    </button>
  )

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardHeader className="shrink-0 pb-3 gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle size="md" className="text-foreground">
            Projects ({sorted.length}
            {sorted.length !== projects.length ? ` of ${projects.length}` : ""})
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects"
                className="h-8 pl-8 w-56 text-sm"
              />
            </div>
            {headerExtra}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-full">{sortButton("name", "Project")}</TableHead>
              <TableHead className="w-36">{sortButton("status", "Problem status")}</TableHead>
              <TableHead className="w-28">{sortButton("solutions", "Solutions")}</TableHead>
              <TableHead className="w-28">Team</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Settings</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm py-8">
                  No projects match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map(({ project, problem, solutionCount, name }, rowIndex) => {
                const statusMeta = problem ? TABLE_STATUS_META[problem.validationStatus ?? "unvalidated"] : null
                return (
                  <TableRow
                    key={project.id}
                    onClick={() => router.push(projectRoutes.page(project.id))}
                    className={cn("cursor-pointer", rowIndex % 2 === 1 && "bg-muted/20")}
                  >
                    <TableCell className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className="grid h-6 w-6 shrink-0 place-content-center rounded-full bg-primary text-white">
                          <FolderKanban className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                        <div className="flex flex-col min-w-0">
                          {/* The row is the click target; this link is what keyboard
                              users tab to, so it must not navigate twice. */}
                          <Link
                            href={projectRoutes.page(project.id)}
                            onClick={(event) => event.stopPropagation()}
                            className="line-clamp-1 text-base font-bold hover:underline focus-visible:outline-none focus-visible:underline"
                          >
                            {name}
                          </Link>
                          {problem ? (
                            <span className="flex items-center gap-1.5">
                              <span className="grid h-5 w-5 shrink-0 place-content-center rounded-full bg-secondary-brand text-white">
                                <Target className="h-3 w-3" strokeWidth={2.5} />
                              </span>
                              <span className="line-clamp-1 text-base opacity-70">{problem.title || "Untitled problem"}</span>
                            </span>
                          ) : (
                            <span className="text-base italic opacity-70">No problem identified yet</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {statusMeta ? (
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${statusMeta.className}`}>
                          <statusMeta.icon className="h-3.5 w-3.5" />
                          {statusMeta.label}
                        </div>
                      ) : (
                        <span className="text-sm opacity-70">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                        {solutionCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.members.length > 0 ? (
                        <MemberAvatarStack members={project.members} max={3} className="[&>*]:h-7 [&>*]:w-7" />
                      ) : (
                        <span className="text-sm opacity-70">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* Stopping the click here also covers Enter and Space, which
                          fire a click on the button, so the row underneath never
                          opens the project when the settings button is used. */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSettingsId(project.id)
                        }}
                        aria-label={`Settings for ${name}`}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      <ProjectSettingsDialog
        project={editing}
        open={editing !== undefined}
        onOpenChange={(open) => { if (!open) setSettingsId(null) }}
      />
    </Card>
  )
}
