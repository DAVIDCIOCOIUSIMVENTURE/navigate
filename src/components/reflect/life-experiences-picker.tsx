"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, ChevronRight, Compass, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { dimensionColumns } from "@/data/dimensionData"
import { countAnchorUsage } from "@/lib/reflect-usage"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const LIFE_EXPERIENCES_QUESTION_URL = "life-experiences"

type Props = {
  selectedTitle: string | null
  onSelect: (title: string | null) => void
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
}

/**
 * Single-select picker bound to the self-discovery
 * "What life experiences have you acquired?" question. The list mirrors
 * `selfDiscoveryItems` filtered by that question, and adding a new entry here writes
 * back through the same model so the two stay in sync.
 */
export function LifeExperiencesPicker({
  selectedTitle,
  onSelect,
  addDialogOpen,
  onAddDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) =>
    s.selfDiscoveryItems.items.filter((i) => i.questionUrl === LIFE_EXPERIENCES_QUESTION_URL)
  )
  const problems = useSelector((s: RootState) => s.problems.problems)
  const customContexts = useSelector(
    (s: RootState) => s.customDimensionItems.byColumn.contexts ?? []
  )
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items]
  )

  const groups = useMemo(() => {
    const col = dimensionColumns.find((c) => c.id === "contexts")
    const contextGroups = col
      ? col.items.map((cat) => ({
          id: cat.id,
          label: cat.label,
          items: (cat.children ?? []).map((c) => ({ id: c.id, label: c.label })),
        }))
      : []
    const result: { id: string; label: string; items: { id: string; label: string }[] }[] = []
    if (customContexts.length > 0) {
      result.push({
        id: "context-custom",
        label: "Your contexts",
        items: customContexts.map((c) => ({ id: c.id, label: c.label })),
      })
    }
    result.push({
      id: "self-discovery",
      label: "From your self-discovery",
      items: sortedItems.map((i) => ({ id: i.id, label: i.title })),
    })
    return [...result, ...contextGroups]
  }, [customContexts, sortedItems])

  const usageByTitle = useMemo(
    () => countAnchorUsage(problems, "life"),
    [problems]
  )

  function handleAdd() {
    const title = draft.trim()
    if (!title) return
    const exists = items.some((i) => i.title.toLowerCase() === title.toLowerCase())
    if (!exists) {
      dispatch.selfDiscoveryItems.addItem({
        title,
        questionUrl: LIFE_EXPERIENCES_QUESTION_URL,
      })
    }
    onSelect(title)
    setDraft("")
    onAddDialogOpenChange(false)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Pick one life experience"
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col rounded-lg bg-card p-2">
        {groups.map((group) => {
          const open = openGroupId === group.id
          const selectedInGroup = group.items.some(
            (i) => selectedTitle === i.label
          )
          const isSelfDiscoveryGroup = group.id === "self-discovery"
          if (group.items.length === 0 && !isSelfDiscoveryGroup) return null
          return (
            <Collapsible
              key={group.id}
              open={open}
              onOpenChange={(next) =>
                setOpenGroupId(next ? group.id : null)
              }
            >
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md transition-colors",
                  isSelfDiscoveryGroup
                    ? "bg-quaternary/10 hover:bg-quaternary/15"
                    : "hover:bg-accent/50"
                )}
              >
                {open
                  ? <ChevronDown className={cn("h-3.5 w-3.5 shrink-0", isSelfDiscoveryGroup ? "text-quaternary" : "text-muted-foreground")} />
                  : <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", isSelfDiscoveryGroup ? "text-quaternary" : "text-muted-foreground")} />
                }
                {isSelfDiscoveryGroup && (
                  <Compass className="h-4 w-4 text-quaternary shrink-0" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold tracking-wide select-none flex-1 text-left",
                    isSelfDiscoveryGroup ? "text-quaternary" : "text-foreground"
                  )}
                >
                  {group.label}
                </span>
                {selectedInGroup && (
                  <span className="text-sm text-secondary-brand font-medium">
                    Selected
                  </span>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="ml-7 flex flex-col gap-1 pb-1">
                  {group.items.length === 0 && isSelfDiscoveryGroup ? (
                    <li className="text-sm text-muted-foreground px-2 py-1.5">
                      Nothing saved yet. Use &ldquo;Add your own&rdquo; or{" "}
                      <Link
                        href="/self-discovery/discover/personal-interests/life-experiences"
                        className="text-quaternary font-medium underline underline-offset-2 hover:text-quaternary/80"
                      >
                        visit Self-Discovery
                      </Link>{" "}
                      to fill this in.
                    </li>
                  ) : (
                    group.items.map((item) => {
                      const isSelected = selectedTitle === item.label
                      const usageCount = isSelfDiscoveryGroup
                        ? usageByTitle.get(item.label.trim().toLowerCase()) ?? 0
                        : 0
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() =>
                              onSelect(isSelected ? null : item.label)
                            }
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isSelected
                                ? "bg-primary/10 border border-primary"
                                : "border border-transparent hover:bg-accent/40"
                            )}
                          >
                            <span
                              className={cn(
                                "grid place-content-center h-4 w-4 shrink-0 rounded-full border",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input"
                              )}
                              aria-hidden="true"
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </span>
                            <span className="flex-1 text-sm leading-snug">
                              {item.label}
                            </span>
                            {usageCount > 0 && (
                              <span className="ml-2 shrink-0 text-sm bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                                Reflected {usageCount}x
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })
                  )}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={onAddDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a life experience</DialogTitle>
            <DialogDescription>
              Anything you add is also saved to your self-discovery under &quot;What
              life experiences have you acquired?&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor="life-experience-new" className="text-base font-medium">
              Experience
            </label>
            <Input
              id="life-experience-new"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder="e.g. Moving country, becoming a parent, switching careers"
              className="text-base"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onAddDialogOpenChange(false)
                setDraft("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={draft.trim().length === 0}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
