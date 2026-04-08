"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSolution, getAdjacentSteps } from "../context"
import type { SolutionCandidate } from "@/types/solution"
import {
  LayoutTemplate, ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, XCircle,
  Search, Users, Trophy,
} from "lucide-react"

function computeScore(c: SolutionCandidate): number | null {
  if (c.feasibility === null || c.impact === null || c.cost === null || c.timeToImplement === null) return null
  return c.feasibility + c.impact + (6 - c.cost) + (6 - c.timeToImplement)
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-foreground/70" />
      <span className="font-semibold text-md">{label}</span>
    </div>
  )
}

export default function SummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    solutionRef, problem,
    rootCauses, fiveWhyChains, affectedGroups,
    candidates, selectedCandidateId, setSelectedCandidateId,
    verdict, setVerdict, setStatus,
    analysisNotes,
  } = useSolution()
  const { prevPath } = getAdjacentSteps(pathname, solutionRef)

  const scored = candidates
    .map((c) => ({ ...c, totalScore: computeScore(c) }))
    .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId)

  const handleVerdict = (v: typeof verdict) => {
    setVerdict(v)
    setStatus(v === "pursue" ? "complete" : v === "abandon" ? "complete" : "in_progress")
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={LayoutTemplate}>Summary &amp; Verdict</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-8">

        {/* Problem */}
        {problem?.description && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Problem</p>
            <p className="text-sm font-medium">{problem.description}</p>
          </div>
        )}

        {/* Root Causes */}
        <div className="flex flex-col gap-2">
          <SectionHeader icon={Search} label="Root Causes" />
          {rootCauses.length > 0 ? (
            <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
              {rootCauses.map((rc) => <li key={rc.id}>{rc.description}</li>)}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">No root causes identified</p>
          )}
          {fiveWhyChains.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs font-medium text-muted-foreground">{fiveWhyChains.length} Five-Whys chain(s) completed</p>
            </div>
          )}
        </div>

        {/* Affected Groups */}
        <div className="flex flex-col gap-2">
          <SectionHeader icon={Users} label="Affected Groups" />
          {affectedGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {affectedGroups.map((g) => (
                <div key={g.id} className="flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5">
                  <span className="text-sm">{g.name || "Unnamed"}</span>
                  {g.severity && (
                    <Badge variant="outline" className="text-[10px]">{g.severity}</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No affected groups identified</p>
          )}
        </div>

        {/* Solution Candidates Ranked */}
        <div className="flex flex-col gap-3">
          <SectionHeader icon={Trophy} label="Solution Candidates (Ranked)" />
          {scored.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No candidates to show</p>
          ) : (
            <div className="flex flex-col gap-2">
              {scored.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selectedCandidateId === c.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{c.title}</p>
                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                    {c.totalScore !== null && (
                      <span className="text-sm font-semibold text-primary">{c.totalScore}/20</span>
                    )}
                    {selectedCandidateId === c.id && (
                      <Badge variant="default" className="text-[10px] mt-1">Selected</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analysis Notes */}
        {analysisNotes && (
          <div className="rounded-lg border bg-muted/50 p-4 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Analysis Notes</p>
            <p className="text-sm whitespace-pre-wrap">{analysisNotes}</p>
          </div>
        )}

        {/* Verdict */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Verdict</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={verdict === "pursue" ? "default" : "outline"}
              className="gap-2"
              onClick={() => handleVerdict("pursue")}
            >
              <CheckCircle2 className="h-4 w-4" />Pursue
            </Button>
            <Button
              variant={verdict === "revisit" ? "secondary" : "outline"}
              className="gap-2"
              onClick={() => handleVerdict("revisit")}
            >
              <HelpCircle className="h-4 w-4" />Revisit Later
            </Button>
            <Button
              variant={verdict === "abandon" ? "destructive" : "outline"}
              className="gap-2"
              onClick={() => handleVerdict("abandon")}
            >
              <XCircle className="h-4 w-4" />Abandon
            </Button>
          </div>
        </div>

        {/* Next Steps */}
        {verdict !== "none" && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next Steps</p>
            {verdict === "pursue" && selectedCandidate && (
              <>
                <p className="text-sm">
                  You&apos;ve chosen to pursue <strong>{selectedCandidate.title}</strong>.
                  Head back to the solutions list to review your progress.
                </p>
                <Button className="self-start mt-2" onClick={() => router.push("/solutions")}>
                  <ArrowRight className="h-4 w-4 mr-2" />Back to Solutions
                </Button>
              </>
            )}
            {verdict === "pursue" && !selectedCandidate && (
              <p className="text-sm text-muted-foreground">
                Select a solution candidate above to finalise your choice.
              </p>
            )}
            {verdict === "revisit" && (
              <>
                <p className="text-sm">
                  Consider refining your root cause analysis or exploring more brainstorming techniques.
                </p>
                <Button variant="outline" className="self-start mt-2" onClick={() => router.push(`/solutions/${solutionRef}/choose-refinement`)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />Back to Refinement
                </Button>
              </>
            )}
            {verdict === "abandon" && (
              <>
                <p className="text-sm">
                  This solution path has been marked as abandoned. You can try a different approach or move on to another problem.
                </p>
                <Button variant="outline" className="self-start mt-2" onClick={() => router.push("/solutions")}>
                  <ArrowRight className="h-4 w-4 mr-2" />Back to Solutions
                </Button>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          <div />
        </div>
      </CardContent>
    </Card>
  )
}
