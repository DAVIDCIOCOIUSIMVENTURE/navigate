"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, ChevronRight, Compass, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SELF_DISCOVERY_CATEGORIES,
  type SelfDiscoveryQuestion,
} from "@/data/selfDiscoveryData"
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

const WORK_DONE_QUESTION_URL = "work-done"
const HOBBIES_QUESTION_URL = "hobbies-interests"
const SOURCE_QUESTION_URLS = [WORK_DONE_QUESTION_URL, HOBBIES_QUESTION_URL]

type Props = {
  selectedTitle: string | null
  onSelect: (title: string | null) => void
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
}

type GroupItem = { id: string; label: string }
type Group = { id: string; label: string; items: GroupItem[] }

export function OwnProblemsPicker({
  selectedTitle,
  onSelect,
  addDialogOpen,
  onAddDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) =>
    s.selfDiscoveryItems.items.filter((i) => SOURCE_QUESTION_URLS.includes(i.questionUrl))
  )
  const problems = useSelector((s: RootState) => s.problems.problems)
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items]
  )

  const groups = useMemo<Group[]>(() => {
    const workCategory = SELF_DISCOVERY_CATEGORIES.find((c) => c.url === "work-experience")
    const interestsCategory = SELF_DISCOVERY_CATEGORIES.find((c) => c.url === "personal-interests")
    const workDoneQuestion = workCategory?.questions.find((q) => q.url === WORK_DONE_QUESTION_URL)
    const hobbiesQuestion = interestsCategory?.questions.find((q) => q.url === HOBBIES_QUESTION_URL)

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
    result.push(...catalogGroupsFromQuestion(hobbiesQuestion, "hi"))
    return result
  }, [sortedItems])

  const usageByTitle = useMemo(
    () => countAnchorUsage(problems, "own-problems"),
    [problems]
  )

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
      aria-label="Pick one thing you've worked on or done"
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
            <DialogTitle>Add something you&rsquo;ve done</DialogTitle>
            <DialogDescription>
              Anything you add is also saved to your self-discovery under
              &ldquo;What kinds of work have you done?&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor="own-anchor-new" className="text-base font-medium">
              What you&rsquo;ve worked on or done
            </label>
            <Input
              id="own-anchor-new"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder="e.g. Running a small bakery, coaching a junior football team"
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
