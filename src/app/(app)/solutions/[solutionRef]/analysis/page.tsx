"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useSolution, getAdjacentSteps } from "../context"
import type { SolutionCandidate } from "@/types/solution"
import { BarChart2, ArrowLeft, ArrowRight } from "lucide-react"

const SCORE_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
]

const DIMENSIONS = [
  { key: "feasibility" as const, label: "Feasibility", lowLabel: "Hard", highLabel: "Easy" },
  { key: "impact" as const, label: "Impact", lowLabel: "Low", highLabel: "High" },
  { key: "cost" as const, label: "Cost", lowLabel: "Cheap", highLabel: "Expensive" },
  { key: "timeToImplement" as const, label: "Time", lowLabel: "Fast", highLabel: "Slow" },
]

type ScoreKey = "feasibility" | "impact" | "cost" | "timeToImplement"

function computeScore(c: SolutionCandidate): number | null {
  if (c.feasibility === null || c.impact === null || c.cost === null || c.timeToImplement === null) return null
  // Higher is better: high feasibility + high impact + low cost + low time
  return c.feasibility + c.impact + (6 - c.cost) + (6 - c.timeToImplement)
}

const CASE_STUDY = {
  title: "Scoring Example",
  candidates: [
    { name: "Automated chatbot", feasibility: 4, impact: 3, cost: 2, time: 2, total: 17 },
    { name: "Hire more agents", feasibility: 5, impact: 4, cost: 4, time: 1, total: 16 },
    { name: "Self-service portal", feasibility: 3, impact: 5, cost: 3, time: 4, total: 15 },
  ],
}

export default function AnalysisPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionRef, problem, candidates, setCandidates, analysisNotes, setAnalysisNotes } = useSolution()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionRef)

  const updateScore = (id: number, key: ScoreKey, value: string) => {
    const numVal = value === "" ? null : Number(value)
    setCandidates(
      candidates.map((c) => (c.id === id ? { ...c, [key]: numVal } : c))
    )
  }

  const updateNotes = (id: number, notes: string) => {
    setCandidates(
      candidates.map((c) => (c.id === id ? { ...c, notes } : c))
    )
  }

  const scored = candidates.map((c) => ({ ...c, totalScore: computeScore(c) }))
  const ranked = [...scored].sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={BarChart2}>Score &amp; Compare</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {problem?.description && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Problem</p>
            <p className="text-sm font-medium">{problem.description}</p>
          </div>
        )}

        <p className="text-md leading-relaxed">
          Rate each solution candidate across four dimensions. The composite score will help you compare
          and identify the most promising solutions.
        </p>

        <Tabs defaultValue="strategy">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <div className="bg-primary rounded-xl p-8 flex flex-col gap-6">
              {candidates.length === 0 && (
                <p className="text-sm text-primary-foreground/70 text-center py-4">
                  No candidates to score. Go back and add some solution candidates first.
                </p>
              )}

              {candidates.map((candidate) => (
                <div key={candidate.id} className="rounded-lg border bg-background p-4 flex flex-col gap-4">
                  <p className="text-sm font-semibold">{candidate.title}</p>
                  {candidate.description && (
                    <p className="text-xs text-muted-foreground">{candidate.description}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {DIMENSIONS.map((dim) => (
                      <div key={dim.key} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">{dim.label}</label>
                          <span className="text-[10px] text-muted-foreground">{dim.lowLabel} → {dim.highLabel}</span>
                        </div>
                        <ToggleGroup
                          type="single"
                          value={candidate[dim.key]?.toString() ?? ""}
                          onValueChange={(val) => updateScore(candidate.id, dim.key, val)}
                          className="justify-start"
                        >
                          {SCORE_OPTIONS.map((opt) => (
                            <ToggleGroupItem key={opt.value} value={opt.value} className="text-xs w-8 h-8">
                              {opt.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>
                    ))}
                  </div>
                  <Textarea
                    value={candidate.notes}
                    onChange={(e) => updateNotes(candidate.id, e.target.value)}
                    placeholder="Notes about this candidate..."
                    rows={2}
                    className="text-sm"
                  />
                  {computeScore(candidate) !== null && (
                    <div className="text-sm font-medium text-primary">
                      Composite Score: {computeScore(candidate)} / 20
                    </div>
                  )}
                </div>
              ))}

              {ranked.length > 1 && ranked.some((r) => r.totalScore !== null) && (
                <div className="rounded-lg border bg-background p-4 flex flex-col gap-2">
                  <p className="text-sm font-semibold">Ranking</p>
                  <div className="flex flex-col gap-1">
                    {ranked.filter((r) => r.totalScore !== null).map((c, i) => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="flex-1">{c.title}</span>
                        <span className="text-sm font-medium text-muted-foreground">{c.totalScore}/20</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-primary-foreground">Analysis Notes</label>
                <Textarea
                  value={analysisNotes}
                  onChange={(e) => setAnalysisNotes(e.target.value)}
                  placeholder="Any overall observations about the candidates..."
                  rows={3}
                  className="text-white placeholder:text-white/50 border-white/30"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-6">
              <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold">{CASE_STUDY.title}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1.5 pr-3 font-medium">Solution</th>
                        <th className="text-center py-1.5 px-2 font-medium">Feasibility</th>
                        <th className="text-center py-1.5 px-2 font-medium">Impact</th>
                        <th className="text-center py-1.5 px-2 font-medium">Cost</th>
                        <th className="text-center py-1.5 px-2 font-medium">Time</th>
                        <th className="text-center py-1.5 pl-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CASE_STUDY.candidates.map((c) => (
                        <tr key={c.name} className="border-b last:border-0">
                          <td className="py-1.5 pr-3">{c.name}</td>
                          <td className="text-center py-1.5 px-2">{c.feasibility}</td>
                          <td className="text-center py-1.5 px-2">{c.impact}</td>
                          <td className="text-center py-1.5 px-2">{c.cost}</td>
                          <td className="text-center py-1.5 px-2">{c.time}</td>
                          <td className="text-center py-1.5 pl-2 font-semibold">{c.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Score = Feasibility + Impact + (6 - Cost) + (6 - Time). Higher is better.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          {nextPath && (
            <Button onClick={() => router.push(nextPath)}>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
