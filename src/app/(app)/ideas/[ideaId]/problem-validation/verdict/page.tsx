"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { useIdeas } from "@/store/ideas-hooks"
import type { DecisionLevel } from "@/types/idea"
import { cn } from "@/lib/utils"
import { Gavel, CheckCircle2, XCircle, GitFork, Heart, BarChart2, Clock, DollarSign, TrendingUp, TrendingDown, Minus, Globe } from "lucide-react"

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
              ? "bg-white text-foreground"
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

function getSignal(time: DecisionLevel, cost: DecisionLevel, ret: DecisionLevel, mktSize: DecisionLevel): Signal | null {
  if (!ret) return null
  const n = { "": 0, low: 1, medium: 2, high: 3 }
  const r = n[ret]
  const effort = Math.max(n[time], n[cost])
  // Market size boosts or dampens the signal: high market = +1, low = -1, unset = 0
  const mktBoost = mktSize === "high" ? 1 : mktSize === "low" ? -1 : 0
  const opportunity = Math.min(3, Math.max(1, r + mktBoost))

  if (opportunity >= 3 && effort <= 1)
    return { text: "Strong opportunity", desc: "High return with low effort — worth pursuing", icon: <TrendingUp className="h-4 w-4" />, className: "bg-green-50 border-green-200 text-green-800" }
  if (opportunity >= 3 && effort === 2)
    return { text: "Good opportunity", desc: "High return with manageable effort", icon: <TrendingUp className="h-4 w-4" />, className: "bg-green-50 border-green-200 text-green-800" }
  if (opportunity >= 3 && effort === 3)
    return { text: "High potential, high cost", desc: "Big return but significant investment required — consider carefully", icon: <Minus className="h-4 w-4" />, className: "bg-yellow-50 border-yellow-200 text-yellow-800" }
  if (opportunity === 2 && effort <= 1)
    return { text: "Decent opportunity", desc: "Moderate return with low effort", icon: <TrendingUp className="h-4 w-4" />, className: "bg-green-50 border-green-200 text-green-800" }
  if (opportunity === 2 && effort === 2)
    return { text: "Borderline case", desc: "Moderate return for moderate effort — validate further", icon: <Minus className="h-4 w-4" />, className: "bg-yellow-50 border-yellow-200 text-yellow-800" }
  if (opportunity === 2 && effort === 3)
    return { text: "Questionable ROI", desc: "High effort for moderate return", icon: <TrendingDown className="h-4 w-4" />, className: "bg-orange-50 border-orange-200 text-orange-800" }
  if (opportunity === 1)
    return { text: "Weak case", desc: "Low expected return may not justify the investment", icon: <TrendingDown className="h-4 w-4" />, className: "bg-red-50 border-red-200 text-red-800" }
  return null
}

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { prevPath } = getAdjacentSteps(pathname, ideaId)
  const {
    selectedProblemId, existingSolutions, emotionalImpact,
    impacts, status, setStatus, reason, setReason,
    timeLevel, setTimeLevel, costLevel, setCostLevel, returnLevel, setReturnLevel, marketLevel, setMarketLevel,
    saveValidation,
  } = useProblemValidation()
  const { getIdea, updateIdea } = useIdeas()

  const idea = getIdea(ideaId)
  const allProblems = idea?.jobs.flatMap((j) => j.problems) ?? []
  const selectedProblem = allProblems.find((p) => p.id === selectedProblemId)

  const signal = getSignal(timeLevel, costLevel, returnLevel, marketLevel)

  const handleVerdict = (verdict: "valid" | "invalid") => {
    setStatus(verdict)
    saveValidation(verdict)
    const filledProblems = allProblems.filter((p) => p.text.trim())
    const allDecided =
      filledProblems.length > 0 &&
      filledProblems.every(
        (p) =>
          p.id === selectedProblemId
            ? verdict === "valid" || verdict === "invalid"
            : p.validationStatus === "valid" || p.validationStatus === "invalid"
      )
    if (allDecided) {
      updateIdea(ideaId, { problemValidationComplete: true })
    }
    router.push(`/ideas/${ideaId}/problem-validation/pick-a-problem`)
  }

  const handleSave = () => {
    const effectiveStatus = status === "unvalidated" ? "in_progress" : status
    setStatus(effectiveStatus)
    saveValidation(effectiveStatus)
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={Gavel}>Problem Validation</CardEyebrow>
        <CardTitle icon={Gavel} className="text-lg">Verdict</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Weigh the economics of solving this problem — does the expected return justify the time and cost?
        </p>

        {selectedProblem && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Problem</p>
            <p className="text-sm font-medium">{selectedProblem.text}</p>
          </div>
        )}

        {/* Evidence summary */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <GitFork className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm font-semibold">Existing solutions & shortcomings</p>
            </div>
            {existingSolutions.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {existingSolutions.map((alt, i) => (
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
              {emotionalImpact ? (
                <p className="text-sm">{emotionalImpact}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not filled in</p>
              )}
            </div>
            <div className="rounded-lg border p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold">Quantifiable impact</p>
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

            <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Market size</span>
              </div>
              <LevelToggle value={marketLevel} onChange={setMarketLevel} />
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
