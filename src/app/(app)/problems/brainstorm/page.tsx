"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight, Pencil, RotateCcw, Save, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { brainstormColumns, type BrainstormItem } from "./data"
import type { Problem } from "@/store/problems-model"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const COLUMN_TO_FIELD: Record<string, keyof Pick<Problem, "customerSegments" | "contexts" | "jobsToBeDone" | "problemTypes">> = {
  "customer-segments": "customerSegments",
  "contexts": "contexts",
  "jobs-to-be-done": "jobsToBeDone",
  "problem-types": "problemTypes",
}

function collectAllIds(items: BrainstormItem[]): string[] {
  return items.flatMap((item) =>
    item.children ? collectAllIds(item.children) : [item.id]
  )
}

function getSelectedForColumn(items: BrainstormItem[], selected: Set<string>): { id: string; label: string }[] {
  return collectAllIds(items)
    .filter((id) => selected.has(id))
    .map((id) => ({ id, label: findLabel(items, id)! }))
}

function findLabel(items: BrainstormItem[], id: string): string | null {
  for (const item of items) {
    if (item.id === id) return item.label
    if (item.children) {
      const found = findLabel(item.children, id)
      if (found) return found
    }
  }
  return null
}

function BrainstormCheckItem({
  item,
  selected,
  onToggle,
}: {
  item: BrainstormItem
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  const isGroup = !!item.children?.length
  const [open, setOpen] = useState(true)

  if (isGroup) {
    const selectedCount = item.children!.filter((c) => selected.has(c.id)).length
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors group">
          {open
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          }
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide select-none flex-1 text-left">
            {item.label}
          </span>
          {selectedCount > 0 && (
            <span className="text-xs text-primary font-medium tabular-nums">
              {selectedCount}
            </span>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-4 flex flex-col">
            {item.children!.map((child) => (
              <BrainstormCheckItem
                key={child.id}
                item={child}
                selected={selected}
                onToggle={onToggle}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const isChecked = selected.has(item.id)

  return (
    <label className="flex items-center gap-2.5 px-1 py-1.5 cursor-pointer rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        checked={isChecked}
        onCheckedChange={() => onToggle(item.id)}
      />
      <span className={cn(
        "text-sm select-none",
        isChecked ? "font-medium text-foreground" : "text-muted-foreground"
      )}>
        {item.label}
      </span>
    </label>
  )
}

function useDebouncedCallback<T>(callback: (value: T) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return (value: T) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => callback(value), delay)
  }
}

function ProblemFormDialog({
  open,
  onOpenChange,
  title,
  fields,
  onFieldsChange,
  actions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: Record<string, string>
  onFieldsChange: (fields: Record<string, string>) => void
  actions?: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor={`${title}-description`}>
              Problem Description
            </label>
            <Textarea
              id={`${title}-description`}
              value={fields["description"] ?? ""}
              onChange={(e) => onFieldsChange({ ...fields, description: e.target.value })}
              placeholder="Describe the problem..."
              rows={3}
            />
          </div>
          {brainstormColumns.map((column) => (
            <div key={column.id} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor={`${title}-${column.id}`}>
                {column.title}
              </label>
              <Input
                id={`${title}-${column.id}`}
                value={fields[column.id] ?? ""}
                onChange={(e) => onFieldsChange({ ...fields, [column.id]: e.target.value })}
                placeholder={`e.g. ${column.items[0]?.label}, ${column.items[1]?.label}`}
              />
            </div>
          ))}
        </div>
        {actions && <div className="flex justify-end gap-2">{actions}</div>}
      </DialogContent>
    </Dialog>
  )
}

export default function BrainstormPage() {
  const dispatch = useDispatch<AppDispatch>()
  const savedProblems = useSelector((state: RootState) =>
    state.problems.problems.filter((p) => p.source === "brainstorm")
  )

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [editFields, setEditFields] = useState<Record<string, string>>({})
  const initRef = useRef(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveFields, setSaveFields] = useState<Record<string, string>>({})
  const [tableDrawerOpen, setTableDrawerOpen] = useState(false)

  const saveDebounced = useDebouncedCallback((fields: Record<string, string>) => {
    if (!editingProblem) return
    const patch: Partial<Pick<Problem, "description" | "customerSegments" | "contexts" | "jobsToBeDone" | "problemTypes">> = {
      description: fields["description"] ?? "",
    }
    for (const column of brainstormColumns) {
      const field = COLUMN_TO_FIELD[column.id]
      const value = fields[column.id]?.trim()
      patch[field] = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []
    }
    dispatch.problems.update({ id: editingProblem.id, patch })
  }, 500)

  useEffect(() => {
    if (!initRef.current) { initRef.current = true; return }
    saveDebounced(editFields)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editFields])

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const clearAll = () => setSelected(new Set())

  const totalSelected = selected.size

  const openSaveDialog = () => {
    const fields: Record<string, string> = { description: "" }
    for (const column of brainstormColumns) {
      const allIds = collectAllIds(column.items)
      const selectedLabels = allIds
        .filter((id) => selected.has(id))
        .map((id) => findLabel(column.items, id))
        .filter((label): label is string => label !== null)
      fields[column.id] = selectedLabels.join(", ")
    }
    setSaveFields(fields)
    setSaveDialogOpen(true)
  }

  const saveCombination = () => {
    const patch: Partial<Pick<Problem, "customerSegments" | "contexts" | "jobsToBeDone" | "problemTypes">> = {}
    for (const column of brainstormColumns) {
      const field = COLUMN_TO_FIELD[column.id]
      const value = saveFields[column.id]?.trim()
      patch[field] = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []
    }
    dispatch.problems.create({ ...patch, source: "brainstorm", description: saveFields["description"]?.trim() ?? "" })
    clearAll()
    setSaveDialogOpen(false)
    toast.success("Problem saved", {
      description: saveFields["description"]?.trim() || "Your problem has been added to the saved problems list.",
      style: { background: "#16a34a", color: "#ffffff", border: "1px solid #16a34a" },
      classNames: { description: "!text-white", icon: "!text-white" },
    })
  }

  const openEditDialog = (problem: Problem) => {
    initRef.current = false
    const fields: Record<string, string> = { description: problem.description ?? "" }
    for (const column of brainstormColumns) {
      const field = COLUMN_TO_FIELD[column.id]
      fields[column.id] = problem[field].join(", ")
    }
    setEditFields(fields)
    setEditingProblem(problem)
  }

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Discover Business Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Explore potential areas for innovation by navigating through the options below.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTableDrawerOpen(true)}
            className="gap-2"
          >
            Show Saved Problems ({savedProblems.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={totalSelected === 0}
            className="gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={openSaveDialog}
            disabled={totalSelected === 0}
            className="gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            Save Problem
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 min-h-0">
        {brainstormColumns.map((column) => {
          const columnSelected = getSelectedForColumn(column.items, selected)
          return (
            <Card key={column.id} className="flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {column.title}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {columnSelected.length} / {collectAllIds(column.items).length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-0 flex flex-col gap-3 min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <div className="flex flex-col gap-0.5 pr-3">
                    {column.items.map((item) => (
                      <BrainstormCheckItem
                        key={item.id}
                        item={item}
                        selected={selected}
                        onToggle={toggleItem}
                      />
                    ))}
                  </div>
                </ScrollArea>
                {columnSelected.length > 0 && (
                  <div className="border-t pt-2 flex flex-wrap gap-1.5">
                    {columnSelected.map(({ id, label }) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5"
                      >
                        {label}
                        <button
                          onClick={() => toggleItem(id)}
                          className="hover:text-primary/70 transition-colors"
                          aria-label={`Remove ${label}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Drawer open={tableDrawerOpen} onOpenChange={setTableDrawerOpen}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>Saved Problems ({savedProblems.length})</DrawerTitle>
            <DrawerDescription className="sr-only">Problems saved from the brainstorming tool</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-auto px-4 pb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Description</TableHead>
                  {brainstormColumns.map((column) => (
                    <TableHead key={column.id}>{column.title}</TableHead>
                  ))}
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedProblems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={brainstormColumns.length + 3}
                      className="text-center text-muted-foreground py-8"
                    >
                      No problems saved yet. Select items above and click &quot;Save Problem&quot;.
                    </TableCell>
                  </TableRow>
                ) : (
                  savedProblems.map((problem, index) => (
                    <TableRow key={problem.id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm max-w-48">
                        {problem.description ? (
                          <span className="line-clamp-2">{problem.description}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      {brainstormColumns.map((column) => {
                        const field = COLUMN_TO_FIELD[column.id]
                        const labels = problem[field]
                        return (
                          <TableCell key={column.id}>
                            {labels.length > 0 ? (
                              <span className="text-sm">{labels.join(", ")}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => openEditDialog(problem)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DrawerContent>
      </Drawer>

      <ProblemFormDialog
        open={saveDialogOpen}
        onOpenChange={(open) => { if (!open) setSaveDialogOpen(false) }}
        title="Save Problem"
        fields={saveFields}
        onFieldsChange={setSaveFields}
        actions={
          <>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCombination}>Save Problem</Button>
          </>
        }
      />

      <ProblemFormDialog
        open={editingProblem !== null}
        onOpenChange={(open) => { if (!open) setEditingProblem(null) }}
        title="Edit Problem"
        fields={editFields}
        onFieldsChange={setEditFields}
      />
    </div>
  )
}
