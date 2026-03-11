"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { getProblemLabel } from "@/store/problems-model"
import { Gavel, CheckCircle2, XCircle, GitFork, Heart, BarChart2 } from "lucide-react"

function SummaryField({ value }: { value: string }) {
  return value ? (
    <p className="text-sm">{value}</p>
  ) : (
    <p className="text-sm text-muted-foreground italic">Not filled in</p>
  )
}

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    problemRef, problemId,
    alternatives, emotionalImpact,
    impacts, status, setStatus, reason, setReason, saveValidation,
  } = useProblemValidation()
  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  const problems = useSelector((state: RootState) => state.problems.problems)
  const problem = problems.find((p) => p.id === problemId)
  const selectedLabel = problem ? getProblemLabel(problem) : null

  const handleVerdict = (verdict: "valid" | "invalid") => {
    setStatus(verdict)
    saveValidation(verdict)
    router.push("/problem-validation")
  }

  const handleSave = () => {
    const effectiveStatus = status === "unvalidated" ? "in_progress" : status
    setStatus(effectiveStatus)
    saveValidation(effectiveStatus)
  }

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <Gavel className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Verdict</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Review your validation data and decide: is this problem worth solving?
        </p>

        {selectedLabel && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Problem</p>
            <p className="text-sm font-medium">{selectedLabel}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <GitFork className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm font-semibold">Alternatives</p>
            </div>
            {alternatives.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {alternatives.map((alt, i) => (
                  <li key={i} className="flex flex-col gap-0.5">
                    <div className="text-sm flex gap-2">
                      <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                      <span className="font-medium">{alt.text}</span>
                    </div>
                    {alt.shortcomings.length > 0 && (
                      <ul className="pl-4 flex flex-col gap-0.5">
                        {alt.shortcomings.map((sc, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex gap-1.5">
                            <span className="shrink-0">–</span>
                            <span>{sc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not filled in</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold">Emotional Impact</p>
              </div>
              <SummaryField value={emotionalImpact} />
            </div>
            <div className="rounded-lg border p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold">Quantifiable Impact</p>
              </div>
              {impacts.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {impacts.map((item, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="font-medium shrink-0">{item.category || "—"}</span>
                      <span className="text-muted-foreground">{item.description || "—"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not filled in</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Notes (optional)
          </p>
          <Textarea
            rows={3}
            placeholder="Add any notes about your decision..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="resize-none text-sm focus-visible:ring-1"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700"
            onClick={() => handleVerdict("valid")}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Valid — Worth Solving
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 border-red-300 hover:bg-red-50 hover:border-red-400 text-red-700"
            onClick={() => handleVerdict("invalid")}
          >
            <XCircle className="h-5 w-5 mr-2" />
            Invalid — Not Worth Solving
          </Button>
        </div>

        <div className="flex justify-between">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          <Button variant="ghost" onClick={handleSave}>Save Progress</Button>
        </div>
      </CardContent>
    </Card>
  )
}
