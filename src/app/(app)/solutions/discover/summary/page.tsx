"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDiscovery, getAdjacentSteps } from "../context"
import type { DiscoveryToolType } from "@/types/solution"
import {
  ClipboardCheck, ArrowLeft, ArrowRight,
  Lightbulb, RotateCcw, GitCompare, Wrench,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ProblemContextCard } from "@/components/context-card"

const DISCOVERY_TOOL_LABELS: Record<Exclude<DiscoveryToolType, "">, { label: string; icon: LucideIcon }> = {
  scamper: { label: "SCAMPER", icon: Lightbulb },
  reverse: { label: "Reverse Ideation", icon: RotateCcw },
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

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-white">{children}</h3>
}

function ReviewSection({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-xl bg-secondary-brand p-6 flex flex-col gap-3">
      {children}
    </section>
  )
}

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-yellow-600" aria-hidden="true">
      <Icon className="h-4 w-4 text-white" />
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-base italic text-white">{text}</p>
}

function WhitePanel({ children }: { children: ReactNode }) {
  return <div className="rounded-lg bg-white p-4 text-foreground flex flex-col gap-1">{children}</div>
}

export default function SummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    problemId,
    problem,
    discoveryToolType,
    reverseIdeation,
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

  const discoveryTool = discoveryToolType ? DISCOVERY_TOOL_LABELS[discoveryToolType] : null
  const DiscoveryIcon = discoveryTool?.icon ?? Lightbulb

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={ClipboardCheck}>Review your solutions</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-base leading-relaxed">
          Every candidate below has been saved to your <span className="font-semibold">solution bank</span>.
          Click <span className="font-semibold">Validate</span> on a candidate to start validating it.
        </p>

        <ProblemContextCard problem={problem} />

        <ReviewSection>
          <div className="flex items-center gap-3">
            <IconTile icon={DiscoveryIcon} />
            <SectionTitle>
              Discovery method{discoveryTool ? `: ${discoveryTool.label}` : ""}
            </SectionTitle>
          </div>

          {!discoveryTool && <EmptyHint text="No discovery method was chosen." />}

          {discoveryToolType === "reverse" && (
            <div className="grid gap-3 md:grid-cols-2">
              <WhitePanel>
                <p className="text-base font-semibold">Make it worse ({reverseIdeation.length})</p>
                {reverseIdeation.length > 0 ? (
                  <ul className="list-disc pl-5 text-base flex flex-col gap-0.5">
                    {reverseIdeation.map((item) => <li key={item.id}>{item.text}</li>)}
                  </ul>
                ) : (
                  <p className="text-base italic">No items captured.</p>
                )}
              </WhitePanel>
              <WhitePanel>
                <p className="text-base font-semibold">Inversions ({reverseInversion.length})</p>
                {reverseInversion.length > 0 ? (
                  <ul className="list-disc pl-5 text-base flex flex-col gap-0.5">
                    {reverseInversion.map((item) => <li key={item.id}>{item.text}</li>)}
                  </ul>
                ) : (
                  <p className="text-base italic">No inversions captured.</p>
                )}
              </WhitePanel>
            </div>
          )}

          {discoveryToolType === "analogy" && (
            <WhitePanel>
              <p className="text-base font-semibold">Domain</p>
              <p className="text-base">{analogyDomain || <span className="italic">Not set</span>}</p>
              <p className="text-base font-semibold mt-2">Insight</p>
              {analogyInsight ? (
                <p className="text-base whitespace-pre-wrap">{analogyInsight}</p>
              ) : (
                <p className="text-base italic">No insight captured.</p>
              )}
            </WhitePanel>
          )}

          <div className="mt-3">
            <SectionTitle>Candidates ({candidates.length})</SectionTitle>
          </div>
          {candidates.length === 0 ? (
            <EmptyHint text="No candidates in the bank for this problem yet. Go back to the Discover step to add some." />
          ) : (
            <>
              <p className="text-base text-white">
                {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"} in your solution bank for this problem. The badge shows which method produced each one.
              </p>
              <div className="flex flex-col gap-2">
                {candidates.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 rounded-lg bg-white p-3 text-foreground">
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-semibold">{c.title || <span className="italic">Untitled</span>}</p>
                        {c.inspirationSource && (
                          <Badge variant="outline" className="text-base font-normal">
                            {SOURCE_LABELS[c.inspirationSource] ?? c.inspirationSource}
                          </Badge>
                        )}
                      </div>
                      {c.description && <p className="text-base">{c.description}</p>}
                    </div>
                    <Button
                      variant="secondary-brand"
                      size="sm"
                      className="shrink-0"
                      onClick={() => router.push(`/solutions/${c.id}/validate/introduction`)}
                    >
                      Validate<ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </ReviewSection>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />Previous
            </Button>
          ) : <div />}
          <Button onClick={() => router.push("/solutions")} className="gap-2">
            Finish<ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
