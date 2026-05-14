"use client"

import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Pencil, Plus, Search, X, ChevronRight, ChevronDown } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { brainstormColumns } from "@/data/brainstormData"
import type { BrainstormItem } from "@/app/(app)/problems/brainstorm/data"
import { resolveDimensionLabel } from "@/lib/dimension-labels"
import { DIMENSION_COLORS, DIMENSION_ICONS } from "@/lib/dimension-visuals"
import { EditableLeafItem } from "@/components/editable-leaf-item"
import { cn } from "@/lib/utils"

function findInTree(items: BrainstormItem[], id: string): BrainstormItem | null {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findInTree(item.children, id)
      if (found) return found
    }
  }
  return null
}

function filterItems(items: BrainstormItem[], query: string): BrainstormItem[] {
  const lower = query.toLowerCase()
  return items.flatMap((item) => {
    if (item.children) {
      const filtered = filterItems(item.children, query)
      if (filtered.length > 0) return [{ ...item, children: filtered }]
      if (item.label.toLowerCase().includes(lower)) return [item]
      return []
    }
    return item.label.toLowerCase().includes(lower) ? [item] : []
  })
}

function CheckTree({
  item,
  selected,
  onToggle,
  forceOpen,
  customColumnId,
  customItemIds,
}: {
  item: BrainstormItem
  selected: Set<string>
  onToggle: (id: string) => void
  forceOpen?: boolean
  customColumnId: string
  customItemIds: Set<string>
}) {
  const [open, setOpen] = useState(false)
  const isGroup = !!item.children?.length
  const effectiveOpen = forceOpen || open

  if (isGroup) {
    const selectedCount = item.children!.filter((c) => selected.has(c.id)).length
    return (
      <Collapsible open={effectiveOpen} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1 rounded hover:bg-accent/50 transition-colors">
          {effectiveOpen
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          <span className="text-sm font-semibold text-foreground tracking-wide select-none flex-1 text-left">
            {item.label}
          </span>
          {selectedCount > 0 && (
            <span className="text-sm text-primary font-medium tabular-nums">{selectedCount}</span>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-4 flex flex-col">
            {item.children!.map((child) => (
              <CheckTree
                key={child.id}
                item={child}
                selected={selected}
                onToggle={onToggle}
                forceOpen={forceOpen}
                customColumnId={customColumnId}
                customItemIds={customItemIds}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <EditableLeafItem
      item={item}
      isChecked={selected.has(item.id)}
      onToggle={() => onToggle(item.id)}
      customColumnId={customItemIds.has(item.id) ? customColumnId : undefined}
    />
  )
}

export function DimensionPicker({
  columnId,
  ids,
  onChange,
  label,
  readOnly = false,
}: {
  columnId: string
  ids: string[]
  onChange: (next: string[]) => void
  label?: string
  readOnly?: boolean
}) {
  const customByColumn = useSelector((s: RootState) => s.customBrainstormItems.byColumn)
  const triggers = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  const column = brainstormColumns.find((c) => c.id === columnId)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const customItems = useMemo<BrainstormItem[]>(() => {
    const items = customByColumn[columnId] ?? []
    if (items.length === 0) return []
    return [{
      id: `${columnId}-custom-group`,
      label: "Your custom items",
      children: items.map((it) => ({ id: it.id, label: it.label })),
    }]
  }, [customByColumn, columnId])

  const customItemIds = useMemo(() => {
    const items = customByColumn[columnId] ?? []
    return new Set(items.map((i) => i.id))
  }, [customByColumn, columnId])

  const allItems = useMemo<BrainstormItem[]>(() => {
    const builtIn = column?.items ?? []
    return [...builtIn, ...customItems]
  }, [column, customItems])

  const filtered = useMemo(
    () => (query.trim() ? filterItems(allItems, query.trim()) : allItems),
    [allItems, query]
  )

  const selectedSet = useMemo(() => new Set(ids), [ids])

  const toggle = (id: string) => {
    const next = new Set(selectedSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(Array.from(next))
  }

  const removeOne = (id: string) => {
    onChange(ids.filter((x) => x !== id))
  }

  const columnTitle = column?.title ?? "Items"
  const dimensionColor = DIMENSION_COLORS[columnId]
  const DimensionIcon = DIMENSION_ICONS[columnId]

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
          {DimensionIcon && (
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                dimensionColor?.iconBg ?? "bg-muted"
              )}
              aria-hidden="true"
            >
              <DimensionIcon className="h-3 w-3 text-white" />
            </span>
          )}
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {ids.length === 0 && readOnly ? (
          <span className="text-sm italic">None added</span>
        ) : null}
        {ids.map((id) => {
          const text = resolveDimensionLabel(columnId, id, customByColumn, triggers)
          return (
            <span
              key={id}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-medium",
                dimensionColor ? `${dimensionColor.pill} ${dimensionColor.pillBorder}` : "bg-background border-border"
              )}
            >
              {text}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeOne(id)}
                  className="opacity-60 hover:opacity-100"
                  aria-label={`Remove ${text}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          )
        })}
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-sm border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
            onClick={() => setOpen(true)}
          >
            {ids.length === 0 ? (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </>
            )}
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose {columnTitle.toLowerCase()}</DialogTitle>
            <DialogDescription className="sr-only">
              Pick one or more {columnTitle.toLowerCase()} for this problem.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-8 pl-8 text-sm"
            />
          </div>
          <ScrollArea className="h-80">
            <div className="flex flex-col pr-2">
              {filtered.length === 0 ? (
                <p className="text-sm py-4 text-center">No matches.</p>
              ) : (
                filtered.map((item) => (
                  <CheckTree
                    key={item.id}
                    item={item}
                    selected={selectedSet}
                    onToggle={toggle}
                    forceOpen={!!query.trim()}
                    customColumnId={columnId}
                    customItemIds={customItemIds}
                  />
                ))
              )}
              {ids
                .filter((id) => !findInTree(allItems, id))
                .map((id) => {
                  const text = resolveDimensionLabel(columnId, id, customByColumn, triggers)
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-2.5 px-1 py-1 cursor-pointer rounded hover:bg-accent/50"
                    >
                      <Checkbox
                        checked
                        onCheckedChange={() => toggle(id)}
                        className="border-secondary-brand data-[state=checked]:bg-secondary-brand data-[state=checked]:text-secondary-brand-foreground"
                      />
                      <span className="text-sm font-medium text-muted-foreground italic">{text}</span>
                    </label>
                  )
                })}
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
