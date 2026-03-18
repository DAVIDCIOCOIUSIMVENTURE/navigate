"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ImpactItem } from "@/types/idea"
import { GitFork, Plus, X, BarChart2 } from "lucide-react"

const IMPACT_CATEGORIES = [
  "Time Lost", "Money Wasted", "Error Rates", "Customer Churn",
  "Support Tickets", "Productivity Loss", "Revenue Impact", "Compliance Risk",
]

export default function AlternativesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, alternatives, setAlternatives } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const [addingAlt, setAddingAlt] = useState(false)
  const [draft, setDraft] = useState("")
  const [addingSc, setAddingSc] = useState<Record<number, boolean>>({})
  const [scDrafts, setScDrafts] = useState<Record<number, string>>({})
  const altInputRef = useRef<HTMLInputElement>(null)
  const scInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    if (addingAlt) altInputRef.current?.focus()
  }, [addingAlt])

  useEffect(() => {
    const entries = Object.entries(addingSc)
    const lastTrue = entries.findLast(([, v]) => v)
    if (lastTrue) scInputRefs.current[Number(lastTrue[0])]?.focus()
  }, [addingSc])

  const addAlternative = () => {
    const trimmed = draft.trim()
    if (trimmed) {
      setAlternatives([...alternatives, { id: Date.now(), text: trimmed, shortcomings: [], impacts: [] }])
    }
    setDraft("")
    setAddingAlt(false)
  }

  const removeAlternative = (i: number) => setAlternatives(alternatives.filter((_, idx) => idx !== i))

  const onAltKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addAlternative() }
    if (e.key === "Escape") { setDraft(""); setAddingAlt(false) }
  }

  const addShortcoming = (altIdx: number) => {
    const trimmed = (scDrafts[altIdx] ?? "").trim()
    if (trimmed) {
      setAlternatives(
        alternatives.map((alt, idx) =>
          idx === altIdx ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
        )
      )
    }
    setScDrafts((prev) => ({ ...prev, [altIdx]: "" }))
    setAddingSc((prev) => ({ ...prev, [altIdx]: false }))
  }

  const removeShortcoming = (altIdx: number, scIdx: number) =>
    setAlternatives(
      alternatives.map((alt, idx) =>
        idx === altIdx
          ? { ...alt, shortcomings: alt.shortcomings.filter((_, j) => j !== scIdx) }
          : alt
      )
    )

  const onScKeyDown = (altIdx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addShortcoming(altIdx) }
    if (e.key === "Escape") { setScDrafts((prev) => ({ ...prev, [altIdx]: "" })); setAddingSc((prev) => ({ ...prev, [altIdx]: false })) }
  }

  // Impact helpers
  const getImpacts = (alt: typeof alternatives[number]) => alt.impacts ?? []

  const updateImpact = (altIdx: number, impactIdx: number, field: keyof ImpactItem, value: string) =>
    setAlternatives(
      alternatives.map((alt, idx) =>
        idx === altIdx
          ? { ...alt, impacts: getImpacts(alt).map((imp, j) => j === impactIdx ? { ...imp, [field]: value } : imp) }
          : alt
      )
    )

  const removeImpact = (altIdx: number, impactIdx: number) =>
    setAlternatives(
      alternatives.map((alt, idx) =>
        idx === altIdx
          ? { ...alt, impacts: getImpacts(alt).filter((_, j) => j !== impactIdx) }
          : alt
      )
    )

  const addImpact = (altIdx: number) =>
    setAlternatives(
      alternatives.map((alt, idx) =>
        idx === altIdx
          ? { ...alt, impacts: [...getImpacts(alt), { category: "", description: "" }] }
          : alt
      )
    )

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardTitle icon={GitFork} className="text-lg">Existing Solutions</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            How are people currently solving — or living with — this problem? List every existing solution
            they reach for today, even if it&apos;s imperfect or informal.
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li><strong className="text-foreground">Existing tools &amp; software</strong> — products already on the market</li>
            <li><strong className="text-foreground">Manual workarounds</strong> — spreadsheets, sticky notes, email threads</li>
            <li><strong className="text-foreground">Hiring or outsourcing</strong> — paying someone else to handle it</li>
            <li><strong className="text-foreground">Doing nothing</strong> — ignoring or tolerating the problem</li>
          </ul>
          <p>
            For each existing solution, capture its <strong className="text-foreground">shortcomings</strong> and
            its <strong className="text-foreground">quantifiable impact</strong> — the measurable cost of the problem
            when using that solution (time lost, money wasted, error rates, etc.).
          </p>
        </div>

        <datalist id="impact-cats-es">
          {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>

        <h3 className="mt-8 text-base font-medium text-center"><span className="text-primary">Your Turn:</span> What Existing Solutions Are There?</h3>

        <div className="flex flex-col gap-5">
          {alternatives.map((alt, i) => (
            <div key={alt.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={alt.text}
                  onChange={(e) => setAlternatives(alternatives.map((a, idx) => idx === i ? { ...a, text: e.target.value } : a))}
                  className="flex-1 text-sm font-medium h-8"
                />
                <ConfirmDialog
                  trigger={
                    <button className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  }
                  title="Remove alternative?"
                  description="This will also delete all shortcomings and impacts associated with it."
                  onConfirm={() => removeAlternative(i)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Left: Shortcomings */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Shortcomings</p>
                  {alt.shortcomings.length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {alt.shortcomings.map((sc, j) => (
                        <li key={j} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                          <Input
                            value={sc}
                            onChange={(e) => setAlternatives(alternatives.map((a, idx) =>
                              idx === i ? { ...a, shortcomings: a.shortcomings.map((s, k) => k === j ? e.target.value : s) } : a
                            ))}
                            className="flex-1 text-sm h-7"
                          />
                          <ConfirmDialog
                            trigger={
                              <button className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            }
                            title="Remove shortcoming?"
                            description="This shortcoming will be permanently removed."
                            onConfirm={() => removeShortcoming(i, j)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                  {addingSc[i] ? (
                    <Input
                      ref={(el) => { scInputRefs.current[i] = el }}
                      placeholder="Why does this fall short?"
                      value={scDrafts[i] ?? ""}
                      onChange={(e) => setScDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                      onKeyDown={(e) => onScKeyDown(i, e)}
                      onBlur={() => addShortcoming(i)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <Button
                      variant="dashed"
                      size="sm"
                      onClick={() => setAddingSc((prev) => ({ ...prev, [i]: true }))}
                    >
                      <Plus className="h-3 w-3" />
                      Add shortcoming
                    </Button>
                  )}
                </div>

                {/* Right: Quantifiable Impact */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">Quantifiable Impact</p>
                  </div>
                  {getImpacts(alt).length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {getImpacts(alt).map((imp, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <Input
                            list="impact-cats-es"
                            placeholder="Category..."
                            value={imp.category}
                            onChange={(e) => updateImpact(i, j, "category", e.target.value)}
                            className="text-sm h-7 w-2/5 shrink-0"
                          />
                          <Input
                            placeholder="Describe the impact..."
                            value={imp.description}
                            onChange={(e) => updateImpact(i, j, "description", e.target.value)}
                            className="text-sm h-7 flex-1"
                          />
                          <button
                            onClick={() => removeImpact(i, j)}
                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    variant="dashed"
                    size="sm"
                    onClick={() => addImpact(i)}
                  >
                    <Plus className="h-3 w-3" />
                    Add impact
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {addingAlt ? (
            <Input
              ref={altInputRef}
              placeholder="Type an alternative and press Enter..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onAltKeyDown}
              onBlur={addAlternative}
              className="text-sm h-9"
            />
          ) : (
            <Button variant="dashed" onClick={() => setAddingAlt(true)}>
              <Plus className="h-4 w-4" />
              Add Alternative
            </Button>
          )}
        </div>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
