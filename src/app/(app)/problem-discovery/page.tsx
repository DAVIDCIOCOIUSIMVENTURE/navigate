"use client"

import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SearchProblemDialog } from "@/components/search-problem-dialog"
import { Plus, Search, Trash2, Pencil } from "lucide-react"
import { brainstormColumns } from "@/data/brainstormData"
import type { SavedCombination } from "@/app/(app)/problem-discovery/brainstorm/data"
import type { TopLevelProblem } from "@/store/problems-model"

function useDebouncedCallback<T>(callback: (value: T) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return (value: T) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => callback(value), delay)
  }
}

export default function ProblemDiscoveryPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const combinations = useSelector((state: RootState) => state.brainstorm.combinations)
  const dispatch = useDispatch<AppDispatch>()

  const [editingCombination, setEditingCombination] = useState<SavedCombination | null>(null)
  const [editCombinationFields, setEditCombinationFields] = useState<Record<string, string>>({})
  const combinationInitRef = useRef(false)

  const [editingProblem, setEditingProblem] = useState<TopLevelProblem | null>(null)
  const [editProblemStatement, setEditProblemStatement] = useState("")
  const problemInitRef = useRef(false)

  const saveCombinationDebounced = useDebouncedCallback((fields: Record<string, string>) => {
    if (!editingCombination) return
    const updatedSelections: Record<string, string[]> = {}
    for (const col of brainstormColumns) {
      const value = fields[col.id]?.trim()
      if (value) {
        updatedSelections[col.id] = value.split(",").map((s) => s.trim()).filter(Boolean)
      }
    }
    dispatch.brainstorm.update({ id: editingCombination.id, selections: updatedSelections })
  }, 500)

  const saveProblemDebounced = useDebouncedCallback((statement: string) => {
    if (!editingProblem || !statement.trim()) return
    dispatch.problems.update({ id: editingProblem.id, statement: statement.trim() })
  }, 500)

  useEffect(() => {
    if (!combinationInitRef.current) { combinationInitRef.current = true; return }
    saveCombinationDebounced(editCombinationFields)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCombinationFields])

  useEffect(() => {
    if (!problemInitRef.current) { problemInitRef.current = true; return }
    saveProblemDebounced(editProblemStatement)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editProblemStatement])

  function openEditCombination(combination: SavedCombination) {
    combinationInitRef.current = false
    const fields: Record<string, string> = {}
    for (const col of brainstormColumns) {
      fields[col.id] = combination.selections[col.id]?.join(", ") ?? ""
    }
    setEditCombinationFields(fields)
    setEditingCombination(combination)
  }

  function openEditProblem(problem: TopLevelProblem) {
    problemInitRef.current = false
    setEditProblemStatement(problem.statement)
    setEditingProblem(problem)
  }

  const isEmpty = problems.length === 0 && combinations.length === 0
  const totalCount = combinations.length + problems.length

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Problem Discovery</h1>
          <p className="text-sm text-muted-foreground">
            Identify and collect problems worth solving before deciding which one to validate.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Search for new problem
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No problems yet</h2>
            <p className="text-sm text-muted-foreground">
              Start by searching for problems using the brainstorming tool or define one directly.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Search for new problem
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Problems ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  {brainstormColumns.map((col) => (
                    <TableHead key={col.id}>{col.title}</TableHead>
                  ))}
                  <TableHead className="w-24">Source</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinations.map((combination, index) => (
                  <TableRow key={`brainstorm-${combination.id}`}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    {brainstormColumns.map((col) => {
                      const labels = combination.selections[col.id]
                      return (
                        <TableCell key={col.id}>
                          {labels?.length ? (
                            <span className="text-sm">{labels.join(", ")}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-sm text-muted-foreground">Brainstorm</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(combination.savedAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => openEditCombination(combination)}
                          aria-label="Edit problem"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => dispatch.brainstorm.delete(combination.id)}
                          aria-label="Delete problem"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {problems.map((problem, index) => (
                  <TableRow key={problem.id}>
                    <TableCell className="text-muted-foreground">{combinations.length + index + 1}</TableCell>
                    <TableCell colSpan={brainstormColumns.length} className="text-sm">
                      {problem.statement}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">Manual</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(problem.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => openEditProblem(problem)}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <SearchProblemDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Edit brainstorm combination dialog */}
      <Dialog
        open={editingCombination !== null}
        onOpenChange={(open) => { if (!open) setEditingCombination(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Problem</DialogTitle>
            <DialogDescription>
              Changes are saved automatically. Use commas to separate multiple items.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {brainstormColumns.map((col) => (
              <div key={col.id} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor={`edit-combo-${col.id}`}>
                  {col.title}
                </label>
                <Input
                  id={`edit-combo-${col.id}`}
                  value={editCombinationFields[col.id] ?? ""}
                  onChange={(e) =>
                    setEditCombinationFields((prev) => ({ ...prev, [col.id]: e.target.value }))
                  }
                  placeholder={`e.g. ${col.items[0]?.label}`}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit manual problem dialog */}
      <Dialog
        open={editingProblem !== null}
        onOpenChange={(open) => { if (!open) setEditingProblem(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Problem</DialogTitle>
            <DialogDescription>
              Changes are saved automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editProblemStatement}
              onChange={(e) => setEditProblemStatement(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
