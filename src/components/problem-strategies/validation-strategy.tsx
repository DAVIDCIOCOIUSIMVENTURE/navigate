"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useProblem } from "@/app/(app)/problems/[problemRef]/validation/context"
import type { ValidationMetric } from "@/types/validation"
import { DEFAULT_OBTAINABLE_SHARE } from "@/types/validation"
import { cn } from "@/lib/utils"
import {
  CheckCircle2, XCircle, HelpCircle, Users, RefreshCw, DollarSign, ArrowRightLeft, Target, Building2,
  Calculator, AlertTriangle, PieChart,
} from "lucide-react"

const FREQUENCY_OPTIONS = [
  "per hour", "per day", "per week", "per fortnight",
  "per month", "per quarter", "per year",
]

const FREQUENCY_ANNUAL_FACTOR: Record<string, number> = {
  "per hour": 8760,
  "per day": 365,
  "per week": 52,
  "per fortnight": 26,
  "per month": 12,
  "per quarter": 4,
  "per year": 1,
}

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

function ObtainableShareInput({
  value,
  onChange,
  readOnly,
}: {
  value: number
  onChange: (val: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <PieChart className="h-3.5 w-3.5 text-white shrink-0" />
        <span className="text-base font-semibold text-white">Realistic share of the market you can capture</span>
      </div>
      {!readOnly && (
        <p className="text-base text-white">Even a strong product rarely wins the whole market. Pick the slice you can realistically reach in the first few years: a focused niche entrant typically captures 1 to 5 percent, a strong differentiated play 5 to 20 percent, and a dominant winner 20 to 40 percent.</p>
      )}
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Slider
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            min={0}
            max={100}
            step={1}
            disabled={readOnly}
            className="max-w-md"
          />
          <span className="text-base font-semibold text-white w-14 text-right">{value}%</span>
        </div>
        {!readOnly && (
          <p className="text-sm text-white/70">A higher percentage means you expect to win more of the addressable market. Be conservative: most early-stage ventures land in the 5 to 15 percent range.</p>
        )}
      </div>
    </div>
  )
}

function WorthSection({
  worthToThem,
  obtainableShare,
  setWorthToThem,
  setObtainableShare,
  readOnly,
}: {
  worthToThem: ValidationMetric
  obtainableShare: number
  setWorthToThem: (patch: Partial<ValidationMetric>) => void
  setObtainableShare: (val: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-white shrink-0" />
          <span className="text-base font-semibold text-white">How much is it worth per occurrence</span>
        </div>
        {!readOnly && (
          <p className="text-base text-white">What is the monetary value of solving this problem each time it happens? Think about what customers already spend on workarounds, or the time and money they lose by leaving the problem unaddressed.</p>
        )}
        <CurrencyInput metric={worthToThem} onChange={setWorthToThem} readOnly={readOnly} />
      </div>

      <ObtainableShareInput value={obtainableShare} onChange={setObtainableShare} readOnly={readOnly} />
    </div>
  )
}

function MarketSection({
  howManyPeople,
  howOften,
  setHowManyPeople,
  setHowOften,
  readOnly,
}: {
  howManyPeople: ValidationMetric
  howOften: ValidationMetric
  setHowManyPeople: (patch: Partial<ValidationMetric>) => void
  setHowOften: (patch: Partial<ValidationMetric>) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
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
    </div>
  )
}

function CompetitionSection({
  costOfSwitching,
  solutionEffectiveness,
  competitorSize,
  setCostOfSwitching,
  setSolutionEffectiveness,
  setCompetitorSize,
  readOnly,
}: {
  costOfSwitching: ValidationMetric
  solutionEffectiveness: ValidationMetric
  competitorSize: ValidationMetric
  setCostOfSwitching: (patch: Partial<ValidationMetric>) => void
  setSolutionEffectiveness: (patch: Partial<ValidationMetric>) => void
  setCompetitorSize: (patch: Partial<ValidationMetric>) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
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
  )
}

function NotesSection({
  reason,
  setReason,
  setStatus,
  status,
  readOnly,
}: {
  reason: string
  setReason: (val: string) => void
  setStatus: (val: "in_progress") => void
  status: "unvalidated" | "in_progress" | "valid" | "invalid" | "unsure"
  readOnly?: boolean
}) {
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

  if (readOnly && !reason) return null

  return (
    <div className="flex flex-col gap-2">
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
  )
}

function VerdictButtons({
  status,
  setStatus,
  readOnly,
}: {
  status: "unvalidated" | "in_progress" | "valid" | "invalid" | "unsure"
  setStatus: (val: "unvalidated" | "in_progress" | "valid" | "invalid" | "unsure") => void
  readOnly?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const handleVerdict = (verdict: "valid" | "invalid" | "unsure") => {
    setStatus(status === verdict ? "in_progress" : verdict)
  }

  const hasVerdict = status === "valid" || status === "unsure" || status === "invalid"
  if (readOnly && !(mounted && hasVerdict)) return null

  return (
    <div className="flex flex-col gap-3">
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
  )
}

function formatNumber(value: number, opts: { currency?: string } = {}) {
  if (!Number.isFinite(value)) return "0"
  if (opts.currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: opts.currency,
        maximumFractionDigits: 0,
      }).format(value)
    } catch {
      return `${opts.currency} ${Math.round(value).toLocaleString()}`
    }
  }
  return Math.round(value).toLocaleString()
}

function TamCalculation({
  howManyPeople,
  howOften,
  worthToThem,
  obtainableShare,
  readOnly,
}: {
  howManyPeople: ValidationMetric
  howOften: ValidationMetric
  worthToThem: ValidationMetric
  obtainableShare: number
  readOnly?: boolean
}) {
  const customers = howManyPeople.value ?? 0
  const frequency = howOften.value ?? 0
  const cost = worthToThem.value ?? 0
  const unit = howOften.unit || "per day"
  const factor = FREQUENCY_ANNUAL_FACTOR[unit] ?? 365
  const currency = worthToThem.unit || "GBP"
  const sharePct = Math.max(0, Math.min(100, obtainableShare))
  const shareFactor = sharePct / 100

  const grossMarket = customers * frequency * cost * factor
  const tam = grossMarket * shareFactor
  const ready = customers > 0 && frequency > 0 && cost > 0

  if (readOnly && !ready) return null

  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-white shrink-0" />
        <span className="text-base font-semibold text-white">Total addressable market</span>
      </div>
      {!readOnly && (
        <p className="text-base text-white/80">
          Multiplying customers, frequency, value, and an annualisation factor gives the gross opportunity. Applying your realistic share narrows that down to what you could plausibly capture. Treat the result as a sanity check, not a precise number.
        </p>
      )}
      <div className="rounded-lg bg-primary/40 border border-white/20 p-4 flex flex-col gap-2 text-base text-white">
        <div className="font-mono text-sm">customers × frequency × value × factor × share</div>
        <div className="font-mono text-sm">
          {formatNumber(customers)} × {frequency || 0} × {formatNumber(cost, { currency })} × {factor} × {sharePct}%
        </div>
        <div className="text-xl font-bold">
          {ready ? formatNumber(tam, { currency }) : "Fill in the three inputs above to see your estimate"}
          {ready && <span className="ml-2 text-base font-normal text-white/80">per year</span>}
        </div>
        {ready && (
          <div className="text-sm text-white/70">
            Gross market: {formatNumber(grossMarket, { currency })} per year, before applying your {sharePct}% realistic share.
          </div>
        )}
        <div className="text-sm text-white/70">
          factor = {factor} (converts &quot;{unit}&quot; into a yearly total); share = {sharePct}% of the gross market.
        </div>
      </div>
    </div>
  )
}

export function WorthStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    validationAssessment, setWorthToThem, setObtainableShare,
  } = useProblem()
  const { worthToThem, obtainableShare } = validationAssessment

  const hasAny = (worthToThem.value !== null && worthToThem.value !== 0) || obtainableShare !== DEFAULT_OBTAINABLE_SHARE

  if (readOnly && !hasAny) {
    return (
      <div className="bg-primary rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No worth estimate captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">Worth of solving the problem</p>
        <WorthSection
          worthToThem={worthToThem}
          obtainableShare={obtainableShare}
          setWorthToThem={setWorthToThem}
          setObtainableShare={setObtainableShare}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

export function MarketSizingStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    validationAssessment, setHowManyPeople, setHowOften,
  } = useProblem()
  const { howManyPeople, howOften, worthToThem, obtainableShare } = validationAssessment

  const hasAny = [howManyPeople, howOften].some((m) => m.value !== null && m.value !== 0)

  if (readOnly && !hasAny) {
    return (
      <div className="bg-primary rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No market sizing captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">Market sizing</p>
        <MarketSection
          howManyPeople={howManyPeople}
          howOften={howOften}
          setHowManyPeople={setHowManyPeople}
          setHowOften={setHowOften}
          readOnly={readOnly}
        />
        <TamCalculation
          howManyPeople={howManyPeople}
          howOften={howOften}
          worthToThem={worthToThem}
          obtainableShare={obtainableShare}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

export function CompetitionStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    validationAssessment, setCostOfSwitching, setSolutionEffectiveness, setCompetitorSize,
    reason, setReason, status, setStatus,
  } = useProblem()
  const { costOfSwitching, solutionEffectiveness, competitorSize } = validationAssessment

  const hasAny = [costOfSwitching, solutionEffectiveness, competitorSize].some((m) => m.level !== "")

  if (readOnly && !hasAny && !reason.trim()) {
    return (
      <div className="bg-primary rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No competitive landscape captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">Competitive landscape</p>
        <CompetitionSection
          costOfSwitching={costOfSwitching}
          solutionEffectiveness={solutionEffectiveness}
          competitorSize={competitorSize}
          setCostOfSwitching={setCostOfSwitching}
          setSolutionEffectiveness={setSolutionEffectiveness}
          setCompetitorSize={setCompetitorSize}
          readOnly={readOnly}
        />
        <div className="pt-2 border-t border-white/20">
          <NotesSection
            reason={reason}
            setReason={setReason}
            status={status}
            setStatus={setStatus}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  )
}

type Signal = "positive" | "neutral" | "negative" | "unknown"

function classifyHowMany(m: ValidationMetric): Signal {
  const v = m.value ?? 0
  if (v <= 0) return "unknown"
  if (v >= 100000) return "positive"
  if (v >= 1000) return "neutral"
  return "negative"
}

function classifyHowOften(m: ValidationMetric): Signal {
  const v = m.value ?? 0
  const factor = FREQUENCY_ANNUAL_FACTOR[m.unit] ?? 0
  if (v <= 0 || factor === 0) return "unknown"
  const annualised = v * factor
  if (annualised >= 52) return "positive"
  if (annualised >= 12) return "neutral"
  return "negative"
}

function classifyWorth(m: ValidationMetric): Signal {
  const v = m.value ?? 0
  if (v <= 0) return "unknown"
  if (v >= 50) return "positive"
  if (v >= 5) return "neutral"
  return "negative"
}

function classifyCostOfSwitching(m: ValidationMetric): Signal {
  if (!m.level) return "unknown"
  if (m.level === "none" || m.level === "low") return "positive"
  if (m.level === "medium") return "neutral"
  if (m.level === "high" || m.level === "prohibitive") return "negative"
  return "unknown"
}

function classifyEffectiveness(m: ValidationMetric): Signal {
  if (!m.level) return "unknown"
  if (m.level === "terrible" || m.level === "poor") return "positive"
  if (m.level === "average") return "neutral"
  if (m.level === "good" || m.level === "excellent") return "negative"
  return "unknown"
}

function classifyCompetitorSize(m: ValidationMetric): Signal {
  if (!m.level) return "unknown"
  if (m.level === "micro" || m.level === "small") return "positive"
  if (m.level === "medium") return "neutral"
  if (m.level === "large" || m.level === "giant") return "negative"
  return "unknown"
}

const SIGNAL_DOT: Record<Signal, string> = {
  positive: "bg-green-400",
  neutral: "bg-amber-300",
  negative: "bg-red-400",
  unknown: "bg-white/30",
}

const SIGNAL_LABEL: Record<Signal, string> = {
  positive: "Favourable",
  neutral: "Neutral",
  negative: "Unfavourable",
  unknown: "Not captured",
}

function MetricRow({ label, value, signal }: { label: string; value: string; signal?: Signal }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {signal && (
          <span
            className={cn("inline-block h-2.5 w-2.5 rounded-full shrink-0", SIGNAL_DOT[signal])}
            aria-label={SIGNAL_LABEL[signal]}
            title={SIGNAL_LABEL[signal]}
          />
        )}
        <span className="text-sm uppercase tracking-wide text-white/60">{label}</span>
      </div>
      <span className="text-base font-semibold text-white">{value || "Not captured"}</span>
    </div>
  )
}

function LeanIndicator({ signals }: { signals: Signal[] }) {
  const captured = signals.filter((s) => s !== "unknown")
  const positive = captured.filter((s) => s === "positive").length
  const negative = captured.filter((s) => s === "negative").length
  const net = positive - negative

  if (captured.length < 4) {
    return (
      <div className="rounded-lg border border-white/20 bg-white/10 p-4 text-base text-white">
        <p className="font-semibold">Not enough signals yet</p>
        <p className="text-white/80 mt-1">Capture at least four of the six factors to see how the evidence leans. You have currently filled in {captured.length} of 6.</p>
      </div>
    )
  }

  let title: string
  let body: string
  let tone: string
  if (net >= 3) {
    title = "Signals lean toward Valid"
    body = `${positive} favourable, ${negative} unfavourable, ${captured.length - positive - negative} neutral. The evidence supports pursuing this problem, but read the notes once more before committing.`
    tone = "border-green-400/40 bg-green-500/15"
  } else if (net <= -3) {
    title = "Signals lean toward Invalid"
    body = `${positive} favourable, ${negative} unfavourable, ${captured.length - positive - negative} neutral. The evidence is stacked against this problem. Consider whether a tighter customer segment or different angle changes the picture.`
    tone = "border-red-400/40 bg-red-500/15"
  } else {
    title = "Signals are mixed"
    body = `${positive} favourable, ${negative} unfavourable, ${captured.length - positive - negative} neutral. The evidence is genuinely split. A single targeted experiment (a few customer interviews, a pricing test, a competitor audit) usually cuts through faster than another round of guessing.`
    tone = "border-amber-300/40 bg-amber-400/15"
  }

  return (
    <div className={cn("rounded-lg border p-4 text-base text-white", tone)}>
      <p className="font-semibold">{title}</p>
      <p className="text-white/85 mt-1">{body}</p>
    </div>
  )
}

function PitfallsCallout() {
  return (
    <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 p-4 flex gap-3 text-base text-white">
      <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-1" />
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold">Before you commit, check yourself against the common pitfalls</p>
        <ul className="list-disc pl-5 space-y-1 text-white/85">
          <li>A large total addressable market is not the same as proven willingness to pay.</li>
          <li>If you cannot name a specific customer who hit this problem in the last week, it is probably not as universal as it feels.</li>
          <li>Switching costs and incumbent reactions are usually one level worse than your gut estimate.</li>
          <li>If your notes only argue for your gut verdict, write the strongest case against it before deciding.</li>
        </ul>
      </div>
    </div>
  )
}

export function VerdictStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    validationAssessment, status, setStatus, reason,
  } = useProblem()
  const { howManyPeople, howOften, worthToThem, obtainableShare, costOfSwitching, solutionEffectiveness, competitorSize } = validationAssessment

  const customers = howManyPeople.value ?? 0
  const frequency = howOften.value ?? 0
  const cost = worthToThem.value ?? 0
  const unit = howOften.unit || "per day"
  const factor = FREQUENCY_ANNUAL_FACTOR[unit] ?? 365
  const currency = worthToThem.unit || "GBP"
  const sharePct = Math.max(0, Math.min(100, obtainableShare))
  const grossMarket = customers * frequency * cost * factor
  const tam = grossMarket * (sharePct / 100)
  const tamReady = customers > 0 && frequency > 0 && cost > 0

  const signals = {
    howMany: classifyHowMany(howManyPeople),
    howOften: classifyHowOften(howOften),
    worth: classifyWorth(worthToThem),
    cost: classifyCostOfSwitching(costOfSwitching),
    effectiveness: classifyEffectiveness(solutionEffectiveness),
    competitor: classifyCompetitorSize(competitorSize),
  }
  const signalList: Signal[] = [signals.howMany, signals.howOften, signals.worth, signals.cost, signals.effectiveness, signals.competitor]

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-white">Summary of your assessment</p>
          <p className="text-sm text-white/70">
            Each signal below is colour-coded against a rough heuristic: green is favourable for pursuing the problem, amber is neutral, red is unfavourable. The dot is a hint, not a rule. If you disagree with how a signal is read, say so in the notes.
          </p>
          <div className="rounded-lg border border-white/20 bg-white/10 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricRow
              label="How many customers"
              value={customers > 0 ? formatNumber(customers) : ""}
              signal={signals.howMany}
            />
            <MetricRow
              label="How often"
              value={frequency > 0 ? `${frequency} ${unit}` : ""}
              signal={signals.howOften}
            />
            <MetricRow
              label="How much is it worth"
              value={cost > 0 ? formatNumber(cost, { currency }) : ""}
              signal={signals.worth}
            />
            <MetricRow
              label="Realistic share of market"
              value={`${sharePct}%`}
            />
            <MetricRow
              label="Cost of switching"
              value={costOfSwitching.level}
              signal={signals.cost}
            />
            <MetricRow
              label="Solution effectiveness"
              value={solutionEffectiveness.level}
              signal={signals.effectiveness}
            />
            <MetricRow
              label="Competitor size"
              value={competitorSize.level}
              signal={signals.competitor}
            />
          </div>
          <div className="rounded-lg bg-primary/40 border border-white/20 p-4 flex flex-col gap-1 text-base text-white">
            <span className="text-sm uppercase tracking-wide text-white/60">Total addressable market</span>
            <span className="text-xl font-bold">
              {tamReady ? `${formatNumber(tam, { currency })} per year` : "Not enough data"}
            </span>
            {tamReady && (
              <span className="text-sm text-white/70">customers × frequency × value × factor ({factor}) × share ({sharePct}%). Gross market before the share filter: {formatNumber(grossMarket, { currency })} per year. Treat the result as a sanity check, not as proof of demand.</span>
            )}
          </div>
          {reason.trim() && (
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 flex flex-col gap-1">
              <span className="text-sm uppercase tracking-wide text-white/60">Notes</span>
              <span className="text-base text-white whitespace-pre-wrap">{reason}</span>
            </div>
          )}
        </div>

        <LeanIndicator signals={signalList} />

        {!readOnly && <PitfallsCallout />}

        <div className="pt-2 border-t border-white/20">
          <VerdictButtons status={status} setStatus={setStatus} readOnly={readOnly} />
        </div>
      </div>
    </div>
  )
}

export function ValidationStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    status, setStatus, reason, setReason,
    validationAssessment, setHowManyPeople, setHowOften, setWorthToThem, setObtainableShare, setCostOfSwitching,
    setSolutionEffectiveness, setCompetitorSize,
  } = useProblem()

  const { howManyPeople, howOften, worthToThem, obtainableShare, costOfSwitching, solutionEffectiveness, competitorSize } = validationAssessment

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
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">Decision Factors</p>

        <MarketSection
          howManyPeople={howManyPeople}
          howOften={howOften}
          setHowManyPeople={setHowManyPeople}
          setHowOften={setHowOften}
          readOnly={readOnly}
        />

        <WorthSection
          worthToThem={worthToThem}
          obtainableShare={obtainableShare}
          setWorthToThem={setWorthToThem}
          setObtainableShare={setObtainableShare}
          readOnly={readOnly}
        />

        <TamCalculation
          howManyPeople={howManyPeople}
          howOften={howOften}
          worthToThem={worthToThem}
          obtainableShare={obtainableShare}
          readOnly={readOnly}
        />

        <CompetitionSection
          costOfSwitching={costOfSwitching}
          solutionEffectiveness={solutionEffectiveness}
          competitorSize={competitorSize}
          setCostOfSwitching={setCostOfSwitching}
          setSolutionEffectiveness={setSolutionEffectiveness}
          setCompetitorSize={setCompetitorSize}
          readOnly={readOnly}
        />

        {(!readOnly || reason) && (
          <div className="pt-2 border-t border-white/20">
            <NotesSection
              reason={reason}
              setReason={setReason}
              status={status}
              setStatus={setStatus}
              readOnly={readOnly}
            />
          </div>
        )}

        <div className="pt-2 border-t border-white/20">
          <VerdictButtons status={status} setStatus={setStatus} readOnly={readOnly} />
        </div>
      </div>
    </div>
  )
}
