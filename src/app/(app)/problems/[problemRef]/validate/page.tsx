"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { VALIDATE_CASE_STUDIES } from "./case-studies"
import type { DecisionLevel, ValidationMetric } from "@/types/idea"
import { cn } from "@/lib/utils"
import { ShieldCheck, CheckCircle2, XCircle, HelpCircle, Users, RefreshCw, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react"

const LEVELS: DecisionLevel[] = ["low", "medium", "high"]

function LevelToggle({
  value,
  onChange,
}: {
  value: DecisionLevel
  onChange: (v: DecisionLevel) => void
}) {
  return (
    <div className="flex rounded-md border border-white/30 overflow-hidden text-xs font-medium">
      {LEVELS.map((level, i) => (
        <button
          key={level}
          onClick={() => onChange(value === level ? "" : level)}
          className={cn(
            "flex-1 py-1.5 capitalize transition-colors",
            i < LEVELS.length - 1 && "border-r border-white/30",
            value === level
              ? "bg-white text-foreground"
              : "text-white/70 hover:bg-white/10"
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
          className="h-7 text-xs w-24 bg-white border-white text-foreground"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
        />
        <Input
          placeholder={unitPlaceholder}
          className="h-7 text-xs bg-white border-white text-foreground"
          value={localUnit}
          onChange={(e) => setLocalUnit(e.target.value)}
        />
      </div>
    </div>
  )
}

type Signal = { text: string; desc: string; icon: React.ReactNode; className: string }

function getSignal(people: DecisionLevel, frequency: DecisionLevel, worth: DecisionLevel): Signal | null {
  const n = { "": 0, low: 1, medium: 2, high: 3 }
  const filled = [people, frequency, worth].filter(Boolean).length
  if (filled === 0) return null
  const total = n[people] + n[frequency] + n[worth]

  if (total >= 8)
    return { text: "Strong opportunity", desc: "Large audience, frequent problem, high value — worth pursuing", icon: <TrendingUp className="h-4 w-4" />, className: "bg-green-50 border-green-200 text-green-800" }
  if (total >= 6)
    return { text: "Good opportunity", desc: "Solid combination of reach, frequency, and value", icon: <TrendingUp className="h-4 w-4" />, className: "bg-green-50 border-green-200 text-green-800" }
  if (total >= 4)
    return { text: "Moderate opportunity", desc: "Some factors are promising but others need more evidence", icon: <Minus className="h-4 w-4" />, className: "bg-yellow-50 border-yellow-200 text-yellow-800" }
  return { text: "Weak case", desc: "Low reach, frequency, or value — consider whether this is painful enough", icon: <TrendingDown className="h-4 w-4" />, className: "bg-red-50 border-red-200 text-red-800" }
}

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    problemRef,
    status, setStatus, reason, setReason,
    validationAssessment, setHowManyPeople, setHowOften, setWorthToThem,
  } = useProblemValidation()

  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  const { howManyPeople, howOften, worthToThem } = validationAssessment
  const signal = getSignal(howManyPeople.level, howOften.level, worthToThem.level)

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
    setStatus(status === verdict ? "in_progress" : verdict)
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={ShieldCheck}>Validate your problem</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-md text-muted-foreground">
          <p>
            Before committing to a problem, assess how big the opportunity really is.
            Three factors matter most:
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 shrink-0">
                <Users className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">How many people</strong> — how large is the audience experiencing this problem?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0">
                <RefreshCw className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">How often</strong> — how frequently do they encounter it?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shrink-0">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">How much is it worth</strong> — how much would they pay or benefit from a solution?</p>
            </div>
          </div>
          <h3 className="mt-4 text-xl font-bold text-foreground">What you&apos;ll do</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">1</span>
              <p><strong className="text-foreground">Rate each factor</strong> — set How many people, How often, and How much is it worth to Low, Medium, or High.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">2</span>
              <p><strong className="text-foreground">Add concrete numbers</strong> — optionally fill in estimates to back up your ratings.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">3</span>
              <p><strong className="text-foreground">Record your verdict</strong> — decide whether the problem is <strong className="text-foreground">Valid</strong>, <strong className="text-foreground">Unsure</strong>, or <strong className="text-foreground">Invalid</strong>.</p>
            </div>
          </div>
        </div>

        <hr className="border-border/40 my-4" />

        <h3 className="mb-2 text-xl font-bold text-center"><span className="text-primary">Your Turn:</span> Rate the opportunity</h3>

        <Tabs defaultValue="strategy" className="flex flex-col gap-4">
          <TabsList className="self-center">
            <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <div className="bg-primary rounded-xl p-8">
              <div className="flex flex-col gap-5">
                {/* Decision factors */}
                <div className="flex flex-col gap-4">
                  <p className="text-sm font-medium text-white">Decision Factors</p>

                  <div className="grid grid-cols-[1fr_2fr] items-start gap-3">
                    <div className="flex items-center gap-2 pt-1.5">
                      <Users className="h-3.5 w-3.5 text-white/70 shrink-0" />
                      <span className="text-md font-medium text-white">How many people</span>
                    </div>
                    <MetricInput
                      metric={howManyPeople}
                      onChange={setHowManyPeople}
                      valuePlaceholder="e.g. 10000"
                      unitPlaceholder="e.g. users"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_2fr] items-start gap-3">
                    <div className="flex items-center gap-2 pt-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-white/70 shrink-0" />
                      <span className="text-md font-medium text-white">How often</span>
                    </div>
                    <MetricInput
                      metric={howOften}
                      onChange={setHowOften}
                      valuePlaceholder="e.g. 5"
                      unitPlaceholder="e.g. times per week"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_2fr] items-start gap-3">
                    <div className="flex items-center gap-2 pt-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-white/70 shrink-0" />
                      <span className="text-md font-medium text-white">How much is it worth</span>
                    </div>
                    <MetricInput
                      metric={worthToThem}
                      onChange={setWorthToThem}
                      valuePlaceholder="e.g. 50"
                      unitPlaceholder="e.g. USD per month"
                    />
                  </div>
                </div>

                {signal && (
                  <div className={cn("flex items-start gap-2.5 rounded-md border px-3 py-2.5", signal.className)}>
                    {signal.icon}
                    <div className="flex flex-col gap-0.5">
                      <p className="text-md font-semibold">{signal.text}</p>
                      <p className="text-xs">{signal.desc}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/20">
                  <p className="text-sm font-medium text-white">Notes (optional)</p>
                  <Textarea
                    rows={3}
                    placeholder="Add any notes about your decision..."
                    value={localReason}
                    onChange={(e) => setLocalReason(e.target.value)}
                    className="resize-none text-md focus-visible:ring-1 bg-white border-white text-foreground"
                  />
                </div>

                {/* Verdict checkboxes */}
                <div className="flex flex-col gap-3 pt-2 border-t border-white/20">
                  <p className="text-sm font-medium text-white">Your verdict</p>
                  {([
                    { value: "valid" as const, label: "Valid — Worth Solving", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-700 border-green-300 bg-green-50" },
                    { value: "unsure" as const, label: "Unsure — May Be Worth Solving", icon: <HelpCircle className="h-4 w-4" />, color: "text-orange-700 border-orange-300 bg-orange-50" },
                    { value: "invalid" as const, label: "Invalid — Not Worth Solving", icon: <XCircle className="h-4 w-4" />, color: "text-red-700 border-red-300 bg-red-50" },
                  ]).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVerdict(option.value)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all",
                        status === option.value
                          ? option.color
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors",
                        status === option.value
                          ? option.value === "valid" ? "border-green-600 bg-green-600" : option.value === "unsure" ? "border-orange-500 bg-orange-500" : "border-red-500 bg-red-500"
                          : "border-white/50"
                      )}>
                        {status === option.value && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span className="text-md font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="case-studies">
            <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
              <p className="text-sm text-surface-foreground/70">
                See how successful companies assessed the opportunity behind their core problem — rating reach, frequency, and value to decide whether to pursue it.
              </p>
              {VALIDATE_CASE_STUDIES.map((cs) => (
                <div
                  key={cs.company}
                  className="rounded-lg border border-surface-foreground/10 bg-surface-foreground/10 p-4 flex flex-col gap-3"
                >
                  <p className="text-sm font-semibold text-surface-foreground">{cs.company}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">How Many People</span>
                      <p className="mt-0.5 text-surface-foreground/80">
                        <span className="inline-block rounded bg-surface-foreground/10 px-1.5 py-0.5 text-xs font-semibold text-surface-foreground mr-1">{cs.howManyPeople.level}</span>
                        {cs.howManyPeople.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">How Often</span>
                      <p className="mt-0.5 text-surface-foreground/80">
                        <span className="inline-block rounded bg-surface-foreground/10 px-1.5 py-0.5 text-xs font-semibold text-surface-foreground mr-1">{cs.howOften.level}</span>
                        {cs.howOften.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">How Much Is It Worth</span>
                      <p className="mt-0.5 text-surface-foreground/80">
                        <span className="inline-block rounded bg-surface-foreground/10 px-1.5 py-0.5 text-xs font-semibold text-surface-foreground mr-1">{cs.worthToThem.level}</span>
                        {cs.worthToThem.detail}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-surface-foreground/10 pt-3 mt-1">
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Verdict: {cs.verdict}</span>
                    <p className="mt-0.5 text-sm text-surface-foreground/80">{cs.reasoning}</p>
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
        </div>
      </CardContent>
    </Card>
  )
}
