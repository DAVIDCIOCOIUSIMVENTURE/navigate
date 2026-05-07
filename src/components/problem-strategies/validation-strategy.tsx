"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProblem } from "@/app/(app)/problems/[problemRef]/validation/context"
import type { ValidationMetric } from "@/types/validation"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, HelpCircle, Users, RefreshCw, DollarSign, ArrowRightLeft, Target, Building2 } from "lucide-react"

const FREQUENCY_OPTIONS = [
  "per hour", "per day", "per week", "per fortnight",
  "per month", "per quarter", "per year",
]

const CURRENCY_OPTIONS = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF",
  "CNY", "INR", "BRL", "KRW", "SEK", "NOK", "DKK",
  "NZD", "SGD", "HKD", "MXN", "ZAR", "PLN",
]

function HowManyInput({
  metric,
  onChange,
  readOnly,
}: {
  metric: ValidationMetric
  onChange: (patch: Partial<ValidationMetric>) => void
  readOnly?: boolean
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
        <Users className="h-3.5 w-3.5 text-white shrink-0" />
        <span className="text-base font-semibold text-white">How many customers</span>
      </div>
      {!readOnly && (
        <p className="text-base text-white">Estimate the total number of people who experience this problem. Think about your target market segment and how widespread the issue is.</p>
      )}
      <Input
        type="number"
        placeholder="e.g. 10000"
        className="mt-2 h-8 text-base w-28 bg-white border-white text-foreground read-only:cursor-default"
        value={readOnly ? (metric.value ?? "") : localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        readOnly={readOnly}
      />
    </div>
  )
}

function FrequencyInput({
  metric,
  onChange,
  readOnly,
}: {
  metric: ValidationMetric
  onChange: (patch: Partial<ValidationMetric>) => void
  readOnly?: boolean
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
    <div className="mt-2 flex gap-2">
      <Input
        type="number"
        placeholder="e.g. 5"
        className="h-8 text-base w-28 bg-white border-white text-foreground read-only:cursor-default"
        value={readOnly ? (metric.value ?? "") : localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        readOnly={readOnly}
      />
      <Select value={metric.unit || "per day"} onValueChange={(val) => onChange({ unit: val })} disabled={readOnly}>
        <SelectTrigger className="h-8 text-base w-40 bg-white border-white text-foreground">
          <SelectValue placeholder="Frequency" />
        </SelectTrigger>
        <SelectContent>
          {FREQUENCY_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function CurrencyInput({
  metric,
  onChange,
  readOnly,
}: {
  metric: ValidationMetric
  onChange: (patch: Partial<ValidationMetric>) => void
  readOnly?: boolean
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
    <div className="mt-2 flex gap-2">
      <Input
        type="number"
        placeholder="e.g. 50"
        className="h-8 text-base w-28 bg-white border-white text-foreground read-only:cursor-default"
        value={readOnly ? (metric.value ?? "") : localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        readOnly={readOnly}
      />
      <Select value={metric.unit || "GBP"} onValueChange={(val) => onChange({ unit: val })} disabled={readOnly}>
        <SelectTrigger className="h-8 text-base w-28 bg-white border-white text-foreground">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCY_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ValidationStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    status, setStatus, reason, setReason,
    validationAssessment, setHowManyPeople, setHowOften, setWorthToThem, setCostOfSwitching,
    setSolutionEffectiveness, setCompetitorSize,
  } = useProblem()

  const { howManyPeople, howOften, worthToThem, costOfSwitching, solutionEffectiveness, competitorSize } = validationAssessment

  const [localReason, setLocalReason] = useState(reason)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
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

  const hasAnyMetric = [howManyPeople, howOften, worthToThem, costOfSwitching, solutionEffectiveness, competitorSize]
    .some((m) => m.value !== null || m.level !== "")
  const hasVerdict = status === "valid" || status === "unsure" || status === "invalid"

  if (readOnly && !hasAnyMetric && !reason.trim() && !hasVerdict) {
    return (
      <div className="bg-primary rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No validation assessment captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-6">
          <p className="text-base font-medium text-white">Decision Factors</p>

          <HowManyInput metric={howManyPeople} onChange={setHowManyPeople} readOnly={readOnly} />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-white shrink-0" />
              <span className="text-base font-semibold text-white">How often does the problem occur</span>
            </div>
            {!readOnly && (
              <p className="text-base text-white">How frequently do customers encounter this problem? A problem that happens daily is far more urgent than one that occurs once a year.</p>
            )}
            <FrequencyInput metric={howOften} onChange={setHowOften} readOnly={readOnly} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-white shrink-0" />
              <span className="text-base font-semibold text-white">How much is it worth</span>
            </div>
            {!readOnly && (
              <p className="text-base text-white">What is the monetary value of solving this problem? Consider how much customers currently spend on workarounds, or how much time and money they lose because of it.</p>
            )}
            <CurrencyInput metric={worthToThem} onChange={setWorthToThem} readOnly={readOnly} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5 text-white shrink-0" />
              <span className="text-base font-semibold text-white">What is the cost of switching</span>
            </div>
            {!readOnly && (
              <p className="text-base text-white">How much effort, money, or disruption does it take for customers to move away from their current solution? High switching costs mean customers are more locked in, so your solution needs to offer a compelling reason to change.</p>
            )}
            <div className="mt-2 inline-flex w-fit rounded-xl bg-white/10 p-1.5">
              <ToggleGroup
                className="border-none"
                type="single"
                value={costOfSwitching.level}
                onValueChange={(val) => setCostOfSwitching({ level: val as typeof costOfSwitching.level })}
                disabled={readOnly}
              >
                {(["none", "low", "medium", "high", "prohibitive"] as const).map((level) => (
                  <ToggleGroupItem
                    key={level}
                    value={level}
                    className="px-4 py-1.5 text-base font-medium capitalize bg-transparent text-white/70 data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-md hover:bg-white/10 hover:text-white rounded-md border-none"
                  >
                    {level}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-white shrink-0" />
              <span className="text-base font-semibold text-white">How effective are existing solutions</span>
            </div>
            {!readOnly && (
              <p className="text-base text-white">How well do current solutions already address this problem? If existing solutions work well, customers have less incentive to switch. If they are poor, there is a bigger gap for you to fill.</p>
            )}
            <div className="mt-2 inline-flex w-fit rounded-xl bg-white/10 p-1.5">
              <ToggleGroup
                className="border-none"
                type="single"
                value={solutionEffectiveness.level}
                onValueChange={(val) => setSolutionEffectiveness({ level: val as typeof solutionEffectiveness.level })}
                disabled={readOnly}
              >
                {(["terrible", "poor", "average", "good", "excellent"] as const).map((level) => (
                  <ToggleGroupItem
                    key={level}
                    value={level}
                    className="px-4 py-1.5 text-base font-medium capitalize bg-transparent text-white/70 data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-md hover:bg-white/10 hover:text-white rounded-md border-none"
                  >
                    {level}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-white shrink-0" />
              <span className="text-base font-semibold text-white">How big are the competitors</span>
            </div>
            {!readOnly && (
              <p className="text-base text-white">How large and established are the companies already solving this problem? Competing against well-funded incumbents requires a strong differentiator, while a market with only small players may signal an easier entry.</p>
            )}
            <div className="mt-2 inline-flex w-fit rounded-xl bg-white/10 p-1.5">
              <ToggleGroup
                className="border-none"
                type="single"
                value={competitorSize.level}
                onValueChange={(val) => setCompetitorSize({ level: val as typeof competitorSize.level })}
                disabled={readOnly}
              >
                {(["micro", "small", "medium", "large", "giant"] as const).map((level) => (
                  <ToggleGroupItem
                    key={level}
                    value={level}
                    className="px-4 py-1.5 text-base font-medium capitalize bg-transparent text-white/70 data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-md hover:bg-white/10 hover:text-white rounded-md border-none"
                  >
                    {level}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </div>

        {(!readOnly || reason) && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/20">
            <p className="text-base font-medium text-white">Notes{!readOnly && " (optional)"}</p>
            <Textarea
              rows={3}
              placeholder="Add any notes about your decision..."
              value={readOnly ? reason : localReason}
              onChange={(e) => setLocalReason(e.target.value)}
              readOnly={readOnly}
              className="resize-none text-base focus-visible:ring-1 bg-white border-white text-foreground read-only:cursor-default"
            />
          </div>
        )}

        {(!readOnly || (mounted && (status === "valid" || status === "unsure" || status === "invalid"))) && (
        <div className="flex flex-col gap-3 pt-2 border-t border-white/20">
          <p className="text-base font-medium text-white">Your verdict</p>
          {([
            { value: "valid" as const, label: "Valid: Worth Solving", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-700 border-green-300 bg-green-50" },
            { value: "unsure" as const, label: "Unsure: May Be Worth Solving", icon: <HelpCircle className="h-4 w-4" />, color: "text-orange-700 border-orange-300 bg-orange-50" },
            { value: "invalid" as const, label: "Invalid: Not Worth Solving", icon: <XCircle className="h-4 w-4" />, color: "text-red-700 border-red-300 bg-red-50" },
          ]).filter((option) => !readOnly || (mounted && status === option.value)).map((option) => (
            <button
              key={option.value}
              onClick={() => { if (!readOnly) handleVerdict(option.value) }}
              disabled={readOnly}
              className={cn(
                "flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all",
                readOnly && "cursor-default",
                mounted && status === option.value
                  ? option.color
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors",
                mounted && status === option.value
                  ? option.value === "valid" ? "border-green-600 bg-green-600" : option.value === "unsure" ? "border-orange-500 bg-orange-500" : "border-red-500 bg-red-500"
                  : "border-white/50"
              )}>
                {mounted && status === option.value && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-2">
                {option.icon}
                <span className="text-base font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}
