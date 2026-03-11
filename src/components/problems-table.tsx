"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2, ArrowRight, CheckCircle2, XCircle, Clock, Circle } from "lucide-react"
import { brainstormColumns } from "@/data/brainstormData"
import type { Problem, ProblemPatch } from "@/store/problems-model"
import { EditProblemDialog } from "@/components/edit-problem-dialog"

const COLUMN_TO_FIELD: Record<string, keyof ProblemPatch> = {
  "customer-segments": "customerSegments",
  "contexts": "contexts",
  "jobs-to-be-done": "jobsToBeDone",
  "problem-types": "problemTypes",
}

const STORAGE_KEY = "navigate-standalone-validation"

type ValidationStatus = "unvalidated" | "in_progress" | "valid" | "invalid"

const STATUS_CONFIG: Record<ValidationStatus, { icon: React.ElementType; label: string; className: string }> = {
  unvalidated: { icon: Circle, label: "Unvalidated", className: "text-muted-foreground" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-yellow-600" },
  valid: { icon: CheckCircle2, label: "Valid", className: "text-green-600" },
  invalid: { icon: XCircle, label: "Invalid", className: "text-red-600" },
}

function loadAllStatuses(): Record<number, ValidationStatus> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const all = JSON.parse(raw) as Record<string, { status: ValidationStatus }>
    const result: Record<number, ValidationStatus> = {}
    for (const [key, val] of Object.entries(all)) {
      result[Number(key)] = val.status ?? "unvalidated"
    }
    return result
  } catch {
    return {}
  }
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
  const [statuses, setStatuses] = useState<Record<number, ValidationStatus>>({})

  useEffect(() => {
    if (showStatus) setStatuses(loadAllStatuses())
  }, [showStatus])

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Problems ({problems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Description</TableHead>
                {brainstormColumns.map((col) => (
                  <TableHead key={col.id}>{col.title}</TableHead>
                ))}
                <TableHead className="w-24">Source</TableHead>
                <TableHead className="w-28">Date</TableHead>
                {showStatus && <TableHead className="w-36">Status</TableHead>}
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem, index) => {
                const status = showStatus ? (statuses[problem.id] ?? "unvalidated") : null
                const statusConfig = status ? STATUS_CONFIG[status] : null
                return (
                  <TableRow key={problem.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="text-sm max-w-48">
                      {problem.description ? (
                        <span className="line-clamp-2">{problem.description}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {brainstormColumns.map((col) => {
                      const field = COLUMN_TO_FIELD[col.id]
                      const labels = problem[field]
                      return (
                        <TableCell key={col.id}>
                          {labels.length > 0 ? (
                            <span className="text-sm">{labels.join(", ")}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )
                    })}
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
                              size="icon"
                              className="h-7 w-7 text-muted-foreground"
                              onClick={() => setEditingProblem(problem)}
                              aria-label="Edit problem"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => dispatch.problems.delete(problem.id)}
                              aria-label="Delete problem"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/problem-validation/${problem.id}/alternatives`)}
                          aria-label="Validate problem"
                          title="Validate this problem"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
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
