"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector, useStore } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { buildSolutionBundle, downloadProblemBundle } from "@/lib/problem-export"
import { ExportBundleDialog } from "@/components/export-bundle-dialog"
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
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Circle,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Lightbulb,
  Target,
  MoreHorizontal,
  ClipboardCheck,
  FileJson,
} from "lucide-react"
import type { Solution } from "@/store/solutions-model"
import { cn } from "@/lib/utils"
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

type SortKey = "index" | "title" | "problem" | "date" | "status"
type SortDirection = "asc" | "desc"

const STATUS_ORDER: Record<ValidationStatus, number> = {
  unvalidated: 0,
  in_progress: 1,
  valid: 2,
  invalid: 3,
  unsure: 4,
}

interface SolutionsTableProps {
  solutions: Solution[]
  showStatus?: boolean
  showEditDelete?: boolean
  className?: string
  headerExtra?: React.ReactNode
  title?: string
}

export function SolutionsTable({ solutions, showStatus = true, showEditDelete = true, className, headerExtra, title }: SolutionsTableProps) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const problems = useSelector((state: RootState) => state.problems.problems)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ValidationStatus>("all")
  const [sortKey, setSortKey] = useState<SortKey>("index")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [exportSolutionId, setExportSolutionId] = useState<number | null>(null)

  const runSolutionExport = (solutionId: number, includeProblem: boolean) => {
    const bundle = buildSolutionBundle(store.getState(), solutionId, { includeProblem })
    if (!bundle) {
      toast.error("Could not export this solution.")
      return
    }
    downloadProblemBundle(bundle)
    toast.success("Solution exported.")
  }

  const indexedSolutions = useMemo(
    () => solutions.map((solution, index) => {
      const problem = problems.find((p) => p.id === solution.problemId)
      const problemHaystack = `${problem?.title ?? ""} ${problem?.description ?? ""}`.trim()
      return { solution, originalIndex: index, problemDescription: problemHaystack }
    }),
    [solutions, problems],
  )

  const filteredSolutions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return indexedSolutions.filter(({ solution, problemDescription }) => {
      if (query) {
        const haystack = `${solution.title} ${solution.description} ${problemDescription}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (showStatus && statusFilter !== "all") {
        const status = solution.validationStatus ?? "unvalidated"
        if (status !== statusFilter) return false
      }
      return true
    })
  }, [indexedSolutions, search, statusFilter, showStatus])

  const sortedSolutions = useMemo(() => {
    const rows = [...filteredSolutions]
    const dir = sortDirection === "asc" ? 1 : -1
    rows.sort((a, b) => {
      switch (sortKey) {
        case "index":
          return (a.originalIndex - b.originalIndex) * dir
        case "title":
          return a.solution.title.localeCompare(b.solution.title) * dir
        case "problem":
          return a.problemDescription.localeCompare(b.problemDescription) * dir
        case "date": {
          const aTime = new Date(a.solution.createdAt).getTime()
          const bTime = new Date(b.solution.createdAt).getTime()
          return (aTime - bTime) * dir
        }
        case "status": {
          const aStatus = a.solution.validationStatus ?? "unvalidated"
          const bStatus = b.solution.validationStatus ?? "unvalidated"
          return (STATUS_ORDER[aStatus] - STATUS_ORDER[bStatus]) * dir
        }
        default:
          return 0
      }
    })
    return rows
  }, [filteredSolutions, sortKey, sortDirection])

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
          <CardTitle className="text-sm font-semibold">
            {title ?? "Solutions"} ({sortedSolutions.length}
            {sortedSolutions.length !== solutions.length ? ` of ${solutions.length}` : ""})
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {headerExtra}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search solutions"
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
                  onClick={() => handleSort("title")}
                  className={cn("flex items-center gap-1", sortableHeaderClass)}
                >
                  Solution{renderSortIcon("title")}
                </button>
              </TableHead>
              <TableHead className="w-64">
                <button
                  type="button"
                  onClick={() => handleSort("problem")}
                  className={cn("flex items-center gap-1", sortableHeaderClass)}
                >
                  Problem{renderSortIcon("problem")}
                </button>
              </TableHead>
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
            {sortedSolutions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showStatus ? 6 : 5}
                  className="text-center text-sm py-8"
                >
                  No solutions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              sortedSolutions.map(({ solution, originalIndex, problemDescription }, rowIndex) => {
                const status = showStatus ? (solution.validationStatus ?? "unvalidated") : null
                const statusConfig = status ? STATUS_CONFIG[status] : null
                const zebra = rowIndex % 2 === 1 ? "bg-muted/20" : undefined
                return (
                  <TableRow
                    key={solution.id}
                    className={cn(zebra, "cursor-pointer hover:bg-muted/40")}
                    onClick={() => router.push(`/solutions/${solution.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        router.push(`/solutions/${solution.id}`)
                      }
                    }}
                    aria-label={`View solution: ${solution.title || "untitled"}`}
                  >
                    <TableCell>{originalIndex + 1}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                        {solution.title ? (
                          <span className="line-clamp-2 font-medium">{solution.title}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Untitled solution</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-tertiary shrink-0" />
                        {problemDescription ? (
                          <span className="line-clamp-2">{problemDescription}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(solution.createdAt).toLocaleDateString("en-GB", {
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
                                onClick={() => router.push(`/solutions/${solution.id}`)}
                                aria-label="View solution canvas"
                              >
                                <Eye className="h-3.5 w-3.5 text-tertiary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View canvas</TooltipContent>
                          </Tooltip>
                        )}
                        {showEditDelete && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline-card"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => router.push(`/solutions/${solution.id}/edit`)}
                                aria-label="Edit solution"
                              >
                                <Pencil className="h-3.5 w-3.5 text-tertiary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit solution</TooltipContent>
                          </Tooltip>
                        )}
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline-card" size="icon" className="h-7 w-7" aria-label="Actions">
                              <MoreHorizontal className="h-3.5 w-3.5 text-tertiary" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/solutions/${solution.id}/validate/introduction`)}>
                              <ClipboardCheck className="h-3.5 w-3.5" />
                              Open solution validation
                            </DropdownMenuItem>
                            {solution.problemId != null && (
                              <DropdownMenuItem onClick={() => router.push(`/problems/${solution.problemId}/edit`)}>
                                <Target className="h-3.5 w-3.5" />
                                Open problem
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setExportSolutionId(solution.id)}>
                              <FileJson className="h-3.5 w-3.5" />
                              Export
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {showEditDelete && (
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
                            onConfirm={() => dispatch.solutions.delete(solution.id)}
                          />
                        )}
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
    <ExportBundleDialog
      open={exportSolutionId != null}
      onOpenChange={(open) => { if (!open) setExportSolutionId(null) }}
      kind="solution"
      onConfirm={(includeProblem) => {
        if (exportSolutionId != null) runSolutionExport(exportSolutionId, includeProblem)
      }}
    />
    </>
  )
}
