"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2, ArrowRight, CheckCircle2, XCircle, HelpCircle, Clock, Circle } from "lucide-react"
import type { Problem } from "@/store/problems-model"
import { EditProblemDialog } from "@/components/edit-problem-dialog"

import type { ValidationStatus } from "@/types/idea"

const STATUS_CONFIG: Record<ValidationStatus, { icon: React.ElementType; label: string; className: string }> = {
  unvalidated: { icon: Circle, label: "Unvalidated", className: "text-muted-foreground" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-yellow-600" },
  valid: { icon: CheckCircle2, label: "Valid", className: "text-green-600" },
  invalid: { icon: XCircle, label: "Invalid", className: "text-red-600" },
  unsure: { icon: HelpCircle, label: "Unsure", className: "text-orange-600" },
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
                <TableHead className="w-full">Description</TableHead>
                <TableHead className="w-24">Source</TableHead>
                <TableHead className="w-28">Date</TableHead>
                {showStatus && <TableHead className="w-36">Status</TableHead>}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem, index) => {
                const status = showStatus ? (problem.validationStatus ?? "unvalidated") : null
                const statusConfig = status ? STATUS_CONFIG[status] : null
                return (
                  <TableRow key={problem.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="text-sm">
                      {problem.description ? (
                        <span className="line-clamp-2">{problem.description}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
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
                          variant="ghost"
                          size="sm"
                          className="h-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/problems/${problem.id}/alternatives`)}
                          aria-label="Validate problem"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                          <span className="hidden md:inline ml-1">Validate</span>
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
