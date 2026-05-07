"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AutoTextarea } from "@/components/ui/auto-textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useProblem } from "@/app/(app)/problems/[problemRef]/validation/context"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import type { ShortcomingItem } from "@/types/validation"
import { Plus, X, Lightbulb } from "lucide-react"

const IMPACT_AREAS: { label: string; hint: string }[] = [
  { label: "Time Lost", hint: "Hours wasted on manual or repeated work" },
  { label: "Money Wasted", hint: "Subscriptions, fees, unnecessary spend" },
  { label: "Error Rates", hint: "Mistakes, rework, defects" },
  { label: "Customer Churn", hint: "Losing customers, low retention" },
  { label: "Support Tickets", hint: "Increased helpdesk load" },
  { label: "Productivity Loss", hint: "Distractions, slow workflows" },
  { label: "Revenue Impact", hint: "Missed sales, lost deals" },
  { label: "Compliance Risk", hint: "Legal or regulatory exposure" },
  { label: "Emotional Impact", hint: "Frustration, anxiety, distrust" },
]

export function ExistingSolutionsStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const { existingSolutions, setExistingSolutions } = useProblem()
  const isNarrow = useContainerSize() === "narrow"
  const [addingSolution, setAddingSolution] = useState(false)
  const [draft, setDraft] = useState("")
  const [addingSc, setAddingSc] = useState<Record<number, boolean>>({})
  const [scDrafts, setScDrafts] = useState<Record<number, string>>({})
  const [panelOpen, setPanelOpen] = useState<Record<number, boolean>>({})
  const [mounted, setMounted] = useState(false)
  const solutionInputRef = useRef<HTMLInputElement>(null)
  const scInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (addingSolution) solutionInputRef.current?.focus()
  }, [addingSolution])

  useEffect(() => {
    const entries = Object.entries(addingSc)
    const lastTrue = entries.findLast(([, v]) => v)
    if (lastTrue) scInputRefs.current[Number(lastTrue[0])]?.focus()
  }, [addingSc])

  const addSolution = () => {
    const trimmed = draft.trim()
    if (trimmed) {
      setExistingSolutions([...existingSolutions, { id: Date.now(), text: trimmed, shortcomings: [] }])
    }
    setDraft("")
    setAddingSolution(false)
  }

  const removeSolution = (i: number) => setExistingSolutions(existingSolutions.filter((_, idx) => idx !== i))

  const onSolutionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addSolution() }
    if (e.key === "Escape") { setDraft(""); setAddingSolution(false) }
  }

  const addShortcoming = (solIdx: number) => {
    const trimmed = (scDrafts[solIdx] ?? "").trim()
    if (trimmed) {
      const newItem: ShortcomingItem = { id: Date.now(), text: trimmed }
      setExistingSolutions(
        existingSolutions.map((sol, idx) =>
          idx === solIdx ? { ...sol, shortcomings: [...sol.shortcomings, newItem] } : sol
        )
      )
    }
    setScDrafts((prev) => ({ ...prev, [solIdx]: "" }))
    setAddingSc((prev) => ({ ...prev, [solIdx]: false }))
  }

  const updateShortcomingText = (solIdx: number, scIdx: number, text: string) =>
    setExistingSolutions(
      existingSolutions.map((sol, idx) =>
        idx === solIdx
          ? { ...sol, shortcomings: sol.shortcomings.map((s, k) => k === scIdx ? { ...s, text } : s) }
          : sol
      )
    )

  const removeShortcoming = (solIdx: number, scIdx: number) =>
    setExistingSolutions(
      existingSolutions.map((sol, idx) =>
        idx === solIdx
          ? { ...sol, shortcomings: sol.shortcomings.filter((_, j) => j !== scIdx) }
          : sol
      )
    )

  const onScKeyDown = (solIdx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addShortcoming(solIdx) }
    if (e.key === "Escape") { setScDrafts((prev) => ({ ...prev, [solIdx]: "" })); setAddingSc((prev) => ({ ...prev, [solIdx]: false })) }
  }

  if (readOnly && existingSolutions.length === 0) {
    return (
      <div className="bg-primary rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No existing solutions captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col gap-4">
        {mounted && existingSolutions.map((sol, i) => {
          const isPanelOpen = !!panelOpen[i]
          return (
            <div key={sol.id} className="rounded-lg border border-white/15 bg-white/10 p-5">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h4 className="text-lg font-bold text-white">Existing Solution {i + 1}</h4>
                {!readOnly && (
                  <ConfirmDialog
                    trigger={
                      <button className="shrink-0 text-white/60 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    }
                    title="Remove existing solution?"
                    description="This will also delete all shortcomings associated with it."
                    onConfirm={() => removeSolution(i)}
                  />
                )}
              </div>

              <div className={cn("flex gap-4", isNarrow ? "flex-col" : "flex-row")}>
                {isPanelOpen && (
                  <aside
                    className={cn(
                      "rounded-md border border-white/15 bg-white/5 p-4 shrink-0 max-h-80 overflow-y-auto",
                      isNarrow ? "w-full" : "w-56"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-3">
                      <Lightbulb className="h-3.5 w-3.5 text-white/70" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Impact examples</p>
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {IMPACT_AREAS.map((area) => (
                        <li key={area.label} className="text-sm">
                          <p className="font-medium text-white">{area.label}</p>
                          <p className="text-xs text-white/60 mt-0.5">{area.hint}</p>
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}

                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`solution-${sol.id}`} className="text-sm font-medium leading-none text-white/80">Existing solution name</label>
                    <Input
                      id={`solution-${sol.id}`}
                      value={sol.text}
                      onChange={(e) => setExistingSolutions(existingSolutions.map((a, idx) => idx === i ? { ...a, text: e.target.value } : a))}
                      readOnly={readOnly}
                      className="text-md font-medium h-8 bg-white border-white text-foreground read-only:cursor-default"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-semibold text-white">Shortcomings</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPanelOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                          className="h-7 gap-1.5 px-2 text-white/80 hover:bg-white/10 hover:text-white"
                          aria-expanded={isPanelOpen}
                          aria-label={isPanelOpen ? "Hide impact examples" : "Show impact examples"}
                        >
                          <Lightbulb className="h-3.5 w-3.5" />
                          <span className="text-xs">{isPanelOpen ? "Hide impact examples" : "Show impact examples"}</span>
                        </Button>
                      </div>
                      {!readOnly && (
                        <p className="text-sm text-white/70">Where this solution falls short for the customer.</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {sol.shortcomings.map((sc, j) => (
                        <div key={sc.id} className="flex items-start gap-2">
                          <AutoTextarea
                            id={`shortcoming-${sol.id}-${sc.id}`}
                            aria-label={`Shortcoming ${j + 1}`}
                            value={sc.text}
                            placeholder="Why does this fall short?"
                            onChange={(e) => updateShortcomingText(i, j, e.target.value)}
                            readOnly={readOnly}
                            className="flex-1 bg-white border-white text-foreground read-only:cursor-default"
                          />
                          {!readOnly && (
                            <ConfirmDialog
                              trigger={
                                <button className="shrink-0 mt-2 text-white/50 hover:text-white transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              }
                              title="Remove shortcoming?"
                              description="This shortcoming will be permanently removed."
                              onConfirm={() => removeShortcoming(i, j)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {!readOnly && (
                      <div className={sol.shortcomings.length > 0 ? "border-t border-white/15 mt-2 pt-4" : ""}>
                        {addingSc[i] ? (
                          <Input
                            ref={(el) => { scInputRefs.current[i] = el }}
                            placeholder="Why does this fall short?"
                            value={scDrafts[i] ?? ""}
                            onChange={(e) => setScDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                            onKeyDown={(e) => onScKeyDown(i, e)}
                            onBlur={() => addShortcoming(i)}
                            className="text-md h-8 bg-white border-white text-foreground"
                          />
                        ) : (
                          <Button
                            variant="on-primary"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setAddingSc((prev) => ({ ...prev, [i]: true }))
                              setPanelOpen((prev) => ({ ...prev, [i]: true }))
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            Add Shortcoming
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!readOnly && (
        <div className="mt-5 pt-5 border-t border-white/20">
          {addingSolution ? (
            <Input
              ref={solutionInputRef}
              placeholder="Type an existing solution and press Enter..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onSolutionKeyDown}
              onBlur={addSolution}
              className="text-md h-9 bg-white border-white text-foreground"
            />
          ) : (
            <Button variant="on-primary" className="w-full" onClick={() => setAddingSolution(true)}>
              <Plus className="h-4 w-4" />
              Add Existing Solution
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
