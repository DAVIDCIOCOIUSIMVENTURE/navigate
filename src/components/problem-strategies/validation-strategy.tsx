"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useProblem } from "@/app/(app)/problems/[problemRef]/validation/context"
import type { Job, JobIntensity, JobsToBeDone, ValidationMetric } from "@/types/validation"
import { DEFAULT_OBTAINABLE_SHARE, DEFAULT_REACHABLE_SHARE } from "@/types/validation"
import { cn } from "@/lib/utils"
import {
  CheckCircle2, XCircle, HelpCircle, Users, RefreshCw, DollarSign, ArrowRightLeft, Target, Building2,
  Calculator, AlertTriangle, PieChart, Heart, Briefcase, Eye, Plus, Trash2,
  type LucideIcon,
} from "lucide-react"

const FREQUENCY_OPTIONS = [
  "per hour", "per day", "per week", "per fortnight",
  "per month", "per quarter", "per year",
]

const FREQUENCY_RANK: Record<string, number> = {
  "per hour": 6,
  "per day": 5,
  "per week": 4,
  "per fortnight": 3,
  "per month": 2,
  "per quarter": 1,
  "per year": 0,
}

const CURRENCY_OPTIONS = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF",
  "CNY", "INR", "BRL", "KRW", "SEK", "NOK", "DKK",
  "NZD", "SGD", "HKD", "MXN", "ZAR", "PLN",
]

const INTENSITY_OPTIONS: JobIntensity[] = ["mild", "strong", "unbearable"]
const INTENSITY_RANK: Record<JobIntensity, number> = {
  "": 0,
  mild: 1,
  strong: 2,
  unbearable: 3,
}

function nextJobId(jobs: Job[]): number {
  return jobs.reduce((max, j) => Math.max(max, j.id), 0) + 1
}

function strongestJob(jobs: JobsToBeDone): { kind: "emotional" | "social"; job: Job } | null {
  const candidates: { kind: "emotional" | "social"; job: Job }[] = [
    ...jobs.emotional.map((j) => ({ kind: "emotional" as const, job: j })),
    ...jobs.social.map((j) => ({ kind: "social" as const, job: j })),
  ]
  const ranked = candidates
    .filter((c) => c.job.text.trim().length > 0 && c.job.intensity !== "")
    .sort((a, b) => INTENSITY_RANK[b.job.intensity] - INTENSITY_RANK[a.job.intensity])
  return ranked[0] ?? null
}

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
        <span className="text-base font-semibold text-white">How many customers have this problem</span>
      </div>
      {!readOnly && (
        <p className="text-base text-white">The whole population that experiences this problem, before any filtering. Start from a public statistic (e.g. number of small businesses in the UK, annual home moves) and round generously. This number feeds the total market (TAM).</p>
      )}
      <Input
        type="number"
        placeholder="e.g. 1100000"
        className="mt-2 h-8 text-base w-32 bg-white border-white text-foreground read-only:cursor-default"
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
        placeholder="e.g. 1"
        className="h-8 text-base w-28 bg-white border-white text-foreground read-only:cursor-default"
        value={readOnly ? (metric.value ?? "") : localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        readOnly={readOnly}
      />
      <Select value={metric.unit || "per year"} onValueChange={(val) => onChange({ unit: val })} disabled={readOnly}>
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
        placeholder="e.g. 1500"
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

function ReachableShareInput({
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
        <span className="text-base font-semibold text-white">Slice you can actually reach (for SAM)</span>
      </div>
      {!readOnly && (
        <p className="text-base text-white">Of the total market above, how much could you serve in your launch regions and customer segments? You are filtering for things like geography, language, business size, or platform: not yet for the competition. A focused launch usually reaches 10 to 40 percent of the global TAM.</p>
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
      </div>
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
        <span className="text-base font-semibold text-white">Realistic share of the reachable market you can win (for SOM)</span>
      </div>
      {!readOnly && (
        <p className="text-base text-white">Given the switching costs, the quality of existing options, and the size of the incumbents, what share of the reachable market (SAM) can you realistically capture in the first one to three years? A focused niche entrant typically captures 1 to 5 percent, a strong differentiated play 5 to 20 percent, and a dominant winner 20 to 40 percent.</p>
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
          <p className="text-base text-white">Most early-stage ventures land in the 5 to 15 percent range. If you cannot defend a higher number to a sceptical friend, slide it down.</p>
        )}
      </div>
    </div>
  )
}

function JobRow({
  job,
  onChange,
  onRemove,
  withIntensity,
  placeholder,
  readOnly,
}: {
  job: Job
  onChange: (patch: Partial<Job>) => void
  onRemove: () => void
  withIntensity: boolean
  placeholder: string
  readOnly?: boolean
}) {
  const [localText, setLocalText] = useState(job.text)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange })

  useEffect(() => {
    if (localText === job.text) return
    const timer = setTimeout(() => onChangeRef.current({ text: localText }), 500)
    return () => clearTimeout(timer)
  }, [localText]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-white/20 bg-white/10 p-3">
      <div className="flex gap-2 items-start">
        <Input
          placeholder={placeholder}
          value={readOnly ? job.text : localText}
          onChange={(e) => setLocalText(e.target.value)}
          readOnly={readOnly}
          className="flex-1 h-8 text-base bg-white border-white text-foreground read-only:cursor-default"
        />
        {!readOnly && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="h-8 w-8 text-white hover:bg-white/15 shrink-0"
            aria-label="Remove job"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {withIntensity && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base text-white">How strong:</span>
          <div className="inline-flex w-fit rounded-lg bg-white/10 p-1">
            <ToggleGroup
              className="border-none"
              type="single"
              value={job.intensity}
              onValueChange={(val) => onChange({ intensity: val as JobIntensity })}
              disabled={readOnly}
            >
              {INTENSITY_OPTIONS.map((level) => (
                <ToggleGroupItem
                  key={level}
                  value={level}
                  className="px-3 py-1 text-base font-medium capitalize bg-transparent text-white data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow hover:bg-white/10 rounded-md border-none"
                >
                  {level}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      )}
    </div>
  )
}

function JobsGroup({
  title,
  description,
  icon: Icon,
  iconBg,
  jobs,
  onChange,
  withIntensity,
  placeholder,
  emptyLabel,
  readOnly,
}: {
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  jobs: Job[]
  onChange: (val: Job[]) => void
  withIntensity: boolean
  placeholder: string
  emptyLabel: string
  readOnly?: boolean
}) {
  const update = (id: number, patch: Partial<Job>) => {
    onChange(jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }
  const remove = (id: number) => onChange(jobs.filter((j) => j.id !== id))
  const add = () => onChange([...jobs, { id: nextJobId(jobs), text: "", intensity: "" }])

  if (readOnly && jobs.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("flex items-center justify-center h-7 w-7 rounded-lg shrink-0", iconBg)}>
            <Icon className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-base font-semibold text-white">{title}</span>
        </div>
        <p className="text-base text-white italic">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={cn("flex items-center justify-center h-7 w-7 rounded-lg shrink-0", iconBg)}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="text-base font-semibold text-white">{title}</span>
      </div>
      {!readOnly && (
        <p className="text-base text-white">{description}</p>
      )}
      <div className="flex flex-col gap-2">
        {jobs.map((job) => (
          <JobRow
            key={job.id}
            job={job}
            withIntensity={withIntensity}
            placeholder={placeholder}
            onChange={(patch) => update(job.id, patch)}
            onRemove={() => remove(job.id)}
            readOnly={readOnly}
          />
        ))}
      </div>
      {!readOnly && (
        <Button
          type="button"
          variant="ghost"
          onClick={add}
          className="self-start text-white hover:bg-white/15"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add another
        </Button>
      )}
    </div>
  )
}

function JobsToBeDoneSection({
  jobs,
  onChange,
  readOnly,
}: {
  jobs: JobsToBeDone
  onChange: (val: JobsToBeDone) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <JobsGroup
        title="What they need to get done"
        description="The tangible tasks the customer is trying to complete. Phrase them as concrete outcomes, not as your product features. For a house move: complete the sale and the purchase on the same day, find a place that fits the budget, coordinate solicitors and removals."
        icon={Briefcase}
        iconBg="bg-emerald-800"
        jobs={jobs.functional}
        onChange={(val) => onChange({ ...jobs, functional: val })}
        withIntensity={false}
        placeholder="e.g. Complete the sale and the purchase on the same day"
        emptyLabel="No functional jobs captured."
        readOnly={readOnly}
      />
      <JobsGroup
        title="How they want to feel"
        description="The emotional pulls. These usually justify the price more than the tangible tasks do, so be honest about the strongest ones. For a house move: stop lying awake worrying the chain will collapse, feel in control of an opaque process, avoid the dread of getting gazumped."
        icon={Heart}
        iconBg="bg-red-800"
        jobs={jobs.emotional}
        onChange={(val) => onChange({ ...jobs, emotional: val })}
        withIntensity={true}
        placeholder="e.g. Stop lying awake worrying the chain will collapse"
        emptyLabel="No emotional jobs captured."
        readOnly={readOnly}
      />
      <JobsGroup
        title="How they want to be seen"
        description="The social pulls: how the customer wants to be perceived by family, peers, colleagues, or counterparties. Often unspoken but real. For a house move: be seen as having made a smart move, not look disorganised in front of the estate agent."
        icon={Eye}
        iconBg="bg-blue-900"
        jobs={jobs.social}
        onChange={(val) => onChange({ ...jobs, social: val })}
        withIntensity={true}
        placeholder="e.g. Not look disorganised in front of the estate agent"
        emptyLabel="No social jobs captured."
        readOnly={readOnly}
      />
    </div>
  )
}

function WorthSection({
  worthToThem,
  jobs,
  setWorthToThem,
  readOnly,
}: {
  worthToThem: ValidationMetric
  jobs: JobsToBeDone
  setWorthToThem: (patch: Partial<ValidationMetric>) => void
  readOnly?: boolean
}) {
  const top = strongestJob(jobs)

  return (
    <div className="flex flex-col gap-6">
      {top && (
        <div className="rounded-lg border border-white/20 bg-white/10 p-4 flex flex-col gap-1 text-base text-white">
          <span className="text-base font-semibold text-white">Strongest pull from your jobs list</span>
          <span className="text-base text-white">
            <span className="capitalize">{top.job.intensity}</span> {top.kind} job: &quot;{top.job.text}&quot;
          </span>
          <span className="text-base text-white">Anchor the price on the strongest pull, not on the cost of building a feature. The bigger the emotional or social weight, the more a customer will pay to make it stop.</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-white shrink-0" />
          <span className="text-base font-semibold text-white">What they would pay each time the problem hits</span>
        </div>
        {!readOnly && (
          <p className="text-base text-white">Picture the customer being asked: &quot;If a service made this problem go away cleanly, what would you happily pay?&quot; Use the strongest job above to guide the number, not the cost of building a feature. This is a hypothesis to test in real conversations, not a fact yet. If you cannot picture a customer signing off on the figure, round it down.</p>
        )}
        <CurrencyInput metric={worthToThem} onChange={setWorthToThem} readOnly={readOnly} />
      </div>
    </div>
  )
}

function MarketSection({
  howManyPeople,
  howOften,
  reachableShare,
  setHowManyPeople,
  setHowOften,
  setReachableShare,
  readOnly,
}: {
  howManyPeople: ValidationMetric
  howOften: ValidationMetric
  reachableShare: number
  setHowManyPeople: (patch: Partial<ValidationMetric>) => void
  setHowOften: (patch: Partial<ValidationMetric>) => void
  setReachableShare: (val: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <HowManyInput metric={howManyPeople} onChange={setHowManyPeople} readOnly={readOnly} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 text-white shrink-0" />
          <span className="text-base font-semibold text-white">How often each customer hits the problem</span>
        </div>
        {!readOnly && (
          <p className="text-base text-white">Pick the natural cadence. A daily problem multiplies the price quickly. A one-off problem (like moving house) uses 1 per year (or per however many years it recurs). For most problems, leave this at 1 per year unless the same customer pays repeatedly.</p>
        )}
        <FrequencyInput metric={howOften} onChange={setHowOften} readOnly={readOnly} />
      </div>

      <ReachableShareInput value={reachableShare} onChange={setReachableShare} readOnly={readOnly} />
    </div>
  )
}

function CompetitionSection({
  costOfSwitching,
  solutionEffectiveness,
  competitorSize,
  obtainableShare,
  setCostOfSwitching,
  setSolutionEffectiveness,
  setCompetitorSize,
  setObtainableShare,
  readOnly,
}: {
  costOfSwitching: ValidationMetric
  solutionEffectiveness: ValidationMetric
  competitorSize: ValidationMetric
  obtainableShare: number
  setCostOfSwitching: (patch: Partial<ValidationMetric>) => void
  setSolutionEffectiveness: (patch: Partial<ValidationMetric>) => void
  setCompetitorSize: (patch: Partial<ValidationMetric>) => void
  setObtainableShare: (val: number) => void
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
                className="px-4 py-1.5 text-base font-medium capitalize bg-transparent text-white data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-md hover:bg-white/10 rounded-md border-none"
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
                className="px-4 py-1.5 text-base font-medium capitalize bg-transparent text-white data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-md hover:bg-white/10 rounded-md border-none"
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
                className="px-4 py-1.5 text-base font-medium capitalize bg-transparent text-white data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-md hover:bg-white/10 rounded-md border-none"
              >
                {level}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <ObtainableShareInput value={obtainableShare} onChange={setObtainableShare} readOnly={readOnly} />
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
        { value: "valid" as const, label: "Valid: Worth Solving", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-success border-success bg-success-foreground" },
        { value: "unsure" as const, label: "Unsure: May Be Worth Solving", icon: <HelpCircle className="h-4 w-4" />, color: "text-tertiary border-tertiary bg-tertiary-foreground" },
        { value: "invalid" as const, label: "Invalid: Not Worth Solving", icon: <XCircle className="h-4 w-4" />, color: "text-destructive border-destructive bg-destructive-foreground" },
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
              ? option.value === "valid" ? "border-success bg-success" : option.value === "unsure" ? "border-tertiary bg-tertiary" : "border-destructive bg-destructive"
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

function TamSamSomPanel({
  howManyPeople,
  howOften,
  worthToThem,
  reachableShare,
  obtainableShare,
  show,
  readOnly,
}: {
  howManyPeople: ValidationMetric
  howOften: ValidationMetric
  worthToThem: ValidationMetric
  reachableShare: number
  obtainableShare: number
  show: { tam: boolean; sam: boolean; som: boolean }
  readOnly?: boolean
}) {
  const customers = howManyPeople.value ?? 0
  const frequency = howOften.value ?? 0
  const price = worthToThem.value ?? 0
  const unit = howOften.unit || "per year"
  const currency = worthToThem.unit || "GBP"
  const reachPct = Math.max(0, Math.min(100, reachableShare))
  const obtainPct = Math.max(0, Math.min(100, obtainableShare))

  const tam = customers * Math.max(1, frequency) * price
  const sam = tam * (reachPct / 100)
  const som = sam * (obtainPct / 100)
  const ready = customers > 0 && price > 0

  if (readOnly && !ready) return null

  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-white shrink-0" />
        <span className="text-base font-semibold text-white">Market size estimate</span>
      </div>
      {!readOnly && (
        <p className="text-base text-white">
          TAM is the whole pie. SAM is the slice you can actually reach. SOM is what you could realistically capture given the competition. Treat these as sanity checks, not proof of demand.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {show.tam && (
          <div className="rounded-lg bg-secondary-brand/40 border border-white/20 p-4 flex flex-col gap-1 text-base text-white">
            <span className="text-base uppercase tracking-wide text-white">Total addressable market (TAM)</span>
            <span className="text-xl font-bold">
              {ready ? `${formatNumber(tam, { currency })} ${unit}` : "Fill in customers and price to see this"}
            </span>
            {ready && (
              <span className="text-base text-white">
                {formatNumber(customers)} customers × {frequency || 1} {unit} × {formatNumber(price, { currency })}
              </span>
            )}
          </div>
        )}
        {show.sam && (
          <div className="rounded-lg bg-secondary-brand/40 border border-white/20 p-4 flex flex-col gap-1 text-base text-white">
            <span className="text-base uppercase tracking-wide text-white">Reachable market (SAM)</span>
            <span className="text-xl font-bold">
              {ready ? `${formatNumber(sam, { currency })} ${unit}` : "Fill in the inputs to see this"}
            </span>
            {ready && (
              <span className="text-base text-white">TAM × {reachPct}% reachable share</span>
            )}
          </div>
        )}
        {show.som && (
          <div className="rounded-lg bg-secondary-brand/40 border border-white/20 p-4 flex flex-col gap-1 text-base text-white">
            <span className="text-base uppercase tracking-wide text-white">Realistic capture (SOM)</span>
            <span className="text-xl font-bold">
              {ready ? `${formatNumber(som, { currency })} ${unit}` : "Fill in the inputs to see this"}
            </span>
            {ready && (
              <span className="text-base text-white">SAM × {obtainPct}% realistic capture</span>
            )}
          </div>
        )}
      </div>

      <Accordion type="single" collapsible className="-mb-2">
        <AccordionItem value="how" className="border-t border-white/20">
          <AccordionTrigger className="py-2 text-base font-medium text-white hover:no-underline [&>svg]:text-white">
            How is this calculated?
          </AccordionTrigger>
          <AccordionContent className="pb-2 pt-0 flex flex-col gap-2 text-white">
            <div className="font-mono text-base">TAM = customers × frequency × price</div>
            <div className="font-mono text-base">SAM = TAM × reachable share</div>
            <div className="font-mono text-base">SOM = SAM × realistic capture</div>
            <div className="text-base text-white">
              If frequency is left empty, it is treated as 1 (one-off purchase, like moving house).
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function JobsToBeDoneStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const { validationAssessment, setJobsToBeDone } = useProblem()
  const { jobsToBeDone } = validationAssessment

  const hasAny = jobsToBeDone.functional.length + jobsToBeDone.emotional.length + jobsToBeDone.social.length > 0

  if (readOnly && !hasAny) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-base text-white italic">No jobs captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">Jobs your customer is trying to get done</p>
        <JobsToBeDoneSection
          jobs={jobsToBeDone}
          onChange={setJobsToBeDone}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

export function WorthStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    validationAssessment, setWorthToThem,
  } = useProblem()
  const { worthToThem, jobsToBeDone } = validationAssessment

  const hasAny = worthToThem.value !== null && worthToThem.value !== 0

  if (readOnly && !hasAny) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-base text-white italic">No price captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">What they would pay each time the problem hits</p>
        <WorthSection
          worthToThem={worthToThem}
          jobs={jobsToBeDone}
          setWorthToThem={setWorthToThem}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

export function MarketSizingStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    validationAssessment, setHowManyPeople, setHowOften, setReachableShare,
  } = useProblem()
  const { howManyPeople, howOften, worthToThem, reachableShare, obtainableShare } = validationAssessment

  const hasAny = [howManyPeople, howOften].some((m) => m.value !== null && m.value !== 0)
    || reachableShare !== DEFAULT_REACHABLE_SHARE

  if (readOnly && !hasAny) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-base text-white italic">No market sizing captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">Total market (TAM) and reachable slice (SAM)</p>
        <MarketSection
          howManyPeople={howManyPeople}
          howOften={howOften}
          reachableShare={reachableShare}
          setHowManyPeople={setHowManyPeople}
          setHowOften={setHowOften}
          setReachableShare={setReachableShare}
          readOnly={readOnly}
        />
        <TamSamSomPanel
          howManyPeople={howManyPeople}
          howOften={howOften}
          worthToThem={worthToThem}
          reachableShare={reachableShare}
          obtainableShare={obtainableShare}
          show={{ tam: true, sam: true, som: false }}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

export function CompetitionStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const {
    validationAssessment, setCostOfSwitching, setSolutionEffectiveness, setCompetitorSize, setObtainableShare,
  } = useProblem()
  const { costOfSwitching, solutionEffectiveness, competitorSize, obtainableShare, howManyPeople, howOften, worthToThem, reachableShare } = validationAssessment

  const hasAny = [costOfSwitching, solutionEffectiveness, competitorSize].some((m) => m.level !== "")
    || obtainableShare !== DEFAULT_OBTAINABLE_SHARE

  if (readOnly && !hasAny) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-base text-white italic">No competitive landscape captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">Competitive landscape and realistic capture (SOM)</p>
        <CompetitionSection
          costOfSwitching={costOfSwitching}
          solutionEffectiveness={solutionEffectiveness}
          competitorSize={competitorSize}
          obtainableShare={obtainableShare}
          setCostOfSwitching={setCostOfSwitching}
          setSolutionEffectiveness={setSolutionEffectiveness}
          setCompetitorSize={setCompetitorSize}
          setObtainableShare={setObtainableShare}
          readOnly={readOnly}
        />
        <TamSamSomPanel
          howManyPeople={howManyPeople}
          howOften={howOften}
          worthToThem={worthToThem}
          reachableShare={reachableShare}
          obtainableShare={obtainableShare}
          show={{ tam: false, sam: true, som: true }}
          readOnly={readOnly}
        />
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
  const rank = FREQUENCY_RANK[m.unit]
  if (v <= 0 || rank === undefined) return "unknown"
  if (rank >= 4) return "positive"
  if (rank >= 2) return "neutral"
  return "negative"
}

function classifyWorth(m: ValidationMetric): Signal {
  const v = m.value ?? 0
  if (v <= 0) return "unknown"
  if (v >= 50) return "positive"
  if (v >= 5) return "neutral"
  return "negative"
}

function classifyJobs(jobs: JobsToBeDone): Signal {
  const top = strongestJob(jobs)
  if (!top) return "unknown"
  if (top.job.intensity === "unbearable" || top.job.intensity === "strong") return "positive"
  if (top.job.intensity === "mild") return "negative"
  return "unknown"
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
  positive: "bg-success",
  neutral: "bg-tertiary",
  negative: "bg-destructive",
  unknown: "bg-white/30",
}

const SIGNAL_LABEL: Record<Signal, string> = {
  positive: "Favourable",
  neutral: "Neutral",
  negative: "Unfavourable",
  unknown: "Not captured",
}

function MetricRow({ label, icon: Icon, value, signal }: { label: string; icon: LucideIcon; value: string; signal?: Signal }) {
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
        <Icon className="h-3.5 w-3.5 text-white shrink-0" />
        <span className="text-base font-semibold text-white">{label}</span>
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

  if (captured.length < 5) {
    return (
      <div className="rounded-lg border border-white/20 bg-white/10 p-4 text-base text-white">
        <p className="font-semibold">Not enough signals yet</p>
        <p className="text-white mt-1">Capture at least five of the seven factors to see how the evidence leans. You have currently filled in {captured.length} of 7.</p>
      </div>
    )
  }

  let title: string
  let body: string
  let tone: string
  if (net >= 3) {
    title = "Signals lean toward Valid"
    body = `${positive} favourable, ${negative} unfavourable, ${captured.length - positive - negative} neutral. The evidence supports pursuing this problem, but read the notes once more before committing.`
    tone = "border-success/40 bg-success/15"
  } else if (net <= -3) {
    title = "Signals lean toward Invalid"
    body = `${positive} favourable, ${negative} unfavourable, ${captured.length - positive - negative} neutral. The evidence is stacked against this problem. Consider whether a tighter customer segment or different angle changes the picture.`
    tone = "border-destructive/40 bg-destructive/15"
  } else {
    title = "Signals are mixed"
    body = `${positive} favourable, ${negative} unfavourable, ${captured.length - positive - negative} neutral. The evidence is genuinely split. A single targeted experiment (a few customer interviews, a pricing test, a competitor audit) usually cuts through faster than another round of guessing.`
    tone = "border-tertiary/40 bg-tertiary/15"
  }

  return (
    <div className={cn("rounded-lg border p-4 text-base text-white", tone)}>
      <p className="font-semibold">{title}</p>
      <p className="text-white mt-1">{body}</p>
    </div>
  )
}

function PitfallsCallout() {
  return (
    <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 p-4 flex gap-3 text-base text-white">
      <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-1" />
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold">Before you commit, check yourself against the common pitfalls</p>
        <ul className="list-disc pl-5 space-y-1 text-white">
          <li>A large TAM is not the same as proven willingness to pay. Treat the price you captured as a hypothesis to test in real conversations.</li>
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
    validationAssessment, status, setStatus,
  } = useProblem()
  const { jobsToBeDone, howManyPeople, howOften, worthToThem, reachableShare, obtainableShare, costOfSwitching, solutionEffectiveness, competitorSize } = validationAssessment

  const customers = howManyPeople.value ?? 0
  const frequency = howOften.value ?? 0
  const price = worthToThem.value ?? 0
  const unit = howOften.unit || "per year"
  const currency = worthToThem.unit || "GBP"
  const reachPct = Math.max(0, Math.min(100, reachableShare))
  const obtainPct = Math.max(0, Math.min(100, obtainableShare))
  const tam = customers * Math.max(1, frequency) * price
  const sam = tam * (reachPct / 100)
  const som = sam * (obtainPct / 100)
  const ready = customers > 0 && price > 0

  const top = strongestJob(jobsToBeDone)

  const signals = {
    howMany: classifyHowMany(howManyPeople),
    howOften: classifyHowOften(howOften),
    worth: classifyWorth(worthToThem),
    jobs: classifyJobs(jobsToBeDone),
    cost: classifyCostOfSwitching(costOfSwitching),
    effectiveness: classifyEffectiveness(solutionEffectiveness),
    competitor: classifyCompetitorSize(competitorSize),
  }
  const signalList: Signal[] = [signals.howMany, signals.howOften, signals.worth, signals.jobs, signals.cost, signals.effectiveness, signals.competitor]

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-white">Summary of your assessment</p>
          <p className="text-base text-white">
            Each signal below is colour-coded against a rough heuristic: green is favourable for pursuing the problem, amber is neutral, red is unfavourable. The dot is a hint, not a rule.
          </p>
          <div className="rounded-lg border border-white/20 bg-white/10 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricRow
              label="How many customers have this problem"
              icon={Users}
              value={customers > 0 ? formatNumber(customers) : ""}
              signal={signals.howMany}
            />
            <MetricRow
              label="How often each customer hits the problem"
              icon={RefreshCw}
              value={frequency > 0 ? `${frequency} ${unit}` : ""}
              signal={signals.howOften}
            />
            <MetricRow
              label="What they would pay each time"
              icon={DollarSign}
              value={price > 0 ? formatNumber(price, { currency }) : ""}
              signal={signals.worth}
            />
            <MetricRow
              label="Strongest job pull"
              icon={Heart}
              value={top ? `${top.job.intensity} (${top.kind})` : ""}
              signal={signals.jobs}
            />
            <MetricRow
              label="Reachable share (for SAM)"
              icon={PieChart}
              value={`${reachPct}%`}
            />
            <MetricRow
              label="Realistic capture (for SOM)"
              icon={PieChart}
              value={`${obtainPct}%`}
            />
            <MetricRow
              label="What is the cost of switching"
              icon={ArrowRightLeft}
              value={costOfSwitching.level}
              signal={signals.cost}
            />
            <MetricRow
              label="How effective are existing solutions"
              icon={Target}
              value={solutionEffectiveness.level}
              signal={signals.effectiveness}
            />
            <MetricRow
              label="How big are the competitors"
              icon={Building2}
              value={competitorSize.level}
              signal={signals.competitor}
            />
          </div>
          <div className="rounded-lg bg-secondary-brand/40 border border-white/20 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-base text-white">
            <div className="flex flex-col gap-1">
              <span className="text-base uppercase tracking-wide text-white">TAM</span>
              <span className="text-xl font-bold">{ready ? `${formatNumber(tam, { currency })} ${unit}` : "Not enough data"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-base uppercase tracking-wide text-white">SAM</span>
              <span className="text-xl font-bold">{ready ? `${formatNumber(sam, { currency })} ${unit}` : "Not enough data"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-base uppercase tracking-wide text-white">SOM</span>
              <span className="text-xl font-bold">{ready ? `${formatNumber(som, { currency })} ${unit}` : "Not enough data"}</span>
            </div>
          </div>
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
    status, setStatus,
    validationAssessment, setJobsToBeDone, setHowManyPeople, setHowOften, setWorthToThem,
    setReachableShare, setObtainableShare, setCostOfSwitching,
    setSolutionEffectiveness, setCompetitorSize,
  } = useProblem()

  const { jobsToBeDone, howManyPeople, howOften, worthToThem, reachableShare, obtainableShare, costOfSwitching, solutionEffectiveness, competitorSize } = validationAssessment

  const jobsCount = jobsToBeDone.functional.length + jobsToBeDone.emotional.length + jobsToBeDone.social.length
  const hasAnyMetric = [howManyPeople, howOften, worthToThem, costOfSwitching, solutionEffectiveness, competitorSize]
    .some((m) => m.value !== null || m.level !== "")
    || jobsCount > 0
  const hasVerdict = status === "valid" || status === "unsure" || status === "invalid"

  if (readOnly && !hasAnyMetric && !hasVerdict) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-base text-white italic">No validation assessment captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <p className="text-base font-medium text-white">Decision Factors</p>

        <JobsToBeDoneSection
          jobs={jobsToBeDone}
          onChange={setJobsToBeDone}
          readOnly={readOnly}
        />

        <WorthSection
          worthToThem={worthToThem}
          jobs={jobsToBeDone}
          setWorthToThem={setWorthToThem}
          readOnly={readOnly}
        />

        <MarketSection
          howManyPeople={howManyPeople}
          howOften={howOften}
          reachableShare={reachableShare}
          setHowManyPeople={setHowManyPeople}
          setHowOften={setHowOften}
          setReachableShare={setReachableShare}
          readOnly={readOnly}
        />

        <CompetitionSection
          costOfSwitching={costOfSwitching}
          solutionEffectiveness={solutionEffectiveness}
          competitorSize={competitorSize}
          obtainableShare={obtainableShare}
          setCostOfSwitching={setCostOfSwitching}
          setSolutionEffectiveness={setSolutionEffectiveness}
          setCompetitorSize={setCompetitorSize}
          setObtainableShare={setObtainableShare}
          readOnly={readOnly}
        />

        <TamSamSomPanel
          howManyPeople={howManyPeople}
          howOften={howOften}
          worthToThem={worthToThem}
          reachableShare={reachableShare}
          obtainableShare={obtainableShare}
          show={{ tam: true, sam: true, som: true }}
          readOnly={readOnly}
        />

        <div className="pt-2 border-t border-white/20">
          <VerdictButtons status={status} setStatus={setStatus} readOnly={readOnly} />
        </div>
      </div>
    </div>
  )
}
