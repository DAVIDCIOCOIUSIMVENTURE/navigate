"use client"

import { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Check, X } from "lucide-react"
import type { Solution } from "@/types/solution"
import { useDiscovery } from "./context"

const SOURCE_LABELS: Record<string, string> = {
  scamper: "SCAMPER",
  reverse: "Reverse",
  analogy: "Analogy",
  improve: "Improve",
  freeform: "Freeform",
}

const SCAMPER_LETTER: Record<string, string> = {
  substitute: "S",
  combine: "C",
  adapt: "A",
  modify: "M",
  putToOtherUse: "P",
  eliminate: "E",
  reverse: "R",
}

const SCAMPER_COLOR: Record<string, string> = {
  substitute: "bg-red-500",
  combine: "bg-orange-500",
  adapt: "bg-amber-500",
  modify: "bg-emerald-500",
  putToOtherUse: "bg-cyan-500",
  eliminate: "bg-pink-500",
  reverse: "bg-fuchsia-500",
}

function scamperKeyFromDetail(detail: string): string | null {
  const key = detail.includes(":") ? detail.split(":")[0] : detail
  return key in SCAMPER_LETTER ? key : null
}

export function SolutionsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { candidates, updateCandidate, removeCandidate } = useDiscovery()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftTitle, setDraftTitle] = useState("")
  const [draftDesc, setDraftDesc] = useState("")

  const startEdit = (c: Solution) => {
    setEditingId(c.id)
    setDraftTitle(c.title)
    setDraftDesc(c.description)
  }

  const confirmEdit = () => {
    if (editingId === null) return
    updateCandidate(editingId, { title: draftTitle.trim(), description: draftDesc.trim() })
    setEditingId(null)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle>All Solutions ({candidates.length})</DrawerTitle>
          <DrawerDescription className="sr-only">Solutions captured for this problem</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-auto px-4 pb-6">
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-lg border border-dashed">
              <p className="text-base font-semibold">No solutions yet.</p>
              <p className="text-sm">Use a discovery tool to generate ideas, then click &quot;Add as Solution&quot; on the ones worth keeping.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {candidates.map((candidate) => {
                const scamperKey = candidate.inspirationSource === "scamper"
                  ? scamperKeyFromDetail(candidate.inspirationDetail)
                  : null
                return (
                  <div key={candidate.id} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                    {editingId === candidate.id ? (
                      <>
                        <Input
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          placeholder="Title"
                          className="font-medium"
                          autoFocus
                        />
                        <Textarea
                          value={draftDesc}
                          onChange={(e) => setDraftDesc(e.target.value)}
                          placeholder="Description"
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="h-3.5 w-3.5 mr-1" />Cancel
                          </Button>
                          <Button size="sm" onClick={confirmEdit} disabled={!draftTitle.trim()}>
                            <Check className="h-3.5 w-3.5 mr-1" />Save
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {scamperKey && (
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${SCAMPER_COLOR[scamperKey]} text-white text-[10px] font-bold`}
                                title={`SCAMPER: ${scamperKey}`}
                              >
                                {SCAMPER_LETTER[scamperKey]}
                              </span>
                            )}
                            <p className="text-sm font-semibold">{candidate.title}</p>
                            {candidate.inspirationSource && (
                              <Badge variant="outline" className="text-[10px]">
                                {SOURCE_LABELS[candidate.inspirationSource] ?? candidate.inspirationSource}
                              </Badge>
                            )}
                          </div>
                          {candidate.description && (
                            <p className="text-sm mt-1">{candidate.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(candidate)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => removeCandidate(candidate.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
