"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SELF_DISCOVERY_CATEGORIES,
  type SelfDiscoveryQuestion,
} from "@/data/selfDiscoveryData"
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

const WORK_DONE_QUESTION_URL = "work-done"
const ORG_PROCESSES_QUESTION_URL = "organisations-processes"
const WORK_QUESTION_URLS = [WORK_DONE_QUESTION_URL, ORG_PROCESSES_QUESTION_URL]

type Props = {
  selectedTitle: string | null
  onSelect: (title: string | null) => void
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
}

type GroupItem = { id: string; label: string }
type Group = { id: string; label: string; items: GroupItem[] }

/**
 * Single-select picker for the Work friction anchor prompt
 * ("Which job, role, or area of work do you want to reflect on?"). Bound to
 * the two self-discovery questions in the Work Experience category
 * ("What kinds of work have you done?" and
 * "Which kinds of organisations have you worked in...?"). The user's saved
 * items appear first, followed by the catalog suggestions from each question
 * so the picker is useful even before any self-discovery answers exist.
 * New entries added via "Add your own" persist back to self-discovery under
 * the "What kinds of work have you done?" question.
 */
export function WorkContextPicker({
  selectedTitle,
  onSelect,
  addDialogOpen,
  onAddDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) =>
    s.selfDiscoveryItems.items.filter((i) => WORK_QUESTION_URLS.includes(i.questionUrl))
  )
  const workCandidates = useSelector((s: RootState) =>
    s.problemCandidates.items.filter((c) => c.lensId === "work")
  )
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items]
  )

  const groups = useMemo<Group[]>(() => {
    const workCategory = SELF_DISCOVERY_CATEGORIES.find((c) => c.url === "work-experience")
    const workDoneQuestion = workCategory?.questions.find((q) => q.url === WORK_DONE_QUESTION_URL)
    const orgQuestion = workCategory?.questions.find((q) => q.url === ORG_PROCESSES_QUESTION_URL)

    const catalogGroupsFromQuestion = (
      question: SelfDiscoveryQuestion | undefined,
      prefix: string
    ): Group[] => {
      if (!question?.suggestions) return []
      return question.suggestions.map((cat) => ({
        id: `${prefix}-${cat.id}`,
        label: cat.label,
        items: (cat.children ?? []).map((c) => ({ id: c.id, label: c.label })),
      }))
    }

    const result: Group[] = []
    result.push({
      id: "self-discovery",
      label: "From your self-discovery",
      items: sortedItems.map((i) => ({ id: i.id, label: i.title })),
    })
    result.push(...catalogGroupsFromQuestion(workDoneQuestion, "wd"))
    result.push(...catalogGroupsFromQuestion(orgQuestion, "op"))
    return result
  }, [sortedItems])

  const usageByTitle = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of workCandidates) {
      const key = (c.context?.workContext ?? "").trim().toLowerCase()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [workCandidates])

  function handleAdd() {
    const title = draft.trim()
    if (!title) return
    const exists = items.some((i) => i.title.toLowerCase() === title.toLowerCase())
    if (!exists) {
      dispatch.selfDiscoveryItems.addItem({
        title,
        questionUrl: WORK_DONE_QUESTION_URL,
      })
    }
    onSelect(title)
    setDraft("")
    onAddDialogOpenChange(false)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Pick one role, job, or area of work"
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
              <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors">
                {open
                  ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                }
                <span className="text-sm font-semibold text-foreground tracking-wide select-none flex-1 text-left">
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
                      Nothing saved yet. Use &ldquo;Add your own&rdquo; or visit
                      Self-Discovery to fill this in.
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
            <DialogTitle>Add a role or work area</DialogTitle>
            <DialogDescription>
              Anything you add is also saved to your self-discovery under
              &quot;What kinds of work have you done?&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor="work-context-new" className="text-base font-medium">
              Role or work area
            </label>
            <Input
              id="work-context-new"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder="e.g. Running ops at a logistics SME, client onboarding at my consultancy"
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
