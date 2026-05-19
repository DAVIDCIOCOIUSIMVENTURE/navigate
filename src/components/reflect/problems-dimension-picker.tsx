"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { brainstormColumns } from "@/data/brainstormData"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type Props = {
  selectedLabels: string[]
  onChange: (labels: string[]) => void
}

type FlatItem = { id: string; label: string }
type Group = { id: string; label: string; items: FlatItem[] }

/**
 * Multi-select picker bound to the brainstorm "Problem" dimension. Built-in
 * problem categories come from `brainstormColumns`; custom additions persist
 * through `customBrainstormItems.problems` so they appear back in the brainstorm
 * canvas too.
 */
export function ProblemsDimensionPicker({ selectedLabels, onChange }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const customItems = useSelector(
    (s: RootState) => s.customBrainstormItems.byColumn.problems ?? []
  )
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const builtInGroups = useMemo<Group[]>(() => {
    const problemsColumn = brainstormColumns.find((c) => c.id === "problems")
    if (!problemsColumn) return []
    return problemsColumn.items.map((cat) => ({
      id: cat.id,
      label: cat.label,
      items: (cat.children ?? []).map((c) => ({ id: c.id, label: c.label })),
    }))
  }, [])

  const customGroup = useMemo<Group | null>(() => {
    if (customItems.length === 0) return null
    return {
      id: "problem-custom",
      label: "Your problems",
      items: customItems.map((c) => ({ id: c.id, label: c.label })),
    }
  }, [customItems])

  const selectedSet = useMemo(
    () => new Set(selectedLabels.map((l) => l.trim().toLowerCase())),
    [selectedLabels]
  )

  function isSelected(label: string) {
    return selectedSet.has(label.trim().toLowerCase())
  }

  function toggle(label: string) {
    const trimmed = label.trim()
    if (trimmed.length === 0) return
    const lower = trimmed.toLowerCase()
    if (selectedSet.has(lower)) {
      onChange(selectedLabels.filter((l) => l.trim().toLowerCase() !== lower))
    } else {
      onChange([...selectedLabels, trimmed])
    }
  }

  function handleAdd() {
    const label = draft.trim()
    if (!label) return
    const allLabels = [
      ...builtInGroups.flatMap((g) => g.items.map((i) => i.label.toLowerCase())),
      ...customItems.map((i) => i.label.toLowerCase()),
    ]
    if (!allLabels.includes(label.toLowerCase())) {
      dispatch.customBrainstormItems.create({ columnId: "problems", label })
    }
    if (!selectedSet.has(label.toLowerCase())) {
      onChange([...selectedLabels, label])
    }
    setDraft("")
  }

  const groups = customGroup ? [customGroup, ...builtInGroups] : builtInGroups

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="problem-dimension-new"
          className="text-base font-semibold text-white"
        >
          Add your own
        </label>
        <p className="text-base text-white">
          Anything you add joins the Problems dimension in the brainstorm canvas
          and the picker below.
        </p>
        <div className="flex gap-2">
          <Input
            id="problem-dimension-new"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAdd()
              }
            }}
            placeholder="e.g. School pickup logistics, finding a trusted plumber"
            className="text-base bg-white border-white text-foreground"
          />
          <Button
            type="button"
            onClick={handleAdd}
            disabled={draft.trim().length === 0}
            className="gap-1.5 shrink-0 bg-white text-foreground hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-white">
          Pick one or more problem types
        </p>
        <div className="flex flex-col gap-2 rounded-lg bg-card p-2">
          {groups.map((group) => {
            const open = openGroupId === group.id
            const selectedInGroup = group.items.filter((i) =>
              isSelected(i.label)
            ).length
            return (
              <Collapsible
                key={group.id}
                open={open}
                onOpenChange={(next) =>
                  setOpenGroupId(next ? group.id : null)
                }
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-2 rounded-md px-2 py-2 text-left hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base font-medium">
                        {group.label}
                      </span>
                      {selectedInGroup > 0 && (
                        <span className="text-base bg-primary/15 text-primary rounded-full px-2 py-0.5">
                          {selectedInGroup} selected
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        open && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1">
                  <ul
                    role="group"
                    aria-label={group.label}
                    className="flex flex-col gap-1 pl-2"
                  >
                    {group.items.map((item) => {
                      const checked = isSelected(item.label)
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            onClick={() => toggle(item.label)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              checked
                                ? "bg-primary/10 border border-primary"
                                : "border border-transparent hover:bg-accent/40"
                            )}
                          >
                            <span
                              className={cn(
                                "grid place-content-center h-4 w-4 shrink-0 rounded-sm border",
                                checked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input"
                              )}
                              aria-hidden="true"
                            >
                              {checked && <Check className="h-3 w-3" />}
                            </span>
                            <span className="flex-1 text-base leading-snug">
                              {item.label}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </div>

      {selectedLabels.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-white">
            Selected ({selectedLabels.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => toggle(label)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-foreground px-3 py-1 text-base hover:bg-white/90"
              >
                <span>{label}</span>
                <span aria-hidden="true">×</span>
                <span className="sr-only">Remove {label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
