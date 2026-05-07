"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDiscovery, getAdjacentSteps } from "../context"
import type { AnalysisToolType, DiscoveryToolType } from "@/types/solution"
import {
  LayoutTemplate, ArrowLeft, ArrowRight, Search, Users, Repeat,
  Lightbulb, RotateCcw, GitCompare, Wrench, Target,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ANALYSIS_TOOL_LABELS: Record<Exclude<AnalysisToolType, "">, { label: string; icon: LucideIcon }> = {
  "root-causes": { label: "Root Causes", icon: Search },
  "five-whys": { label: "5 Whys", icon: Repeat },
  "affected-groups": { label: "Affected Groups", icon: Users },
}

const DISCOVERY_TOOL_LABELS: Record<Exclude<DiscoveryToolType, "">, { label: string; icon: LucideIcon }> = {
  scamper: { label: "SCAMPER", icon: Lightbulb },
  reverse: { label: "Reverse Brainstorming", icon: RotateCcw },
  analogy: { label: "Analogy Thinking", icon: GitCompare },
  improve: { label: "Improve Existing Solutions", icon: Wrench },
}

const SOURCE_LABELS: Record<string, string> = {
  scamper: "SCAMPER",
  reverse: "Reverse",
  analogy: "Analogy",
  improve: "Improve",
  freeform: "Freeform",
}

function SectionHeader({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-foreground/70" />
      <span className="font-semibold text-base">{label}</span>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground italic">{text}</p>
}

export default function SummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    problemId,
    problem,
    analysisToolType,
    discoveryToolType,
    rootCauses,
    rootCauseNotes,
    fiveWhyChains,
    affectedGroups,
    reverseBrainstorm,
    reverseInversion,
    analogyDomain,
    analogyInsight,
    candidates,
  } = useDiscovery()
  const { prevPath } = getAdjacentSteps(pathname)

  useEffect(() => {
    if (problemId == null) {
      router.replace("/solutions/discover/select-problem")
    }
  }, [problemId, router])

  if (problemId == null) return null

  const analysisTool = analysisToolType ? ANALYSIS_TOOL_LABELS[analysisToolType] : null
  const discoveryTool = discoveryToolType ? DISCOVERY_TOOL_LABELS[discoveryToolType] : null

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={LayoutTemplate}>Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-8">
        <p className="text-base leading-relaxed">
          Here&apos;s everything you produced in this discovery session. Each candidate has been added to your Solution Bank; click <strong>Validate</strong> on any of them to start the validation flow.
        </p>

        {problem?.description && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p>
            <p className="text-sm font-medium">{problem.description}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <SectionHeader icon={Search} label={`Refinement${analysisTool ? `: ${analysisTool.label}` : ""}`} />

          {!analysisTool && <EmptyHint text="No refinement method was chosen." />}

          {analysisToolType === "root-causes" && (
            <div className="flex flex-col gap-2">
              {rootCauses.length > 0 ? (
                <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
                  {rootCauses.map((rc) => <li key={rc.id}>{rc.description || <span className="italic text-muted-foreground">Empty cause</span>}</li>)}
                </ul>
              ) : (
                <EmptyHint text="No root causes captured." />
              )}
              {rootCauseNotes && (
                <div className="rounded-md border bg-muted/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{rootCauseNotes}</p>
                </div>
              )}
            </div>
          )}

          {analysisToolType === "five-whys" && (
            <div className="flex flex-col gap-3">
              {fiveWhyChains.length > 0 ? (
                fiveWhyChains.map((chain, i) => {
                  const filled = chain.whys.filter((w) => w.trim())
                  return (
                    <div key={chain.id} className="rounded-md border bg-muted/40 p-3 flex flex-col gap-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chain {i + 1} ({filled.length}/5 filled)</p>
                      {filled.length === 0 ? (
                        <EmptyHint text="No whys captured in this chain." />
                      ) : (
                        <ol className="list-decimal pl-5 text-sm flex flex-col gap-0.5">
                          {chain.whys.map((w, idx) => w.trim() ? <li key={idx}>{w}</li> : null)}
                        </ol>
                      )}
                    </div>
                  )
                })
              ) : (
                <EmptyHint text="No chains captured." />
              )}
            </div>
          )}

          {analysisToolType === "affected-groups" && (
            <div className="flex flex-col gap-2">
              {affectedGroups.length > 0 ? (
                affectedGroups.map((g) => (
                  <div key={g.id} className="rounded-md border bg-muted/40 p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{g.name || <span className="italic text-muted-foreground">Unnamed</span>}</span>
                      {g.severity && <Badge variant="outline" className="text-[10px] capitalize">{g.severity}</Badge>}
                    </div>
                    {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
                  </div>
                ))
              ) : (
                <EmptyHint text="No affected groups captured." />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeader icon={Lightbulb} label={`Discovery${discoveryTool ? `: ${discoveryTool.label}` : ""}`} />

          {!discoveryTool && <EmptyHint text="No discovery method was chosen." />}

          {discoveryToolType === "reverse" && (
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-md border bg-muted/40 p-3 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Make it worse ({reverseBrainstorm.length})</p>
                {reverseBrainstorm.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm flex flex-col gap-0.5">
                    {reverseBrainstorm.map((item) => <li key={item.id}>{item.text}</li>)}
                  </ul>
                ) : (
                  <EmptyHint text="No items captured." />
                )}
              </div>
              <div className="rounded-md border bg-muted/40 p-3 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inversions ({reverseInversion.length})</p>
                {reverseInversion.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm flex flex-col gap-0.5">
                    {reverseInversion.map((item) => <li key={item.id}>{item.text}</li>)}
                  </ul>
                ) : (
                  <EmptyHint text="No inversions captured." />
                )}
              </div>
            </div>
          )}

          {discoveryToolType === "analogy" && (
            <div className="rounded-md border bg-muted/40 p-3 flex flex-col gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domain</p>
                <p className="text-sm">{analogyDomain || <span className="italic text-muted-foreground">Not set</span>}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Insight</p>
                {analogyInsight ? (
                  <p className="text-sm whitespace-pre-wrap">{analogyInsight}</p>
                ) : (
                  <EmptyHint text="No insight captured." />
                )}
              </div>
            </div>
          )}

          {(discoveryToolType === "scamper" || discoveryToolType === "improve") && (
            <p className="text-sm text-muted-foreground">
              {candidates.length > 0
                ? `You captured ${candidates.length} candidate${candidates.length === 1 ? "" : "s"} using this method. See them below.`
                : "No candidates captured yet."}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeader icon={Target} label={`Candidates (${candidates.length})`} />
          {candidates.length === 0 ? (
            <EmptyHint text="No candidates in the bank for this problem yet. Go back to the Discover step to add some." />
          ) : (
            <div className="flex flex-col gap-2">
              {candidates.map((c) => (
                <div key={c.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{c.title || <span className="italic text-muted-foreground">Untitled</span>}</p>
                      {c.inspirationSource && (
                        <Badge variant="outline" className="text-[10px]">
                          {SOURCE_LABELS[c.inspirationSource] ?? c.inspirationSource}
                        </Badge>
                      )}
                    </div>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 h-8"
                    onClick={() => router.push(`/solutions/${c.id}/validate/introduction`)}
                  >
                    Validate<ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          <Button onClick={() => router.push("/solutions")}>
            Finish<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
