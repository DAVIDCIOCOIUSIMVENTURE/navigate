"use client"

import { useState, useRef, useEffect, useMemo, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
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
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  MapPin,
  Maximize2,
  Minimize2,
  Pencil,
  RotateCcw,
  Save,
  Settings,
  Target,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { brainstormColumns, type BrainstormItem, type BrainstormColumn } from "./data"
import type { Problem } from "@/store/problems-model"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const COLUMN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "customer-segments": Users,
  "contexts": MapPin,
  "jobs-to-be-done": Target,
  "problem-types": TriangleAlert,
  "self-discovery": Compass,
}

const COLUMN_COLORS: Record<string, { icon: string; border: string; pill: string }> = {
  "customer-segments": { icon: "text-blue-500", border: "border-t-blue-500", pill: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  "contexts": { icon: "text-amber-500", border: "border-t-amber-500", pill: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  "jobs-to-be-done": { icon: "text-emerald-500", border: "border-t-emerald-500", pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  "problem-types": { icon: "text-rose-500", border: "border-t-rose-500", pill: "bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  "self-discovery": { icon: "text-violet-500", border: "border-t-violet-500", pill: "bg-violet-500/10 text-violet-700 dark:text-violet-400" },
}

const COLUMN_TO_FIELD: Record<string, keyof Pick<Problem, "customerSegments" | "contexts" | "jobsToBeDone" | "problemTypes" | "selfDiscovery">> = {
  "customer-segments": "customerSegments",
  "contexts": "contexts",
  "jobs-to-be-done": "jobsToBeDone",
  "problem-types": "problemTypes",
  "self-discovery": "selfDiscovery",
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
  columns,
  actions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: Record<string, string>
  onFieldsChange: (fields: Record<string, string>) => void
  columns: BrainstormColumn[]
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
          {columns.map((column) => (
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
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const savedProblems = useSelector((state: RootState) =>
    state.problems.problems.filter((p) => p.source === "brainstorm")
  )
  const triggers = useSelector((state: RootState) => state.problemTriggers.triggers)

  const selfDiscoveryColumn = useMemo<BrainstormColumn>(() => {
    // Map each question URL to its parent category
    const questionToCat = new Map<string, { url: string; title: string }>()
    for (const cat of SELF_DISCOVERY_CATEGORIES) {
      for (const q of cat.questions) {
        questionToCat.set(q.url, { url: cat.url, title: cat.title })
      }
    }
    // Group triggers by category
    const groups = new Map<string, { title: string; children: BrainstormItem[] }>()
    for (const t of triggers) {
      const cat = questionToCat.get(t.questionUrl)
      const catUrl = cat?.url ?? t.questionUrl
      const catTitle = cat?.title ?? t.questionUrl
      if (!groups.has(catUrl)) groups.set(catUrl, { title: catTitle, children: [] })
      groups.get(catUrl)!.children.push({ id: t.id, label: t.title })
    }
    const items: BrainstormItem[] = Array.from(groups.entries()).map(([url, { title, children }]) => ({
      id: `sd-group-${url}`,
      label: title,
      children,
    }))
    return { id: "self-discovery", title: "Self Discovery", items }
  }, [triggers])

  const allColumns = useMemo<BrainstormColumn[]>(
    () => [selfDiscoveryColumn, ...brainstormColumns],
    [selfDiscoveryColumn]
  )

  const hiddenColumnsArray = useSelector((state: RootState) => state.settings.hiddenBrainstormColumns)
  const hiddenColumns = useMemo(() => new Set(hiddenColumnsArray), [hiddenColumnsArray])

  const toggleColumnVisibility = (columnId: string) => {
    const next = hiddenColumns.has(columnId)
      ? hiddenColumnsArray.filter((id) => id !== columnId)
      : [...hiddenColumnsArray, columnId]
    dispatch.settings.setHiddenBrainstormColumns(next)
  }

  const brainstormSelectedArray = useSelector((state: RootState) => state.settings.brainstormSelected)
  const selected = useMemo(() => new Set(brainstormSelectedArray), [brainstormSelectedArray])
  const setSelected = (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    const next = typeof updater === "function" ? updater(selected) : updater
    dispatch.settings.setBrainstormSelected(Array.from(next))
  }
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [editFields, setEditFields] = useState<Record<string, string>>({})
  const initRef = useRef(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveFields, setSaveFields] = useState<Record<string, string>>({})
  const [nextStepDialogOpen, setNextStepDialogOpen] = useState(false)
  const [lastSavedProblemId, setLastSavedProblemId] = useState<number | null>(null)
  const [tableDrawerOpen, setTableDrawerOpen] = useState(false)
  const fullView = useSelector((state: RootState) => state.settings.fullView)

  // Exit full view when navigating away from this page
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname.includes("/brainstorm")) {
      dispatch.settings.setFullView(false)
    }
  }, [pathname, dispatch.settings])

  // Escape key exits full view
  useEffect(() => {
    if (!fullView) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch.settings.setFullView(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [fullView, dispatch.settings])

  const saveDebounced = useDebouncedCallback((fields: Record<string, string>) => {
    if (!editingProblem) return
    const patch: Partial<Pick<Problem, "description" | "customerSegments" | "contexts" | "jobsToBeDone" | "problemTypes" | "selfDiscovery">> = {
      description: fields["description"] ?? "",
    }
    for (const column of allColumns) {
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
    for (const column of allColumns) {
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

  const saveCombination = async () => {
    const patch: Partial<Pick<Problem, "customerSegments" | "contexts" | "jobsToBeDone" | "problemTypes" | "selfDiscovery">> = {}
    for (const column of allColumns) {
      const field = COLUMN_TO_FIELD[column.id]
      const value = saveFields[column.id]?.trim()
      patch[field] = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []
    }
    const newProblem = await dispatch.problems.create({ ...patch, source: "brainstorm", description: saveFields["description"]?.trim() ?? "" })
    clearAll()
    setSaveDialogOpen(false)
    setLastSavedProblemId(newProblem.id)
    setNextStepDialogOpen(true)
  }

  const openEditDialog = (problem: Problem) => {
    initRef.current = false
    const fields: Record<string, string> = { description: problem.description ?? "" }
    for (const column of allColumns) {
      const field = COLUMN_TO_FIELD[column.id]
      fields[column.id] = problem[field].join(", ")
    }
    setEditFields(fields)
    setEditingProblem(problem)
  }

  const content = (
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
            onClick={() => dispatch.settings.setFullView(!fullView)}
            className="gap-2"
          >
            {fullView ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {fullView ? "Exit Full View" : "Full View"}
          </Button>
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

      <div className="flex gap-4 flex-1 min-h-0">
        {allColumns.map((column) => {
          const columnSelected = getSelectedForColumn(column.items, selected)
          const isHidden = hiddenColumns.has(column.id)
          const Icon = COLUMN_ICONS[column.id]

          const colors = COLUMN_COLORS[column.id]

          if (isHidden) {
            return (
              <Card key={column.id} className={cn("flex flex-col items-center pt-3 pb-4 min-h-0 w-12 shrink-0 border-t-2", colors?.border)}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => toggleColumnVisibility(column.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Show column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex-1" />
                <span className={cn("text-xs font-semibold [writing-mode:vertical-lr] rotate-180 select-none mb-3", colors?.icon || "text-muted-foreground")}>
                  {column.title}
                </span>
                {Icon && <Icon className={cn("h-4 w-4 mb-3", colors?.icon || "text-muted-foreground")} />}
              </Card>
            )
          }

          return (
            <Card key={column.id} className={cn("flex flex-col min-h-0 flex-1 min-w-0 border-t-2", colors?.border)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className={cn("h-4 w-4", colors?.icon || "text-muted-foreground")} />}
                    <CardTitle className={cn("text-sm font-semibold", colors?.icon)}>
                      {column.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {columnSelected.length} / {collectAllIds(column.items).length}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleColumnVisibility(column.id)}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalSelected > 0 && (
        <Card className="shrink-0">
          <CardContent className="py-3">
            <div className="flex flex-wrap gap-1.5">
              {allColumns.flatMap((column) => {
                const columnSelected = getSelectedForColumn(column.items, selected)
                if (columnSelected.length === 0) return []
                const colors = COLUMN_COLORS[column.id]
                const Icon = COLUMN_ICONS[column.id]
                return columnSelected.map(({ id, label }) => (
                  <span
                    key={id}
                    className={cn("inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5", colors?.pill || "bg-primary/10 text-primary")}
                  >
                    {Icon && <Icon className="h-3 w-3 shrink-0" />}
                    {label}
                    <button
                      onClick={() => toggleItem(id)}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={`Remove ${label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                  {allColumns.map((column) => (
                    <TableHead key={column.id}>{column.title}</TableHead>
                  ))}
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedProblems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={allColumns.length + 3}
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
                      {allColumns.map((column) => {
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push(`/problems/${problem.id}/introduction`)}
                            aria-label="Validate problem"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span className="ml-1">Validate</span>
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
        columns={allColumns}
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
        columns={allColumns}
      />

      <Dialog open={nextStepDialogOpen} onOpenChange={setNextStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Problem Saved</DialogTitle>
            <DialogDescription>
              Your problem has been saved. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                setNextStepDialogOpen(false)
                if (lastSavedProblemId !== null) {
                  router.push(`/problems/${lastSavedProblemId}/introduction`)
                }
              }}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Continue to Problem Validation
            </Button>
            <Button
              variant="outline"
              onClick={() => setNextStepDialogOpen(false)}
            >
              Keep Brainstorming
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  return content
}
