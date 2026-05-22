"use client"

import { Fragment, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { useRouter } from "next/navigation"
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
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Circle,
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
} from "lucide-react"
import type { Problem } from "@/store/problems-model"
import { cn } from "@/lib/utils"
import { saveActiveDiscoveryProblemId } from "@/lib/active-discovery-problem"

import type { ValidationStatus } from "@/types/validation"

const STATUS_CONFIG: Record<ValidationStatus, { icon: React.ElementType; label: string; className: string }> = {
  unvalidated: { icon: Circle, label: "Unvalidated", className: "text-muted-foreground" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-primary" },
  valid: { icon: CheckCircle2, label: "Valid", className: "text-success" },
  invalid: { icon: XCircle, label: "Invalid", className: "text-destructive" },
  unsure: { icon: HelpCircle, label: "Unsure", className: "text-tertiary" },
}

const STATUS_FILTER_OPTIONS: { value: "all" | ValidationStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "unvalidated", label: "Unvalidated" },
  { value: "in_progress", label: "In Progress" },
  { value: "valid", label: "Valid" },
  { value: "invalid", label: "Invalid" },
  { value: "unsure", label: "Unsure" },
]

type SortKey = "index" | "description" | "source" | "date" | "status"
type SortDirection = "asc" | "desc"

const STATUS_ORDER: Record<ValidationStatus, number> = {
  unvalidated: 0,
  in_progress: 1,
  valid: 2,
  invalid: 3,
  unsure: 4,
}

interface ProblemsTableProps {
  problems: Problem[]
  showStatus?: boolean
  showEditDelete?: boolean
  showSource?: boolean
  className?: string
  headerExtra?: React.ReactNode
  title?: string
}

export function ProblemsTable({ problems, showStatus = false, showEditDelete = false, showSource = true, className, headerExtra, title }: ProblemsTableProps) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ValidationStatus>("all")
  const [sortKey, setSortKey] = useState<SortKey>("index")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

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
      if (query && !problem.description.toLowerCase().includes(query)) return false
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
        case "description":
          return a.problem.description.localeCompare(b.problem.description) * dir
        case "source":
          return a.problem.source.localeCompare(b.problem.source) * dir
        case "date": {
          const aTime = new Date(a.problem.createdAt).getTime()
          const bTime = new Date(b.problem.createdAt).getTime()
          return (aTime - bTime) * dir
        }
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
    <Card className={cn("flex flex-col overflow-hidden", className)}>
        <CardHeader className="shrink-0 pb-3 gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-semibold">
              {title ?? "Problems"} ({sortedProblems.length}
              {sortedProblems.length !== problems.length ? ` of ${problems.length}` : ""})
            </CardTitle>
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
                <TableHead className="w-10">
                  <button
                    type="button"
                    onClick={() => handleSort("index")}
                    className={cn("flex items-center gap-1", sortableHeaderClass)}
                  >
                    #{renderSortIcon("index")}
                  </button>
                </TableHead>
                <TableHead className="w-full">
                  <button
                    type="button"
                    onClick={() => handleSort("description")}
                    className={cn("flex items-center gap-1", sortableHeaderClass)}
                  >
                    Description{renderSortIcon("description")}
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
                <TableHead className="w-28">
                  <button
                    type="button"
                    onClick={() => handleSort("date")}
                    className={cn("flex items-center gap-1", sortableHeaderClass)}
                  >
                    Date{renderSortIcon("date")}
                  </button>
                </TableHead>
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
                    colSpan={4 + (showStatus ? 1 : 0) + (showSource ? 1 : 0)}
                    className="text-center text-sm py-8"
                  >
                    No problems match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedProblems.map(({ problem, originalIndex }, rowIndex) => {
                  const status = showStatus ? (problem.validationStatus ?? "unvalidated") : null
                  const statusConfig = status ? STATUS_CONFIG[status] : null
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
                      aria-label={`Edit problem: ${problem.description || "untitled"}`}
                    >
                      <TableCell>{originalIndex + 1}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          {hasSolutions ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpanded(problem.id)
                              }}
                              className="flex items-center justify-center w-6 h-6 rounded border border-tertiary text-tertiary hover:bg-tertiary/10 shrink-0"
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
                          {problem.description ? (
                            <span className="line-clamp-2">{problem.description}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      {showSource && (
                        <TableCell className="text-sm capitalize">
                          {problem.source}
                        </TableCell>
                      )}
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(problem.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </TableCell>
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
                                  variant="outline-card"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => router.push(`/problems/${problem.id}`)}
                                  aria-label="Edit problem"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit problem</TooltipContent>
                            </Tooltip>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline-card" size="icon" className="h-7 w-7" aria-label="Actions">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                      const sStatusConfig = STATUS_CONFIG[sStatus]
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
                          aria-label={`Edit solution: ${solutionLabel}`}
                        >
                          <TableCell />
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2 pl-8">
                              <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="line-clamp-2">{solutionLabel}</span>
                            </div>
                          </TableCell>
                          {showSource && <TableCell />}
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(s.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </TableCell>
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
                                    variant="outline-card"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => router.push(`/solutions/${s.id}`)}
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
                                    <MoreHorizontal className="h-3.5 w-3.5" />
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
  )
}
