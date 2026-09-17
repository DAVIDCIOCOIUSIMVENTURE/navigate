"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import type { AppDispatch, RootState } from "@/store"
import type { Project } from "@/store/projects-model"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberAvatarStack } from "@/components/member-avatar"
import { DELETE_PROJECT_COPY } from "@/components/project-name-dialog"
import { ProjectSettingsDialog } from "@/components/project-settings-dialog"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  FolderKanban,
  Lightbulb,
  MoreHorizontal,
  Search,
  Settings,
  Target,
  Trash2,
} from "lucide-react"
import { problemOfProject, projectDisplayName, projectRoutes } from "@/lib/projects"
import { TABLE_STATUS_META, STATUS_ORDER } from "@/lib/status-table"
import { cn } from "@/lib/utils"

type SortKey = "index" | "name" | "status" | "solutions"
type SortDirection = "asc" | "desc"

/**
 * The home page list: one row per project with its problem, the problem's
 * validation status and how many solutions it has.
 * The eye button opens the project page; everything else (settings, delete)
 * sits in the row's actions menu. Deleting a project also removes its problem
 * and solutions.
 */
export function ProjectsTable({ projects, className }: { projects: Project[]; className?: string }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("index")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [settingsId, setSettingsId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

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
        default:
          return (a.index - b.index) * dir
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

  const editing = settingsId === null ? undefined : projects.find((p) => p.id === settingsId)

  return (
    <>
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
                <TableHead />
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
                    <TableRow key={project.id} className={rowIndex % 2 === 1 ? "bg-muted/20" : undefined}>
                      <TableCell className="text-sm">
                        <div className="flex items-start gap-2">
                          <FolderKanban className="h-3.5 w-3.5 mt-1 text-quaternary shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="line-clamp-1 font-medium">{name}</span>
                            {problem ? (
                              <span className="flex items-center gap-1.5 opacity-70">
                                <Target className="h-3 w-3 shrink-0 text-tertiary" />
                                <span className="line-clamp-1">{problem.title || "Untitled problem"}</span>
                              </span>
                            ) : (
                              <span className="italic opacity-70">No problem identified yet</span>
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
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="secondary-brand"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => router.push(projectRoutes.page(project.id))}
                                aria-label={`Open ${name}`}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Open project</TooltipContent>
                          </Tooltip>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline-card"
                                size="icon"
                                className="h-7 w-7"
                                aria-label={`Actions for ${name}`}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5 text-tertiary" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSettingsId(project.id)}>
                                <Settings className="h-3.5 w-3.5" />
                                Settings: name and team
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(project.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ProjectSettingsDialog
        project={editing}
        open={editing !== undefined}
        onOpenChange={(open) => { if (!open) setSettingsId(null) }}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title={DELETE_PROJECT_COPY.title}
        description={DELETE_PROJECT_COPY.description}
        onConfirm={() => {
          if (deleteId !== null) dispatch.projects.delete(deleteId)
          setDeleteId(null)
        }}
      />
    </>
  )
}
