"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useProblem } from "@/app/(app)/problems/[problemRef]/validation/context"
import type { AffectedGroup, AnalysisToolType } from "@/types/solution"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Search, TreePine, HelpCircle, Users, CheckCircle2 } from "lucide-react"

function RootCausesForm({ readOnly = false }: { readOnly?: boolean }) {
  const { rootCauses, setRootCauses, rootCauseNotes, setRootCauseNotes } = useProblem()
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const addCause = () => {
    const text = draft.trim()
    if (text) {
      const id = rootCauses.length > 0 ? Math.max(...rootCauses.map((c) => c.id)) + 1 : 1
      setRootCauses([...rootCauses, { id, description: text }])
    }
    setDraft("")
    setAdding(false)
  }

  const removeCause = (id: number) => {
    setRootCauses(rootCauses.filter((c) => c.id !== id))
  }

  const updateCause = (id: number, description: string) => {
    setRootCauses(rootCauses.map((c) => (c.id === id ? { ...c, description } : c)))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addCause() }
    if (e.key === "Escape") { setDraft(""); setAdding(false) }
  }

  if (readOnly && rootCauses.length === 0 && !rootCauseNotes.trim()) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No root causes captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-secondary-brand rounded-xl p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-white">Root Causes</label>
        {!readOnly && (
          <p className="text-sm text-white/80">
            List the underlying causes of the problem. Ask yourself: &quot;Why does this happen?&quot;
          </p>
        )}

        {rootCauses.map((cause) => (
          <div key={cause.id} className="flex items-center gap-2">
            <Input
              value={cause.description}
              onChange={(e) => updateCause(cause.id, e.target.value)}
              readOnly={readOnly}
              className="flex-1 text-base bg-white border-white text-foreground read-only:cursor-default"
            />
            {!readOnly && (
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                onClick={() => removeCause(cause.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}

        {!readOnly && (adding ? (
          <Input
            ref={inputRef}
            placeholder="Type a root cause and press Enter..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={addCause}
            className="text-base bg-white border-white text-foreground"
          />
        ) : (
          <Button variant="on-primary" className="w-full" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Add Root Cause
          </Button>
        ))}
      </div>

      {(!readOnly || rootCauseNotes.trim()) && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Notes</label>
          <Textarea
            value={rootCauseNotes}
            onChange={(e) => setRootCauseNotes(e.target.value)}
            placeholder="Any additional observations about the root causes..."
            rows={3}
            readOnly={readOnly}
            className="bg-white border-white text-foreground read-only:cursor-default"
          />
        </div>
      )}
    </div>
  )
}

const WHY_LABELS = ["Why 1", "Why 2", "Why 3", "Why 4", "Why 5"]

function FiveWhysForm({ readOnly = false }: { readOnly?: boolean }) {
  const { fiveWhyChains, setFiveWhyChains } = useProblem()

  const addChain = () => {
    const id = fiveWhyChains.length > 0 ? Math.max(...fiveWhyChains.map((c) => c.id)) + 1 : 1
    setFiveWhyChains([...fiveWhyChains, { id, whys: ["", "", "", "", ""] }])
  }

  const removeChain = (id: number) => {
    setFiveWhyChains(fiveWhyChains.filter((c) => c.id !== id))
  }

  const updateWhy = (chainId: number, index: number, value: string) => {
    setFiveWhyChains(
      fiveWhyChains.map((c) => {
        if (c.id !== chainId) return c
        const whys = [...c.whys]
        whys[index] = value
        return { ...c, whys }
      })
    )
  }

  if (readOnly && fiveWhyChains.length === 0) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No 5-Whys chains captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-secondary-brand rounded-xl p-8 flex flex-col gap-5">
      {!readOnly && fiveWhyChains.length === 0 && (
        <p className="text-sm text-white/70 text-center py-4">
          No chains yet. Add one to start exploring root causes.
        </p>
      )}

      {fiveWhyChains.length > 0 && (
        <div className="flex flex-col divide-y divide-white/20">
          {fiveWhyChains.map((chain, chainIndex) => (
            <div key={chain.id} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Chain {chainIndex + 1}</p>
                {!readOnly && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => removeChain(chain.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="flex flex-col">
                {WHY_LABELS.map((label, i) => {
                  const value = chain.whys[i] ?? ""
                  if (readOnly && !value.trim()) return null
                  return (
                    <div key={label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        {i < 4 && <div className="w-px flex-1 bg-white/30" />}
                      </div>
                      <div className="flex-1 flex flex-col gap-2 pb-3 last:pb-0">
                        <label className="text-sm font-medium text-white/80">{label}</label>
                        <Textarea
                          value={value}
                          onChange={(e) => updateWhy(chain.id, i, e.target.value)}
                          placeholder={i === 0 ? "Why does this problem occur?" : "Why is that?"}
                          rows={2}
                          readOnly={readOnly}
                          className="text-sm bg-white border-white text-foreground read-only:cursor-default"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <Button variant="on-primary" onClick={addChain} className="w-full gap-2">
          <Plus className="h-4 w-4" />Add Chain
        </Button>
      )}
    </div>
  )
}

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const

function AffectedGroupsForm({ readOnly = false }: { readOnly?: boolean }) {
  const { affectedGroups, setAffectedGroups } = useProblem()

  const addGroup = () => {
    const id = affectedGroups.length > 0 ? Math.max(...affectedGroups.map((g) => g.id)) + 1 : 1
    setAffectedGroups([...affectedGroups, { id, name: "", severity: "", description: "" }])
  }

  const removeGroup = (id: number) => {
    setAffectedGroups(affectedGroups.filter((g) => g.id !== id))
  }

  const updateGroup = (id: number, patch: Partial<AffectedGroup>) => {
    setAffectedGroups(affectedGroups.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  if (readOnly && affectedGroups.length === 0) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No affected groups captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-secondary-brand rounded-xl p-8 flex flex-col gap-5">
      {!readOnly && affectedGroups.length === 0 && (
        <p className="text-sm text-white/70 text-center py-4">
          No groups added yet. Add a group to start mapping who is affected.
        </p>
      )}

      {affectedGroups.length > 0 && (
        <div className="flex flex-col divide-y divide-white/20">
          {affectedGroups.map((group, i) => (
            <div key={group.id} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">Group {i + 1}</p>
                {!readOnly && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => removeGroup(group.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Group Name</label>
                <Input
                  value={group.name}
                  onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                  placeholder="e.g. 'Working parents'"
                  readOnly={readOnly}
                  className="font-medium bg-white border-white text-foreground read-only:cursor-default"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Description</label>
                <Textarea
                  value={group.description}
                  onChange={(e) => updateGroup(group.id, { description: e.target.value })}
                  placeholder="How are they affected? What makes this group unique?"
                  rows={2}
                  readOnly={readOnly}
                  className="bg-white border-white text-foreground read-only:cursor-default"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Severity</label>
                <ToggleGroup
                  type="single"
                  value={group.severity}
                  onValueChange={(val) => updateGroup(group.id, { severity: (val || "") as AffectedGroup["severity"] })}
                  className="justify-start"
                  disabled={readOnly}
                >
                  {SEVERITY_OPTIONS.map((opt) => (
                    <ToggleGroupItem
                      key={opt.value}
                      value={opt.value}
                      className="text-sm rounded-none text-white data-[state=on]:bg-white data-[state=on]:text-primary hover:bg-white/10 hover:text-white"
                    >
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <Button variant="on-primary" onClick={addGroup} className="w-full gap-2">
          <Plus className="h-4 w-4" />Add Group
        </Button>
      )}
    </div>
  )
}

type ChosenTool = "root-causes" | "five-whys" | "affected-groups"

const TOOL_CARDS: Record<ChosenTool, { title: string; description: string; icon: typeof Search }> = {
  "root-causes": {
    title: "Root Causes",
    description: "List the underlying causes of the problem.",
    icon: TreePine,
  },
  "five-whys": {
    title: "5 Whys Technique",
    description: "Ask \"Why?\" five times in succession.",
    icon: HelpCircle,
  },
  "affected-groups": {
    title: "Affected Groups",
    description: "Identify who is most affected and how severely.",
    icon: Users,
  },
}

function MethodChooser({ onChoose }: { onChoose: (tool: ChosenTool) => void }) {
  const { analysisToolType } = useProblem()
  const tools: ChosenTool[] = ["root-causes", "five-whys", "affected-groups"]
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tools.map((key) => {
        const tool = TOOL_CARDS[key]
        const Icon = tool.icon
        const isSelected = analysisToolType === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChoose(key)}
            aria-pressed={isSelected}
            className={cn(
              "relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            {isSelected && (
              <span className="absolute -top-2 right-3 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                Selected
              </span>
            )}
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10"
            )}>
              <Icon className={cn("h-4 w-4", isSelected ? "text-primary-foreground" : "text-primary")} />
            </div>
            <h4 className={cn("text-sm font-semibold", isSelected && "text-primary")}>{tool.title}</h4>
            <p className="text-sm leading-relaxed">{tool.description}</p>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Strategy block for the chosen refinement method. When `showChooser` is true,
 * the active method can be swapped inline (used on the hub). When false, only
 * the form for the current method is shown (used on the dedicated refine step,
 * which has its own selector page). `readOnly` disables the chooser and all
 * inputs, used by the summary view.
 */
export function RefinementStrategy({
  showChooser = false,
  readOnly = false,
}: {
  showChooser?: boolean
  readOnly?: boolean
}) {
  const { analysisToolType, setAnalysisToolType } = useProblem()

  // The chooser is only an editable affordance: hide it whenever the strategy
  // is readOnly, even when callers pass `showChooser`. Without a method
  // selected, fall through to the empty placeholder regardless of which
  // surface we are rendering on.
  const showSelector = showChooser && !readOnly

  return (
    <div className="flex flex-col gap-4">
      {showSelector && (
        <MethodChooser onChoose={(tool) => setAnalysisToolType(tool as AnalysisToolType)} />
      )}
      {analysisToolType === "root-causes" && <RootCausesForm readOnly={readOnly} />}
      {analysisToolType === "five-whys" && <FiveWhysForm readOnly={readOnly} />}
      {analysisToolType === "affected-groups" && <AffectedGroupsForm readOnly={readOnly} />}
      {!analysisToolType && !showSelector && (
        readOnly ? (
          <div className="bg-secondary-brand rounded-xl p-8">
            <p className="text-sm text-white/70 italic">No refinement captured.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm">
            No refinement method selected.
          </div>
        )
      )}
    </div>
  )
}
