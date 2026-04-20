"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AutoTextarea } from "@/components/ui/auto-textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EXISTING_SOLUTIONS_CASE_STUDIES } from "./case-studies"
import type { ImpactItem, ShortcomingItem } from "@/types/idea"
import { GitFork, Plus, X, Monitor, Wrench, Users, Ban, ChevronDown } from "lucide-react"

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
  const [mounted, setMounted] = useState(false)
  const solutionInputRef = useRef<HTMLInputElement>(null)
  const scInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

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
      const newItem: ShortcomingItem = {
        id: Date.now(),
        text: trimmed,
        impact: { category: "", description: "" },
      }
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

  const updateImpact = (solIdx: number, scIdx: number, field: keyof ImpactItem, value: string) =>
    setExistingSolutions(
      existingSolutions.map((sol, idx) =>
        idx === solIdx
          ? {
              ...sol,
              shortcomings: sol.shortcomings.map((s, k) =>
                k === scIdx ? { ...s, impact: { ...s.impact, [field]: value } } : s
              ),
            }
          : sol
      )
    )

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={GitFork}>Explore existing solutions &amp; shortcomings</CardTitle>
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
                <p className="text-md">Products already on the market</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0 mt-0.5">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Manual workarounds</p>
                <p className="text-md">Spreadsheets, sticky notes, email threads</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shrink-0 mt-0.5">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Hiring or outsourcing</p>
                <p className="text-md">Paying someone else to handle it</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 shrink-0 mt-0.5">
                <Ban className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Doing nothing</p>
                <p className="text-md">Ignoring or tolerating the problem</p>
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

        <hr className="border-border/40 my-4" />

        <div className="flex flex-col gap-2 items-center text-center">
          <h3 className="text-xl font-bold"><span className="text-primary">Your Turn:</span> What existing solutions are there?</h3>
          <p className="text-md text-muted-foreground max-w-xl">
            Add every existing solution your customer uses today. For each one, capture its shortcomings and the impact those gaps have on them.
          </p>
        </div>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <div className="bg-primary rounded-xl p-8">
              <div className="flex flex-col gap-4">
                {mounted && existingSolutions.map((sol, i) => (
                  <div key={sol.id} className="rounded-lg border border-white/15 bg-white/10 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-white">Existing Solution {i + 1}</h4>
                      <ConfirmDialog
                        trigger={
                          <button className="shrink-0 text-white/60 hover:text-white transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        }
                        title="Remove existing solution?"
                        description="This will also delete all shortcomings and impacts associated with it."
                        onConfirm={() => removeSolution(i)}
                      />
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                      <label htmlFor={`solution-${sol.id}`} className="text-sm font-medium leading-none text-white/80">Existing solution name</label>
                      <Input
                        id={`solution-${sol.id}`}
                        value={sol.text}
                        onChange={(e) => setExistingSolutions(existingSolutions.map((a, idx) => idx === i ? { ...a, text: e.target.value } : a))}
                        className="text-md font-medium h-8 bg-white border-white text-foreground"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-base font-semibold text-white">Shortcomings &amp; Impacts</p>
                        <p className="text-sm text-white/70">Where this solution falls short, and how those gaps hurt the customer.</p>
                      </div>
                      <div className="flex flex-col divide-y divide-white/15">
                      {sol.shortcomings.map((sc, j) => (
                        <div key={sc.id} className="flex flex-col gap-2 pb-5 pt-4 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <label htmlFor={`shortcoming-${sol.id}-${sc.id}`} className="text-sm font-medium leading-none text-white/80">Shortcoming</label>
                            <ConfirmDialog
                              trigger={
                                <button className="shrink-0 text-white/50 hover:text-white transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              }
                              title="Remove shortcoming?"
                              description="This shortcoming and its impact will be permanently removed."
                              onConfirm={() => removeShortcoming(i, j)}
                            />
                          </div>
                          <AutoTextarea
                            id={`shortcoming-${sol.id}-${sc.id}`}
                            value={sc.text}
                            placeholder="Why does this fall short?"
                            onChange={(e) => updateShortcomingText(i, j, e.target.value)}
                            className="bg-white border-white text-foreground"
                          />
                          <div className="flex items-start gap-2 pl-4 pt-2">
                            <div className="w-2/5 shrink-0 flex flex-col gap-2">
                              <label htmlFor={`impact-cat-${sol.id}-${sc.id}`} className="text-sm font-medium leading-none text-white/70">Impact</label>
                              <div className="relative">
                              <Input
                                id={`impact-cat-${sol.id}-${sc.id}`}
                                placeholder="Impact category..."
                                value={sc.impact.category}
                                onChange={(e) => updateImpact(i, j, "category", e.target.value)}
                                className="text-md h-7 pr-7 bg-white border-white text-foreground"
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    aria-label="Choose impact category"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                  >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="max-h-64 overflow-auto">
                                  {IMPACT_CATEGORIES.map((c) => (
                                    <DropdownMenuItem
                                      key={c}
                                      onSelect={() => updateImpact(i, j, "category", c)}
                                    >
                                      {c}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <label htmlFor={`impact-desc-${sol.id}-${sc.id}`} className="text-sm font-medium leading-none text-white/70">Description</label>
                              <AutoTextarea
                                id={`impact-desc-${sol.id}-${sc.id}`}
                                placeholder="Describe the impact..."
                                value={sc.impact.description}
                                onChange={(e) => updateImpact(i, j, "description", e.target.value)}
                                className="bg-white border-white text-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
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
                            onClick={() => setAddingSc((prev) => ({ ...prev, [i]: true }))}
                          >
                            <Plus className="h-3 w-3" />
                            Add Shortcoming
                          </Button>
                        )}
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
              {EXISTING_SOLUTIONS_CASE_STUDIES.map((cs) => {
                const Icon = cs.icon
                return (
                <div
                  key={cs.company}
                  className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${cs.iconBg}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-white">{cs.company}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {cs.solutions.map((sol) => (
                      <div key={sol.name} className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/5 p-3">
                        <p className="text-sm font-medium text-white">{sol.name}</p>
                        <div className="flex flex-col divide-y divide-white/10">
                          {sol.shortcomings.map((sc, j) => (
                            <div key={j} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm py-3 first:pt-0 last:pb-0">
                              <div>
                                <span className="text-xs font-medium text-white uppercase tracking-wide">Shortcoming</span>
                                <p className="mt-1 text-white">{sc.text}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-white uppercase tracking-wide">Impact</span>
                                <p className="mt-1 text-white">{sc.impact}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )
              })}
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
