"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  ArrowUpRight,
  HelpCircle,
  Lightbulb,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react"
import { REFLECT_LENS_BY_ID, type LensId } from "@/data/reflectLenses"
import type { ProblemCandidate } from "@/store/problem-candidates-model"
import { PromoteCandidateDialog } from "./promote-candidate-dialog"
import { EditCandidateDialog } from "./edit-candidate-dialog"
import { useGuidance } from "@/context/guidance-context"
import { toast } from "sonner"
import { MethodTile } from "@/components/method-tile"

type CandidateTab = "active" | "promoted" | "dismissed"

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return "just now"
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function CandidateRow({
  candidate,
  tab,
  selected,
  onToggleSelected,
}: {
  candidate: ProblemCandidate
  tab: CandidateTab
  selected: boolean
  onToggleSelected: (id: string, next: boolean) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const lens = REFLECT_LENS_BY_ID[candidate.lensId as LensId]
  const LensIcon = lens?.icon

  return (
    <li className="rounded-lg border bg-card px-4 py-3 flex flex-wrap items-center gap-3">
      {tab === "active" && (
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onToggleSelected(candidate.id, v === true)}
          aria-label={`Select candidate ${candidate.title}`}
        />
      )}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {lens && LensIcon && (
          <MethodTile icon={LensIcon} size="sm" aria-label={lens.title} title={lens.title} />
        )}
        <span className="text-base leading-snug">{candidate.title}</span>
      </div>
      <span className="text-base shrink-0">{formatRelative(candidate.createdAt)}</span>
      <div className="flex items-center gap-1 shrink-0">
        {tab === "active" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label="Edit candidate"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setPromoteOpen(true)}
              aria-label="Promote candidate"
            >
              <Send className="h-4 w-4" />
            </Button>
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label="Dismiss candidate"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              title="Dismiss this candidate?"
              description="It moves to the Dismissed tab and stops showing here. You can restore it later if you change your mind."
              confirmLabel="Dismiss"
              onConfirm={() => dispatch.problemCandidates.dismiss(candidate.id)}
            />
            <PromoteCandidateDialog
              candidate={promoteOpen ? candidate : null}
              onOpenChange={(open) => setPromoteOpen(open)}
            />
            <EditCandidateDialog
              candidate={editOpen ? candidate : null}
              onOpenChange={(open) => setEditOpen(open)}
            />
          </>
        )}
        {tab === "promoted" && candidate.promotedToProblemId != null && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Open the linked Problem"
          >
            <Link href={`/problems/${candidate.promotedToProblemId}/edit`}>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {tab === "dismissed" && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => dispatch.problemCandidates.restore(candidate.id)}
            aria-label="Restore candidate"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  )
}

export function CandidatesTray() {
  const dispatch = useDispatch<AppDispatch>()
  const { openGuidance } = useGuidance()
  const items = useSelector((s: RootState) => s.problemCandidates.items)
  const hydrated = useSelector((s: RootState) => s.problemCandidates.hydrated)
  const [tab, setTab] = useState<CandidateTab>("active")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkPromoting, setBulkPromoting] = useState(false)
  // Hold off on rendering anything store-derived until after mount so SSR HTML
  // (empty store) matches the first client render. The real data appears once
  // problemCandidates.init() has run.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const grouped = useMemo(() => {
    if (!mounted) {
      return { active: [], promoted: [], dismissed: [] }
    }
    return {
      active: items.filter(
        (c) => !c.dismissedAt && c.promotedToProblemId == null
      ),
      promoted: items.filter((c) => c.promotedToProblemId != null),
      dismissed: items.filter(
        (c) => c.dismissedAt && c.promotedToProblemId == null
      ),
    }
  }, [items, mounted])

  // Clear selection when switching tabs or when the active list changes underfoot.
  useEffect(() => {
    setSelectedIds(new Set())
  }, [tab])

  // Drop selections for candidates that no longer exist in the active list.
  useEffect(() => {
    const activeIds = new Set(grouped.active.map((c) => c.id))
    setSelectedIds((prev) => {
      const next = new Set<string>()
      for (const id of prev) {
        if (activeIds.has(id)) next.add(id)
      }
      return next.size === prev.size ? prev : next
    })
  }, [grouped.active])

  function toggleSelected(id: string, next: boolean) {
    setSelectedIds((prev) => {
      const copy = new Set(prev)
      if (next) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  function toggleSelectAll(next: boolean) {
    setSelectedIds(next ? new Set(grouped.active.map((c) => c.id)) : new Set())
  }

  async function handleBulkPromote() {
    if (selectedIds.size === 0) return
    setBulkPromoting(true)
    try {
      const ids = Array.from(selectedIds)
      const results = await Promise.all(
        ids.map((id) => dispatch.problemCandidates.promote(id))
      )
      const created = results.filter((r): r is number => r != null)
      setSelectedIds(new Set())
      toast.success(
        created.length === 1
          ? "Promoted 1 candidate to a new Problem"
          : `Promoted ${created.length} candidates to new Problems`
      )
    } finally {
      setBulkPromoting(false)
    }
  }

  function handleBulkDismiss() {
    for (const id of selectedIds) {
      dispatch.problemCandidates.dismiss(id)
    }
    const count = selectedIds.size
    setSelectedIds(new Set())
    toast.success(
      count === 1 ? "Dismissed 1 candidate" : `Dismissed ${count} candidates`
    )
  }

  const emptyCopy: Record<CandidateTab, { title: string; body: string }> = {
    active: {
      title: "No candidates yet",
      body: "Pick a lens above to start. Your answers will appear here.",
    },
    promoted: {
      title: "No promoted candidates yet",
      body: "Promote a candidate to turn it into a Problem you can refine.",
    },
    dismissed: {
      title: "No dismissed candidates",
      body: "Dismissed candidates show up here so you can restore them later.",
    },
  }

  const activeCount = grouped.active.length
  const selectedCount = selectedIds.size
  const allActiveSelected = activeCount > 0 && selectedCount === activeCount

  return (
    <Card id="candidates">
      <CardHeader className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <CardTitle icon={Lightbulb}>
            Candidates
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => openGuidance("reflect-candidates")}
            aria-label="Open guidance for candidates"
            title="Open guidance"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-base leading-relaxed">
          Answers you save in a lens land here. Review them, then promote the ones worth
          refining into your problem library.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as CandidateTab)}>
          <TabsList>
            <TabsTrigger value="active">
              Active ({grouped.active.length})
            </TabsTrigger>
            <TabsTrigger value="promoted">
              Promoted ({grouped.promoted.length})
            </TabsTrigger>
            <TabsTrigger value="dismissed">
              Dismissed ({grouped.dismissed.length})
            </TabsTrigger>
          </TabsList>

          {(["active", "promoted", "dismissed"] as CandidateTab[]).map((t) => (
            <TabsContent value={t} key={t} className="flex flex-col gap-2">
              {!mounted || !hydrated ? (
                <p className="text-base py-6 text-center">Loading...</p>
              ) : grouped[t].length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
                  <p className="text-base font-medium">{emptyCopy[t].title}</p>
                  <p className="text-base">{emptyCopy[t].body}</p>
                </div>
              ) : (
                <>
                  {t === "active" && activeCount > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/40 px-4 py-2">
                      <label className="flex items-center gap-2 text-base cursor-pointer">
                        <Checkbox
                          checked={allActiveSelected}
                          onCheckedChange={(v) => toggleSelectAll(v === true)}
                          aria-label="Select all active candidates"
                        />
                        <span>
                          {selectedCount === 0
                            ? `Select all (${activeCount})`
                            : `${selectedCount} of ${activeCount} selected`}
                        </span>
                      </label>
                      {selectedCount > 0 && (
                        <div className="flex items-center gap-2">
                          <ConfirmDialog
                            trigger={
                              <Button
                                variant="outline"
                                type="button"
                                disabled={bulkPromoting}
                                className="gap-2"
                              >
                                <Send className="h-4 w-4" />
                                Promote selected
                              </Button>
                            }
                            title={
                              selectedCount === 1
                                ? "Promote 1 candidate?"
                                : `Promote ${selectedCount} candidates?`
                            }
                            description="Each selected candidate becomes a new, blank Problem with its current title. You'll fill in customers, contexts, and the rest in the refinement flow."
                            confirmLabel="Promote"
                            onConfirm={handleBulkPromote}
                          />
                          <ConfirmDialog
                            trigger={
                              <Button variant="outline" type="button" className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Dismiss selected
                              </Button>
                            }
                            title={
                              selectedCount === 1
                                ? "Dismiss 1 candidate?"
                                : `Dismiss ${selectedCount} candidates?`
                            }
                            description="They move to the Dismissed tab and stop showing here. You can restore them later."
                            confirmLabel="Dismiss"
                            onConfirm={handleBulkDismiss}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <ul className="flex flex-col gap-2 list-none m-0 p-0">
                    {grouped[t].map((c) => (
                      <CandidateRow
                        key={c.id}
                        candidate={c}
                        tab={t}
                        selected={selectedIds.has(c.id)}
                        onToggleSelected={toggleSelected}
                      />
                    ))}
                  </ul>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
