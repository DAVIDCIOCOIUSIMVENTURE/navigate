"use client"

import { useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
  Pencil,
  Trash2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Circle,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import type { Problem } from "@/store/problems-model"
import { EditProblemDialog } from "@/components/edit-problem-dialog"
import { cn } from "@/lib/utils"

import type { ValidationStatus } from "@/types/idea"

const STATUS_CONFIG: Record<ValidationStatus, { icon: React.ElementType; label: string; className: string }> = {
  unvalidated: { icon: Circle, label: "Unvalidated", className: "text-muted-foreground" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-yellow-600" },
  valid: { icon: CheckCircle2, label: "Valid", className: "text-green-600" },
  invalid: { icon: XCircle, label: "Invalid", className: "text-red-600" },
  unsure: { icon: HelpCircle, label: "Unsure", className: "text-orange-600" },
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
}

export function ProblemsTable({ problems, showStatus = false, showEditDelete = false }: ProblemsTableProps) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ValidationStatus>("all")
  const [sortKey, setSortKey] = useState<SortKey>("index")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

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
    <>
      <Card>
        <CardHeader className="pb-3 gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-semibold">
              Problem Bank ({sortedProblems.length}
              {sortedProblems.length !== problems.length ? ` of ${problems.length}` : ""})
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search descriptions"
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
        <CardContent className="pt-0">
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
                <TableHead className="w-24">
                  <button
                    type="button"
                    onClick={() => handleSort("source")}
                    className={cn("flex items-center gap-1", sortableHeaderClass)}
                  >
                    Source{renderSortIcon("source")}
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
              {sortedProblems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showStatus ? 6 : 5}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No problems match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedProblems.map(({ problem, originalIndex }) => {
                  const status = showStatus ? (problem.validationStatus ?? "unvalidated") : null
                  const statusConfig = status ? STATUS_CONFIG[status] : null
                  return (
                    <TableRow key={problem.id}>
                      <TableCell className="text-muted-foreground">{originalIndex + 1}</TableCell>
                      <TableCell className="text-sm">
                        {problem.description ? (
                          <span className="line-clamp-2">{problem.description}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {problem.source}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(problem.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </TableCell>
                      {showStatus && statusConfig && (
                        <TableCell>
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${statusConfig.className}`}>
                            <statusConfig.icon className="h-3.5 w-3.5" />
                            {statusConfig.label}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {showEditDelete && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-muted-foreground"
                                onClick={() => setEditingProblem(problem)}
                                aria-label="Edit problem"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="hidden md:inline ml-1">Edit</span>
                              </Button>
                              <ConfirmDialog
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-muted-foreground hover:text-destructive"
                                    aria-label="Delete problem"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="hidden md:inline ml-1">Delete</span>
                                  </Button>
                                }
                                description="This will permanently delete this problem and any associated data."
                                onConfirm={() => dispatch.problems.delete(problem.id)}
                              />
                            </>
                          )}
                          <Button
                            size="sm"
                            className="h-7"
                            onClick={() => router.push(`/problems/${problem.id}/introduction`)}
                            aria-label="Validate problem"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span className="hidden md:inline ml-1">Validate</span>
                          </Button>
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

      {showEditDelete && (
        <EditProblemDialog
          problem={editingProblem}
          onClose={() => setEditingProblem(null)}
        />
      )}
    </>
  )
}
