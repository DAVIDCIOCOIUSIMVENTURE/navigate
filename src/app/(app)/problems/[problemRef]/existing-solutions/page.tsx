"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EXISTING_SOLUTIONS_CASE_STUDIES } from "./case-studies"
import type { ImpactItem } from "@/types/idea"
import { GitFork, Plus, X, Monitor, Wrench, Users, Ban } from "lucide-react"

const IMPACT_CATEGORIES = [
  "Time Lost", "Money Wasted", "Error Rates", "Customer Churn",
  "Support Tickets", "Productivity Loss", "Revenue Impact", "Compliance Risk",
  "Emotional Impact",
]

export default function ExistingSolutionsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, existingSolutions, setExistingSolutions } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const [addingSolution, setAddingSolution] = useState(false)
  const [draft, setDraft] = useState("")
  const [addingSc, setAddingSc] = useState<Record<number, boolean>>({})
  const [scDrafts, setScDrafts] = useState<Record<number, string>>({})
  const solutionInputRef = useRef<HTMLInputElement>(null)
  const scInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

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
      setExistingSolutions([...existingSolutions, { id: Date.now(), text: trimmed, shortcomings: [], impacts: [] }])
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
      setExistingSolutions(
        existingSolutions.map((sol, idx) =>
          idx === solIdx ? { ...sol, shortcomings: [...sol.shortcomings, trimmed] } : sol
        )
      )
    }
    setScDrafts((prev) => ({ ...prev, [solIdx]: "" }))
    setAddingSc((prev) => ({ ...prev, [solIdx]: false }))
  }

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

  // Impact helpers
  const getImpacts = (sol: typeof existingSolutions[number]) => sol.impacts ?? []

  const updateImpact = (solIdx: number, impactIdx: number, field: keyof ImpactItem, value: string) =>
    setExistingSolutions(
      existingSolutions.map((sol, idx) =>
        idx === solIdx
          ? { ...sol, impacts: getImpacts(sol).map((imp, j) => j === impactIdx ? { ...imp, [field]: value } : imp) }
          : sol
      )
    )

  const removeImpact = (solIdx: number, impactIdx: number) =>
    setExistingSolutions(
      existingSolutions.map((sol, idx) =>
        idx === solIdx
          ? { ...sol, impacts: getImpacts(sol).filter((_, j) => j !== impactIdx) }
          : sol
      )
    )

  const addImpact = (solIdx: number) =>
    setExistingSolutions(
      existingSolutions.map((sol, idx) =>
        idx === solIdx
          ? { ...sol, impacts: [...getImpacts(sol), { category: "", description: "" }] }
          : sol
      )
    )

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={GitFork}>Explore existing solutions</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-md text-muted-foreground">
          <p>
            How are people currently solving, or living with, this problem? List every existing solution
            they reach for today, even if it&apos;s imperfect or informal.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 shrink-0 mt-0.5">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Existing tools &amp; software</p>
                <p className="text-[15px]">Products already on the market</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0 mt-0.5">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Manual workarounds</p>
                <p className="text-[15px]">Spreadsheets, sticky notes, email threads</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shrink-0 mt-0.5">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Hiring or outsourcing</p>
                <p className="text-[15px]">Paying someone else to handle it</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 shrink-0 mt-0.5">
                <Ban className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Doing nothing</p>
                <p className="text-[15px]">Ignoring or tolerating the problem</p>
              </div>
            </div>
          </div>
          <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
          <p>
            For each existing solution, capture its <strong className="text-foreground">shortcomings</strong> and
            its <strong className="text-foreground">impact</strong>, both <strong className="text-foreground">quantifiable</strong> (time lost,
            money wasted, error rates, etc.) and <strong className="text-foreground">emotional</strong> (frustration,
            anxiety, loss of trust, etc.).
          </p>
        </div>

        <datalist id="impact-cats-es">
          {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> What existing solutions are there?</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <div className="bg-primary rounded-xl p-8">
              <div className="flex flex-col divide-y divide-white/20">
                {existingSolutions.map((sol, i) => (
                  <div key={sol.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-1.5 mb-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor={`solution-${sol.id}`} className="text-sm font-medium text-white">Existing Solution {i + 1}</label>
                        <ConfirmDialog
                          trigger={
                            <button className="shrink-0 text-white/50 hover:text-white transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          }
                          title="Remove existing solution?"
                          description="This will also delete all shortcomings and impacts associated with it."
                          onConfirm={() => removeSolution(i)}
                        />
                      </div>
                      <Input
                        id={`solution-${sol.id}`}
                        value={sol.text}
                        onChange={(e) => setExistingSolutions(existingSolutions.map((a, idx) => idx === i ? { ...a, text: e.target.value } : a))}
                        className="text-md font-medium h-8 bg-white border-white text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left: Shortcomings */}
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-white">Shortcomings</p>
                        {sol.shortcomings.map((sc, j) => (
                          <div key={j} className="flex items-center gap-2 text-md">
                            <Input
                              value={sc}
                              onChange={(e) => setExistingSolutions(existingSolutions.map((a, idx) =>
                                idx === i ? { ...a, shortcomings: a.shortcomings.map((s, k) => k === j ? e.target.value : s) } : a
                              ))}
                              className="flex-1 text-md h-7 bg-white border-white text-foreground"
                            />
                            <ConfirmDialog
                              trigger={
                                <button className="shrink-0 text-white/50 hover:text-white transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              }
                              title="Remove shortcoming?"
                              description="This shortcoming will be permanently removed."
                              onConfirm={() => removeShortcoming(i, j)}
                            />
                          </div>
                        ))}
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
                            onClick={() => setAddingSc((prev) => ({ ...prev, [i]: true }))}
                          >
                            <Plus className="h-3 w-3" />
                            Add shortcoming
                          </Button>
                        )}
                      </div>

                      {/* Right: Quantifiable Impact */}
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-white">Impact</p>
                        {getImpacts(sol).length > 0 && (
                          <ul className="flex flex-col gap-1.5">
                            {getImpacts(sol).map((imp, j) => (
                              <li key={j} className="flex items-center gap-2">
                                <Input
                                  list="impact-cats-es"
                                  placeholder="Category..."
                                  value={imp.category}
                                  onChange={(e) => updateImpact(i, j, "category", e.target.value)}
                                  className="text-md h-7 w-2/5 shrink-0 bg-white border-white text-foreground"
                                />
                                <Input
                                  placeholder="Describe the impact..."
                                  value={imp.description}
                                  onChange={(e) => updateImpact(i, j, "description", e.target.value)}
                                  className="text-md h-7 flex-1 bg-white border-white text-foreground"
                                />
                                <button
                                  onClick={() => removeImpact(i, j)}
                                  className="shrink-0 text-white/50 hover:text-white transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <Button
                          variant="on-primary"
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

              </div>

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
            </div>
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
              <p className="text-sm text-white">
                See how successful companies mapped out the existing solutions their customers were already using, and identified the shortcomings that created the opportunity.
              </p>
              {EXISTING_SOLUTIONS_CASE_STUDIES.map((cs) => (
                <div
                  key={cs.company}
                  className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-4"
                >
                  <p className="text-sm font-semibold text-white">{cs.company}</p>
                  <div className="flex flex-col gap-3">
                    {cs.solutions.map((sol) => (
                      <div key={sol.name} className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/5 p-3">
                        <p className="text-sm font-medium text-white">{sol.name}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-xs font-medium text-white uppercase tracking-wide">Shortcomings</span>
                            <ul className="mt-1 flex flex-col gap-0.5">
                              {sol.shortcomings.map((sc, j) => (
                                <li key={j} className="text-white flex gap-1.5">
                                  <span className="shrink-0">•</span>
                                  {sc}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-white uppercase tracking-wide">Impact</span>
                            <ul className="mt-1 flex flex-col gap-0.5">
                              {sol.impacts.map((imp, j) => (
                                <li key={j} className="text-white flex gap-1.5">
                                  <span className="shrink-0">•</span>
                                  {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

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
