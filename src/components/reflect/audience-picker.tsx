"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { generateSelfDiscoveryItemId } from "@/store/self-discovery-items-model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, ChevronRight, Compass, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { audienceGroups } from "@/data/dimensionData"
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

const TARGET_AUDIENCE_QUESTION_URL = "target-audience"

type Props = {
  selectedId: string | null
  onSelect: (id: string | null, label: string | null) => void
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
}

type GroupItem = { id: string; label: string }
type Group = { id: string; label: string; items: GroupItem[] }

export function AudiencePicker({
  selectedId,
  onSelect,
  addDialogOpen,
  onAddDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const selfDiscoveryAudience = useSelector((s: RootState) =>
    s.selfDiscoveryItems.items.filter(
      (i) => i.questionUrl === TARGET_AUDIENCE_QUESTION_URL
    )
  )
  const customCustomers = useSelector(
    (s: RootState) => s.customDimensionItems.byColumn.customers ?? []
  )
  const problems = useSelector((s: RootState) => s.problems.problems)
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const sortedSelfDiscovery = useMemo(
    () => [...selfDiscoveryAudience].sort((a, b) => a.title.localeCompare(b.title)),
    [selfDiscoveryAudience]
  )

  const groups = useMemo<Group[]>(() => {
    const result: Group[] = []
    if (customCustomers.length > 0) {
      result.push({
        id: "customer-custom",
        label: "Your customers",
        items: customCustomers.map((c) => ({ id: c.id, label: c.label })),
      })
    }
    result.push({
      id: "self-discovery",
      label: "From your self-discovery",
      items: sortedSelfDiscovery.map((i) => ({ id: i.id, label: i.title })),
    })
    for (const cat of audienceGroups) {
      result.push({
        id: cat.id,
        label: cat.label,
        items: (cat.children ?? []).map((c) => ({ id: c.id, label: c.label })),
      })
    }
    return result
  }, [customCustomers, sortedSelfDiscovery])

  const usageByTitle = useMemo(
    () => countAnchorUsage(problems, "audience-problems"),
    [problems]
  )

  function handleAdd() {
    const title = draft.trim()
    if (!title) return
    const existing = selfDiscoveryAudience.find(
      (i) => i.title.trim().toLowerCase() === title.toLowerCase()
    )
    if (existing) {
      onSelect(existing.id, existing.title)
    } else {
      const id = generateSelfDiscoveryItemId()
      dispatch.selfDiscoveryItems.addItem({
        id,
        title,
        questionUrl: TARGET_AUDIENCE_QUESTION_URL,
      })
      onSelect(id, title)
    }
    setDraft("")
    onAddDialogOpenChange(false)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Pick one audience"
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col rounded-lg bg-card p-2">
        {groups.map((group) => {
          const open = openGroupId === group.id
          const selectedInGroup = group.items.some(
            (i) => selectedId === i.id
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
                    "text-base font-semibold tracking-wide select-none flex-1 text-left",
                    isSelfDiscoveryGroup ? "text-quaternary" : "text-foreground"
                  )}
                >
                  {group.label}
                </span>
                {selectedInGroup && (
                  <span className="text-base text-secondary-brand font-medium">
                    Selected
                  </span>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="ml-7 flex flex-col gap-1 pb-1">
                  {group.items.length === 0 && isSelfDiscoveryGroup ? (
                    <li className="text-base px-2 py-1.5">
                      Nothing saved yet. Use &ldquo;Add your own&rdquo; or{" "}
                      <Link
                        href="/self-discovery/discover/audience/target-audience"
                        className="text-quaternary font-medium underline underline-offset-2 hover:text-quaternary/80"
                      >
                        visit Self-Discovery
                      </Link>{" "}
                      to fill this in.
                    </li>
                  ) : (
                    group.items.map((item) => {
                      const isSelected = selectedId === item.id
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
                              isSelected
                                ? onSelect(null, null)
                                : onSelect(item.id, item.label)
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
                            <span className="flex-1 text-base leading-snug">
                              {item.label}
                            </span>
                            {usageCount > 0 && (
                              <span className="ml-2 shrink-0 text-base bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
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
            <DialogTitle>Add an audience</DialogTitle>
            <DialogDescription>
              Anything you add is also saved to your self-discovery under
              &ldquo;Who is your target audience?&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor="audience-new" className="text-base font-medium">
              Audience
            </label>
            <Input
              id="audience-new"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder="e.g. First-time freelancers, parents of teenagers"
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
