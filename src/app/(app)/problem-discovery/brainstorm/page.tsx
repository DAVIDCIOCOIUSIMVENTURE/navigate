"use client"

import { useState, useRef, useEffect } from "react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight, Pencil, RotateCcw, Save, Trash2 } from "lucide-react"
import { brainstormColumns, type BrainstormItem, type SavedCombination } from "./data"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

function collectAllIds(items: BrainstormItem[]): string[] {
  return items.flatMap((item) =>
    item.children ? collectAllIds(item.children) : [item.id]
  )
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

export default function BrainstormPage() {
  const dispatch = useDispatch<AppDispatch>()
  const savedCombinations = useSelector((state: RootState) => state.brainstorm.combinations)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingCombination, setEditingCombination] = useState<SavedCombination | null>(null)
  const [editFields, setEditFields] = useState<Record<string, string>>({})
  const initRef = useRef(false)

  const saveDebounced = useDebouncedCallback((fields: Record<string, string>) => {
    if (!editingCombination) return
    const updatedSelections: Record<string, string[]> = {}
    for (const column of brainstormColumns) {
      const value = fields[column.id]?.trim()
      if (value) {
        updatedSelections[column.id] = value.split(",").map((s) => s.trim()).filter(Boolean)
      }
    }
    dispatch.brainstorm.update({ id: editingCombination.id, selections: updatedSelections })
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

  const saveCombination = () => {
    const selections: Record<string, string[]> = {}
    for (const column of brainstormColumns) {
      const allIds = collectAllIds(column.items)
      const selectedLabels = allIds
        .filter((id) => selected.has(id))
        .map((id) => findLabel(column.items, id))
        .filter((label): label is string => label !== null)
      if (selectedLabels.length > 0) {
        selections[column.id] = selectedLabels
      }
    }

    dispatch.brainstorm.add({
      selectedIds: [...selected],
      selections,
      savedAt: new Date().toISOString(),
    })
    clearAll()
  }

  const openEditDialog = (combination: SavedCombination) => {
    initRef.current = false
    const fields: Record<string, string> = {}
    for (const column of brainstormColumns) {
      fields[column.id] = combination.selections[column.id]?.join(", ") ?? ""
    }
    setEditFields(fields)
    setEditingCombination(combination)
  }

  const deleteCombination = (id: number) => {
    dispatch.brainstorm.delete(id)
  }

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Discover Business Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Explore potential areas for innovation by navigating through the options below.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalSelected > 0 && (
            <span className="text-sm text-muted-foreground">
              {totalSelected} selected
            </span>
          )}
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
            onClick={saveCombination}
            disabled={totalSelected === 0}
            className="gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            Save Problem
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {brainstormColumns.map((column) => (
          <Card key={column.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {column.title}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {collectAllIds(column.items).filter((id) => selected.has(id)).length} / {collectAllIds(column.items).length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ScrollArea className="h-[calc(100vh-520px)]">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Saved Problems ({savedCombinations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                {brainstormColumns.map((column) => (
                  <TableHead key={column.id}>{column.title}</TableHead>
                ))}
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedCombinations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={brainstormColumns.length + 2}
                    className="text-center text-muted-foreground py-8"
                  >
                    No problems saved yet. Select items above and click &quot;Save Problem&quot;.
                  </TableCell>
                </TableRow>
              ) : (
                savedCombinations.map((combination, index) => (
                  <TableRow key={combination.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    {brainstormColumns.map((column) => {
                      const labels = combination.selections[column.id]
                      return (
                        <TableCell key={column.id}>
                          {labels ? (
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
                          onClick={() => openEditDialog(combination)}
                          aria-label="Edit combination"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteCombination(combination.id)}
                          aria-label="Delete combination"
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
        </CardContent>
      </Card>

      <Dialog open={editingCombination !== null} onOpenChange={(open) => { if (!open) setEditingCombination(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Problem</DialogTitle>
            <DialogDescription>
              Changes are saved automatically. Use commas to separate multiple items.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {brainstormColumns.map((column) => (
              <div key={column.id} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor={`edit-${column.id}`}>
                  {column.title}
                </label>
                <Input
                  id={`edit-${column.id}`}
                  value={editFields[column.id] ?? ""}
                  onChange={(e) =>
                    setEditFields((prev) => ({ ...prev, [column.id]: e.target.value }))
                  }
                  placeholder={`e.g. ${column.items[0]?.label}, ${column.items[1]?.label}`}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
