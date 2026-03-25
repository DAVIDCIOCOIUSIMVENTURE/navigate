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
import type { ValidationMetric } from "@/types/idea"
import { cn } from "@/lib/utils"
import { ShieldCheck, CheckCircle2, XCircle, HelpCircle, Users, RefreshCw, DollarSign, ArrowRightLeft, Target, Building2 } from "lucide-react"

function HowManyInput({
  metric,
  onChange,
}: {
  metric: ValidationMetric
  onChange: (patch: Partial<ValidationMetric>) => void
}) {
  const [localValue, setLocalValue] = useState(metric.value !== null ? String(metric.value) : "")
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange })

  useEffect(() => {
    const parsed = localValue !== "" ? Number(localValue) : null
    if (parsed === metric.value) return
    const timer = setTimeout(() => onChangeRef.current({ value: parsed }), 600)
    return () => clearTimeout(timer)
  }, [localValue]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-white/70 shrink-0" />
        <span className="text-md font-medium text-white">How many customers</span>
      </div>
      <p className="text-sm text-white">Estimate the total number of people who experience this problem. Think about your target market segment and how widespread the issue is.</p>
      <Input
        type="number"
        placeholder="e.g. 10000"
        className="h-8 text-xs w-28 bg-white border-white text-foreground"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
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
    <div className="flex gap-2">
      <Input
        type="number"
        placeholder={valuePlaceholder}
        className="h-8 text-xs w-28 bg-white border-white text-foreground"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      <Input
        placeholder={unitPlaceholder}
        className="h-8 text-xs bg-white border-white text-foreground"
        value={localUnit}
        onChange={(e) => setLocalUnit(e.target.value)}
      />
    </div>
  )
}

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    problemRef,
    status, setStatus, reason, setReason,
    validationAssessment, setHowManyPeople, setHowOften, setWorthToThem, setCostOfSwitching,
    setSolutionEffectiveness, setCompetitorSize,
  } = useProblemValidation()

  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  const { howManyPeople, howOften, worthToThem, costOfSwitching, solutionEffectiveness, competitorSize } = validationAssessment

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
            Six factors matter most:
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 shrink-0">
                <Users className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">How many customers</strong>: how large is the audience experiencing this problem?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0">
                <RefreshCw className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">How often</strong>: how frequently do they encounter it?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shrink-0">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">How much is it worth</strong>: how much would they pay or benefit from a solution?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500 shrink-0">
                <ArrowRightLeft className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">Cost of switching</strong>: how much effort or cost does it take for customers to switch from their current solution?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 shrink-0">
                <Target className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">Solution effectiveness</strong>: how well do existing solutions already solve this problem?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 shrink-0">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <p><strong className="text-foreground">Competitor size</strong>: how big and established are the competitors already solving this problem?</p>
            </div>
          </div>
          <h3 className="mt-4 text-xl font-bold text-foreground">What you&apos;ll do</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">1</span>
              <p><strong className="text-foreground">Estimate each factor</strong>: enter numbers for each of the four factors to quantify the opportunity.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">2</span>
              <p><strong className="text-foreground">Record your verdict</strong>: decide whether the problem is <strong className="text-foreground">Valid</strong>, <strong className="text-foreground">Unsure</strong>, or <strong className="text-foreground">Invalid</strong>.</p>
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
                <div className="flex flex-col gap-5">
                  <p className="text-sm font-medium text-white">Decision Factors</p>

                  <HowManyInput metric={howManyPeople} onChange={setHowManyPeople} />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 text-white/70 shrink-0" />
                      <span className="text-md font-medium text-white">How often does the problem occur</span>
                    </div>
                    <p className="text-sm text-white">How frequently do customers encounter this problem? A problem that happens daily is far more urgent than one that occurs once a year.</p>
                    <MetricInput
                      metric={howOften}
                      onChange={setHowOften}
                      valuePlaceholder="e.g. 5"
                      unitPlaceholder="e.g. times per week"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-white/70 shrink-0" />
                      <span className="text-md font-medium text-white">How much is it worth</span>
                    </div>
                    <p className="text-sm text-white">What is the monetary value of solving this problem? Consider how much customers currently spend on workarounds, or how much time and money they lose because of it.</p>
                    <MetricInput
                      metric={worthToThem}
                      onChange={setWorthToThem}
                      valuePlaceholder="e.g. 50"
                      unitPlaceholder="e.g. USD per month"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-white/70 shrink-0" />
                      <span className="text-md font-medium text-white">What is the cost of switching</span>
                    </div>
                    <p className="text-sm text-white">How much effort, money, or disruption does it take for customers to move away from their current solution? High switching costs mean customers are more locked in, so your solution needs to offer a compelling reason to change.</p>
                    <div className="flex gap-2 flex-wrap">
                      {(["none", "low", "medium", "high", "prohibitive"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setCostOfSwitching({ level: costOfSwitching.level === level ? "" : level })}
                          className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                            costOfSwitching.level === level
                              ? level === "none" ? "bg-emerald-500 text-white" : level === "low" ? "bg-green-500 text-white" : level === "medium" ? "bg-amber-500 text-white" : level === "high" ? "bg-red-500 text-white" : "bg-red-700 text-white"
                              : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-white/70 shrink-0" />
                      <span className="text-md font-medium text-white">How effective are existing solutions</span>
                    </div>
                    <p className="text-sm text-white">How well do current solutions already address this problem? If existing solutions work well, customers have less incentive to switch. If they are poor, there is a bigger gap for you to fill.</p>
                    <div className="flex gap-2 flex-wrap">
                      {(["terrible", "poor", "average", "good", "excellent"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setSolutionEffectiveness({ level: solutionEffectiveness.level === level ? "" : level })}
                          className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                            solutionEffectiveness.level === level
                              ? level === "terrible" ? "bg-green-600 text-white" : level === "poor" ? "bg-green-500 text-white" : level === "average" ? "bg-amber-500 text-white" : level === "good" ? "bg-red-500 text-white" : "bg-red-700 text-white"
                              : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-white/70 shrink-0" />
                      <span className="text-md font-medium text-white">How big are the competitors</span>
                    </div>
                    <p className="text-sm text-white">How large and established are the companies already solving this problem? Competing against well-funded incumbents requires a strong differentiator, while a market with only small players may signal an easier entry.</p>
                    <div className="flex gap-2 flex-wrap">
                      {(["micro", "small", "medium", "large", "giant"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setCompetitorSize({ level: competitorSize.level === level ? "" : level })}
                          className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                            competitorSize.level === level
                              ? level === "micro" ? "bg-emerald-500 text-white" : level === "small" ? "bg-green-500 text-white" : level === "medium" ? "bg-amber-500 text-white" : level === "large" ? "bg-red-500 text-white" : "bg-red-700 text-white"
                              : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

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
                    { value: "valid" as const, label: "Valid: Worth Solving", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-700 border-green-300 bg-green-50" },
                    { value: "unsure" as const, label: "Unsure: May Be Worth Solving", icon: <HelpCircle className="h-4 w-4" />, color: "text-orange-700 border-orange-300 bg-orange-50" },
                    { value: "invalid" as const, label: "Invalid: Not Worth Solving", icon: <XCircle className="h-4 w-4" />, color: "text-red-700 border-red-300 bg-red-50" },
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
              <p className="text-sm text-white">
                See how successful companies quantified the opportunity behind their core problem, estimating reach, frequency, value, and switching cost to decide whether to pursue it.
              </p>
              {VALIDATE_CASE_STUDIES.map((cs) => (
                <div
                  key={cs.company}
                  className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-3"
                >
                  <p className="text-sm font-semibold text-white">{cs.company}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs font-medium text-white uppercase tracking-wide">How Many Customers</span>
                      <p className="mt-0.5 text-white">
                        <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-xs font-semibold text-white mr-1">{cs.howManyPeople.value.toLocaleString()}</span>
                        {cs.howManyPeople.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white uppercase tracking-wide">How Often</span>
                      <p className="mt-0.5 text-white">
                        <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-xs font-semibold text-white mr-1">{cs.howOften.value} {cs.howOften.unit}</span>
                        {cs.howOften.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white uppercase tracking-wide">How Much Is It Worth</span>
                      <p className="mt-0.5 text-white">
                        <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-xs font-semibold text-white mr-1">{cs.worthToThem.value} {cs.worthToThem.unit}</span>
                        {cs.worthToThem.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white uppercase tracking-wide">Cost of Switching</span>
                      <p className="mt-0.5 text-white">
                        <span className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-xs font-semibold text-white mr-1 capitalize",
                          cs.costOfSwitching.level === "none" ? "bg-emerald-500/30" : cs.costOfSwitching.level === "low" ? "bg-green-500/30" : cs.costOfSwitching.level === "medium" ? "bg-amber-500/30" : cs.costOfSwitching.level === "high" ? "bg-red-500/30" : "bg-red-700/30"
                        )}>{cs.costOfSwitching.level}</span>
                        {cs.costOfSwitching.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white uppercase tracking-wide">Solution Effectiveness</span>
                      <p className="mt-0.5 text-white">
                        <span className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-xs font-semibold text-white mr-1 capitalize",
                          cs.solutionEffectiveness.level === "terrible" || cs.solutionEffectiveness.level === "poor" ? "bg-green-500/30" : cs.solutionEffectiveness.level === "average" ? "bg-amber-500/30" : "bg-red-500/30"
                        )}>{cs.solutionEffectiveness.level}</span>
                        {cs.solutionEffectiveness.detail}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white uppercase tracking-wide">Competitor Size</span>
                      <p className="mt-0.5 text-white">
                        <span className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-xs font-semibold text-white mr-1 capitalize",
                          cs.competitorSize.level === "micro" ? "bg-emerald-500/30" : cs.competitorSize.level === "small" ? "bg-green-500/30" : cs.competitorSize.level === "medium" ? "bg-amber-500/30" : cs.competitorSize.level === "large" ? "bg-red-500/30" : "bg-red-700/30"
                        )}>{cs.competitorSize.level}</span>
                        {cs.competitorSize.detail}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-1">
                    <span className="text-xs font-medium text-white uppercase tracking-wide">Verdict: {cs.verdict}</span>
                    <p className="mt-0.5 text-sm text-white">{cs.reasoning}</p>
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
