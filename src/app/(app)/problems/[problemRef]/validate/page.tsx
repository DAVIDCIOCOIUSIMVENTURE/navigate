"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import type { DecisionLevel, ValidationMetric } from "@/types/idea"
import { cn } from "@/lib/utils"
import { ShieldCheck, CheckCircle2, XCircle, HelpCircle, GitFork, Heart, BarChart2, Clock, DollarSign, TrendingUp, TrendingDown, Minus, Globe } from "lucide-react"

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

function MetricInput({
  metric,
  onChange,
  valuePlaceholder,
  unitPlaceholder,
}: {
  metric: ValidationMetric
  onChange: (patch: Partial<ValidationMetric>) => void
  valuePlaceholder: string
  unitPlaceholder: string
}) {
  const [localValue, setLocalValue] = useState(metric.value !== null ? String(metric.value) : "")
  const [localUnit, setLocalUnit] = useState(metric.unit)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange })

  useEffect(() => {
    const parsed = localValue !== "" ? Number(localValue) : null
    if (parsed === metric.value) return
    const timer = setTimeout(() => onChangeRef.current({ value: parsed }), 600)
    return () => clearTimeout(timer)
  }, [localValue]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (localUnit === metric.unit) return
    const timer = setTimeout(() => onChangeRef.current({ unit: localUnit }), 600)
    return () => clearTimeout(timer)
  }, [localUnit]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-1.5">
      <LevelToggle value={metric.level} onChange={(l) => onChange({ level: l })} />
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder={valuePlaceholder}
          className="h-7 text-xs w-24"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
        />
        <Input
          placeholder={unitPlaceholder}
          className="h-7 text-xs"
          value={localUnit}
          onChange={(e) => setLocalUnit(e.target.value)}
        />
      </div>
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
  const {
    problemRef, problemId,
    existingSolutions, emotionalImpact,
    status, setStatus, reason, setReason,
    validationAssessment, setTimeToSolve, setCostToSolve, setExpectedReturn, setMarketSize,
  } = useProblemValidation()

  const quantifiableImpacts = existingSolutions.flatMap((alt) => alt.impacts ?? []).filter((imp) => imp.category || imp.description)
  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  const { timeToSolve, costToSolve, expectedReturn, marketSize } = validationAssessment
  const signal = getSignal(timeToSolve.level, costToSolve.level, expectedReturn.level, marketSize.level)

  const [localReason, setLocalReason] = useState(reason)
  const statusRef = useRef(status)
  useEffect(() => { statusRef.current = status })

  useEffect(() => {
    if (localReason === reason) return
    const timer = setTimeout(() => {
      setReason(localReason)
      if (statusRef.current === "unvalidated") setStatus("in_progress")
    }, 600)
    return () => clearTimeout(timer)
  }, [localReason]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerdict = (verdict: "valid" | "invalid" | "unsure") => {
    setStatus(verdict)
    router.push("/problems")
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardTitle icon={ShieldCheck} className="text-lg">Validate</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            You&apos;ve gathered the evidence — now make a call. Review the work you&apos;ve done across
            the previous steps, then rate the four decision factors below to see whether solving this problem
            makes economic sense.
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li><strong className="text-foreground">Time to solve</strong> — how long it would realistically take to build and ship a solution</li>
            <li><strong className="text-foreground">Cost to solve</strong> — the total investment required (people, tools, infrastructure)</li>
            <li><strong className="text-foreground">Expected return</strong> — the revenue, savings, or value you expect the solution to generate</li>
            <li><strong className="text-foreground">Market size</strong> — how many people or businesses face this problem and could pay for a solution</li>
          </ul>
          <p>
            Rate each factor <strong className="text-foreground">Low / Medium / High</strong> and optionally fill in
            concrete numbers. The signal below will update automatically as you rate. When you&apos;re ready,
            record your verdict — <strong className="text-foreground">Valid</strong> means you&apos;re confident
            the problem is worth solving, <strong className="text-foreground">Unsure</strong> means you need more
            evidence, and <strong className="text-foreground">Invalid</strong> means you&apos;re moving on.
          </p>
        </div>

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
            <div className="grid grid-cols-[1fr_2fr] items-start gap-3">
              <div className="flex items-center gap-2 pt-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Time to solve</span>
              </div>
              <MetricInput
                metric={timeToSolve}
                onChange={setTimeToSolve}
                valuePlaceholder="e.g. 3"
                unitPlaceholder="e.g. months"
              />
            </div>

            <div className="grid grid-cols-[1fr_2fr] items-start gap-3">
              <div className="flex items-center gap-2 pt-1.5">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Cost to solve</span>
              </div>
              <MetricInput
                metric={costToSolve}
                onChange={setCostToSolve}
                valuePlaceholder="e.g. 50000"
                unitPlaceholder="e.g. USD"
              />
            </div>

            <div className="grid grid-cols-[1fr_2fr] items-start gap-3">
              <div className="flex items-center gap-2 pt-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Expected return</span>
              </div>
              <MetricInput
                metric={expectedReturn}
                onChange={setExpectedReturn}
                valuePlaceholder="e.g. 200"
                unitPlaceholder="e.g. %"
              />
            </div>

            <div className="grid grid-cols-[1fr_2fr] items-start gap-3">
              <div className="flex items-center gap-2 pt-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Market size</span>
              </div>
              <MetricInput
                metric={marketSize}
                onChange={setMarketSize}
                valuePlaceholder="e.g. 500"
                unitPlaceholder="e.g. M USD"
              />
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
            value={localReason}
            onChange={(e) => setLocalReason(e.target.value)}
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
            className="flex-1 h-12 border-orange-300 hover:bg-orange-50 hover:border-orange-400 text-orange-700"
            onClick={() => handleVerdict("unsure")}
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            Unsure — May Be Worth Solving
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

        {prevPath && (
          <div>
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
