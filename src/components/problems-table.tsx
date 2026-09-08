"use client"

import { Fragment, useMemo, useState } from "react"
import { useDispatch, useSelector, useStore } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { buildProblemBundle, downloadProblemBundle, duplicateProblem } from "@/lib/problem-export"
import { ExportBundleDialog } from "@/components/export-bundle-dialog"
import { DuplicateProblemDialog } from "@/components/duplicate-problem-dialog"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Target,
  MoreHorizontal,
  ClipboardCheck,
  Compass,
  FileJson,
  Copy,
} from "lucide-react"
import type { Problem } from "@/store/problems-model"
import { cn } from "@/lib/utils"
import { saveActiveDiscoveryProblemId } from "@/lib/active-discovery-problem"
import { TABLE_STATUS_META, STATUS_FILTER_OPTIONS, STATUS_ORDER } from "@/lib/status-table"

import type { ValidationStatus } from "@/types/validation"

type SortKey = "index" | "title" | "source" | "status"
type SortDirection = "asc" | "desc"

interface ProblemsTableProps {
  problems: Problem[]
  showStatus?: boolean
  showEditDelete?: boolean
  showSource?: boolean
  className?: string
  headerLead?: React.ReactNode
  headerExtra?: React.ReactNode
  title?: string
}

export function ProblemsTable({ problems, showStatus = false, showEditDelete = false, showSource = true, className, headerLead, headerExtra, title }: ProblemsTableProps) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ValidationStatus>("all")
  const [sortKey, setSortKey] = useState<SortKey>("index")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [exportProblemId, setExportProblemId] = useState<number | null>(null)
  const [duplicateProblemId, setDuplicateProblemId] = useState<number | null>(null)

  const runProblemExport = (problemId: number, includeSolutions: boolean) => {
    const bundle = buildProblemBundle(store.getState(), problemId, { includeSolutions })
    if (!bundle) {
      toast.error("Could not export this problem.")
      return
    }
    downloadProblemBundle(bundle)
    toast.success("Problem exported.")
  }

  const runProblemDuplicate = async (problemId: number, includeSolutions: boolean) => {
    const result = await duplicateProblem(store.getState(), dispatch, problemId, { includeSolutions })
    if (!result) {
      toast.error("Could not duplicate this problem.")
      return
    }
    const tail = includeSolutions && result.solutionCount > 0
      ? ` with ${result.solutionCount} solution${result.solutionCount === 1 ? "" : "s"}`
      : ""
    toast.success(`Problem duplicated${tail}.`)
  }

  const solutionsByProblemId = useMemo(() => {
    const map = new Map<number, typeof solutions>()
    for (const s of solutions) {
      const list = map.get(s.problemId) ?? []
      list.push(s)
      map.set(s.problemId, list)
    }
    return map
  }, [solutions])

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const indexedProblems = useMemo(
    () => problems.map((problem, index) => ({ problem, originalIndex: index })),
    [problems],
  )

  const filteredProblems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return indexedProblems.filter(({ problem }) => {
      if (query) {
        const haystack = `${problem.title} ${problem.description}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (showStatus && statusFilter !== "all") {
        const status = problem.validationStatus ?? "unvalidated"
        if (status !== statusFilter) return false
      }
      return true
    })
  }, [indexedProblems, search, statusFilter, showStatus])

  const sortedProblems = useMemo(() => {
    const rows = [...filteredProblems]
    const dir = sortDirection === "asc" ? 1 : -1
    rows.sort((a, b) => {
      switch (sortKey) {
        case "index":
          return (a.originalIndex - b.originalIndex) * dir
        case "title":
          return a.problem.title.localeCompare(b.problem.title) * dir
        case "source":
          return a.problem.source.localeCompare(b.problem.source) * dir
        case "status": {
          const aStatus = a.problem.validationStatus ?? "unvalidated"
          const bStatus = b.problem.validationStatus ?? "unvalidated"
          return (STATUS_ORDER[aStatus] - STATUS_ORDER[bStatus]) * dir
        }
        default:
          return 0
      }
    })
    return rows
  }, [filteredProblems, sortKey, sortDirection])

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
    return sortDirection === "asc"
      ? <ArrowUp className="h-3 w-3" />
      : <ArrowDown className="h-3 w-3" />
  }

  const sortableHeaderClass = "cursor-pointer select-none hover:text-foreground"

  return (
    <>
    <Card className={cn("flex flex-col overflow-hidden", className)}>
        <CardHeader className="shrink-0 pb-3 gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {headerLead ?? (
              <CardTitle size="md">
                {title ?? "Problem library"} ({sortedProblems.length}
                {sortedProblems.length !== problems.length ? ` of ${problems.length}` : ""})
              </CardTitle>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {headerExtra}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search problems"
                  className="h-8 pl-8 w-56 text-sm"
                />
              </div>
              {showStatus && (
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "all" | ValidationStatus)}
                >
                  <SelectTrigger className="h-8 w-40 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-full">
                  <button
                    type="button"
                    onClick={() => handleSort("title")}
                    className={cn("flex items-center gap-1", sortableHeaderClass)}
                  >
                    Title{renderSortIcon("title")}
                  </button>
                </TableHead>
                {showSource && (
                  <TableHead className="w-24">
                    <button
                      type="button"
                      onClick={() => handleSort("source")}
                      className={cn("flex items-center gap-1", sortableHeaderClass)}
                    >
                      Source{renderSortIcon("source")}
                    </button>
                  </TableHead>
                )}
                {showStatus && (
                  <TableHead className="w-36">
                    <button
                      type="button"
                      onClick={() => handleSort("status")}
                      className={cn("flex items-center gap-1", sortableHeaderClass)}
                    >
                      Status{renderSortIcon("status")}
                    </button>
                  </TableHead>
                )}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProblems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2 + (showStatus ? 1 : 0) + (showSource ? 1 : 0)}
                    className="text-center text-sm py-8"
                  >
                    No problems match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedProblems.map(({ problem }, rowIndex) => {
                  const status = showStatus ? (problem.validationStatus ?? "unvalidated") : null
                  const statusConfig = status ? TABLE_STATUS_META[status] : null
                  const linkedSolutions = solutionsByProblemId.get(problem.id) ?? []
                  const hasSolutions = linkedSolutions.length > 0
                  const expanded = expandedIds.has(problem.id)
                  const zebra = rowIndex % 2 === 1 ? "bg-muted/20" : undefined
                  return (
                    <Fragment key={problem.id}>
                    <TableRow
                      className={cn(zebra, expanded && hasSolutions && "border-b-0", "cursor-pointer hover:bg-muted/40")}
                      onClick={() => router.push(`/problems/${problem.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          router.push(`/problems/${problem.id}`)
                        }
                      }}
                      aria-label={`View problem: ${problem.title || "untitled"}`}
                    >
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          {hasSolutions ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpanded(problem.id)
                              }}
                              className="flex items-center justify-center w-6 h-6 rounded border border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 shrink-0"
                              aria-label={expanded ? "Hide solutions" : `View ${linkedSolutions.length} solution${linkedSolutions.length === 1 ? "" : "s"}`}
                              aria-expanded={expanded}
                            >
                              {expanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </button>
                          ) : (
                            <div className="w-6 h-6 shrink-0" />
                          )}
                          <Target className="h-3.5 w-3.5 text-tertiary shrink-0" />
                          <div className="flex flex-col min-w-0">
                            {problem.title ? (
                              <span className="line-clamp-1 font-medium">{problem.title}</span>
                            ) : (
                              <span className="italic opacity-70">Untitled problem</span>
                            )}
                            {problem.description && (
                              <span className="line-clamp-2 opacity-70">{problem.description}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {showSource && (
                        <TableCell className="text-sm capitalize">
                          {problem.source}
                        </TableCell>
                      )}
                      {showStatus && statusConfig && (
                        <TableCell>
                          <div className={`flex items-center gap-1.5 text-sm font-medium ${statusConfig.className}`}>
                            <statusConfig.icon className="h-3.5 w-3.5" />
                            {statusConfig.label}
                          </div>
                        </TableCell>
                      )}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {showEditDelete && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary-brand"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => router.push(`/problems/${problem.id}`)}
                                  aria-label="View problem canvas"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View canvas</TooltipContent>
                            </Tooltip>
                          )}
                          {showEditDelete && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary-brand"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => router.push(`/problems/${problem.id}/edit`)}
                                  aria-label="Edit problem"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit problem</TooltipContent>
                            </Tooltip>
                          )}
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline-card" size="icon" className="h-7 w-7" aria-label="Actions">
                                <MoreHorizontal className="h-3.5 w-3.5 text-tertiary" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/problems/${problem.id}/explore/introduction`)}>
                                <Compass className="h-3.5 w-3.5" />
                                Explore the problem
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/problems/${problem.id}/validation/introduction`)}>
                                <ClipboardCheck className="h-3.5 w-3.5" />
                                Open problem validation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                saveActiveDiscoveryProblemId(problem.id)
                                router.push("/solutions/discover/select-problem")
                              }}>
                                <Lightbulb className="h-3.5 w-3.5" />
                                Identify solutions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDuplicateProblemId(problem.id)}>
                                <Copy className="h-3.5 w-3.5" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setExportProblemId(problem.id)}>
                                <FileJson className="h-3.5 w-3.5" />
                                Export
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {showEditDelete && (
                            <>
                              <ConfirmDialog
                                tooltip="Delete problem"
                                trigger={
                                  <Button
                                    variant="destructive-outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    aria-label="Delete problem"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                }
                                description="This will permanently delete this problem and any associated data."
                                onConfirm={() => dispatch.problems.delete(problem.id)}
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {hasSolutions && expanded && linkedSolutions.map((s) => {
                      const sStatus = s.validationStatus ?? "unvalidated"
                      const sStatusConfig = TABLE_STATUS_META[sStatus]
                      const solutionLabel = s.title || `Solution #${s.id}`
                      return (
                        <TableRow
                          key={s.id}
                          className="bg-muted/30 cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/solutions/${s.id}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              router.push(`/solutions/${s.id}`)
                            }
                          }}
                          aria-label={`View solution: ${solutionLabel}`}
                        >
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2 pl-8">
                              <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="line-clamp-2">{solutionLabel}</span>
                            </div>
                          </TableCell>
                          {showSource && <TableCell />}
                          {showStatus && (
                            <TableCell>
                              <div className={`flex items-center gap-1.5 text-sm font-medium ${sStatusConfig.className}`}>
                                <sStatusConfig.icon className="h-3.5 w-3.5" />
                                {sStatusConfig.label}
                              </div>
                            </TableCell>
                          )}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="secondary-brand"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => router.push(`/solutions/${s.id}`)}
                                    aria-label="View solution canvas"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View canvas</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="secondary-brand"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => router.push(`/solutions/${s.id}/edit`)}
                                    aria-label="Edit solution"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit solution</TooltipContent>
                              </Tooltip>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline-card" size="icon" className="h-7 w-7" aria-label="Actions">
                                    <MoreHorizontal className="h-3.5 w-3.5 text-tertiary" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/solutions/${s.id}/validate/introduction`)}>
                                    <ClipboardCheck className="h-3.5 w-3.5" />
                                    Open solution validation
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <ConfirmDialog
                                tooltip="Delete solution"
                                trigger={
                                  <Button
                                    variant="destructive-outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    aria-label="Delete solution"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                }
                                description="This will permanently delete this solution and any associated validation data."
                                onConfirm={() => dispatch.solutions.delete(s.id)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    </Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ExportBundleDialog
        open={exportProblemId != null}
        onOpenChange={(open) => { if (!open) setExportProblemId(null) }}
        kind="problem"
        onConfirm={(includeSolutions) => {
          if (exportProblemId != null) runProblemExport(exportProblemId, includeSolutions)
        }}
      />
      <DuplicateProblemDialog
        open={duplicateProblemId != null}
        onOpenChange={(open) => { if (!open) setDuplicateProblemId(null) }}
        linkedSolutionCount={duplicateProblemId != null ? (solutionsByProblemId.get(duplicateProblemId)?.length ?? 0) : 0}
        onConfirm={(includeSolutions) => {
          if (duplicateProblemId != null) runProblemDuplicate(duplicateProblemId, includeSolutions)
        }}
      />
    </>
  )
}
