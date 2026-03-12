"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation, getAdjacentSteps } from "../context"
import type { DecisionLevel } from "@/types/idea"
import { cn } from "@/lib/utils"
import { ShieldCheck, CheckCircle2, XCircle, GitFork, Heart, BarChart2, Clock, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react"

const LEVELS: DecisionLevel[] = ["low", "medium", "high"]

function LevelToggle({
  value,
  onChange,
}: {
  value: DecisionLevel
  onChange: (v: DecisionLevel) => void
}) {
  return (
    <div className="flex rounded-md border overflow-hidden text-xs font-medium">
      {LEVELS.map((level, i) => (
        <button
          key={level}
          onClick={() => onChange(value === level ? "" : level)}
          className={cn(
            "flex-1 py-1.5 capitalize transition-colors",
            i < LEVELS.length - 1 && "border-r",
            value === level
              ? level === "low"
                ? "bg-green-100 text-green-800 border-green-200"
                : level === "medium"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-red-100 text-red-800 border-red-200"
              : "hover:bg-muted text-muted-foreground"
          )}
        >
          {level}
        </button>
      ))}
    </div>
  )
}

type Signal = { text: string; desc: string; icon: React.ReactNode; className: string }

function getSignal(time: DecisionLevel, cost: DecisionLevel, ret: DecisionLevel): Signal | null {
  if (!ret) return null
  const n = { "": 0, low: 1, medium: 2, high: 3 }
  const r = n[ret]
  const effort = Math.max(n[time], n[cost])

  if (r === 3 && effort <= 1)
    return { text: "Strong opportunity", desc: "High return with low effort — worth pursuing", icon: <TrendingUp className="h-4 w-4" />, className: "bg-green-50 border-green-200 text-green-800" }
  if (r === 3 && effort === 2)
    return { text: "Good opportunity", desc: "High return with manageable effort", icon: <TrendingUp className="h-4 w-4" />, className: "bg-green-50 border-green-200 text-green-800" }
  if (r === 3 && effort === 3)
    return { text: "High potential, high cost", desc: "Big return but significant investment required — consider carefully", icon: <Minus className="h-4 w-4" />, className: "bg-yellow-50 border-yellow-200 text-yellow-800" }
  if (r === 2 && effort <= 1)
    return { text: "Decent opportunity", desc: "Moderate return with low effort", icon: <TrendingUp className="h-4 w-4" />, className: "bg-green-50 border-green-200 text-green-800" }
  if (r === 2 && effort === 2)
    return { text: "Borderline case", desc: "Moderate return for moderate effort — validate further", icon: <Minus className="h-4 w-4" />, className: "bg-yellow-50 border-yellow-200 text-yellow-800" }
  if (r === 2 && effort === 3)
    return { text: "Questionable ROI", desc: "High effort for moderate return", icon: <TrendingDown className="h-4 w-4" />, className: "bg-orange-50 border-orange-200 text-orange-800" }
  if (r === 1)
    return { text: "Weak case", desc: "Low expected return may not justify the investment", icon: <TrendingDown className="h-4 w-4" />, className: "bg-red-50 border-red-200 text-red-800" }
  return null
}

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    problemRef, problemId,
    alternatives, emotionalImpact,
    quantifiableImpacts, status, setStatus, reason, setReason,
    timeLevel, setTimeLevel, costLevel, setCostLevel, returnLevel, setReturnLevel,
    saveValidation,
  } = useProblemValidation()
  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  const signal = getSignal(timeLevel, costLevel, returnLevel)

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
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Validate</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Weigh the economics of solving this problem — does the expected return justify the time and cost?
        </p>

        {problem && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
            {problem.description && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Problem Description</p>
                <p className="text-sm font-medium">{problem.description}</p>
              </div>
            )}
            {problem.customerSegments.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer Segments</p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.customerSegments.map((v) => <span key={v} className="rounded-md bg-background px-2 py-0.5 text-xs border">{v}</span>)}
                </div>
              </div>
            )}
            {problem.contexts.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Context</p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.contexts.map((v) => <span key={v} className="rounded-md bg-background px-2 py-0.5 text-xs border">{v}</span>)}
                </div>
              </div>
            )}
            {problem.jobsToBeDone.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jobs to Be Done</p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.jobsToBeDone.map((v) => <span key={v} className="rounded-md bg-background px-2 py-0.5 text-xs border">{v}</span>)}
                </div>
              </div>
            )}
            {problem.problemTypes.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Problem Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.problemTypes.map((v) => <span key={v} className="rounded-md bg-background px-2 py-0.5 text-xs border">{v}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Evidence summary */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <GitFork className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm font-semibold">Alternatives & shortcomings</p>
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
                <p className="text-sm font-semibold">Emotional impact</p>
              </div>
              {emotionalImpact.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {emotionalImpact.map((item, i) => (
                    <li key={i} className="text-sm flex gap-1.5">
                      <span className="text-muted-foreground shrink-0">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not filled in</p>
              )}
            </div>
            <div className="rounded-lg border p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold">Quantifiable impact</p>
              </div>
              {quantifiableImpacts.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {quantifiableImpacts.map((item, i) => (
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

        {/* Decision factors */}
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <p className="text-sm font-semibold">Decision factors</p>
          <p className="text-xs text-muted-foreground -mt-2">
            Rate each dimension to assess whether solving this problem makes economic sense.
          </p>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Time to solve</span>
              </div>
              <LevelToggle value={timeLevel} onChange={setTimeLevel} />
            </div>

            <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Cost to solve</span>
              </div>
              <LevelToggle value={costLevel} onChange={setCostLevel} />
            </div>

            <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Expected return</span>
              </div>
              <LevelToggle value={returnLevel} onChange={setReturnLevel} />
            </div>
          </div>

          {signal && (
            <div className={cn("flex items-start gap-2.5 rounded-md border px-3 py-2.5 mt-1", signal.className)}>
              {signal.icon}
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">{signal.text}</p>
                <p className="text-xs">{signal.desc}</p>
              </div>
            </div>
          )}
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
