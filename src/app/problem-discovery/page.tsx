"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getNavigationItem } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Plus, Users, AlertCircle, GitFork, Clock, ThumbsDown, Heart, BarChart2, X, Briefcase, Trash2 } from "lucide-react"
import { useState, KeyboardEvent } from "react"

type Job = {
  id: number
  job: string
  functional: string
  emotional: string
  social: string
}

type CanvasField = {
  key: string
  label: string
  description: string
  icon: React.ElementType
  placeholder: string
  color: string
}

const CANVAS_FIELDS_BEFORE: CanvasField[] = [
  {
    key: "problem",
    label: "Problem",
    description: "The core problem your customers face",
    icon: AlertCircle,
    placeholder: "Describe the specific problem or pain point your customers experience...",
    color: "bg-rose-50 border-rose-200",
  },
]

const CANVAS_FIELDS_AFTER: CanvasField[] = [
  {
    key: "context",
    label: "Context",
    description: "When and where does the problem occur?",
    icon: Clock,
    placeholder: "Describe the situation, trigger, or environment when the problem arises...",
    color: "bg-amber-50 border-amber-200",
  },
  {
    key: "shortcomings",
    label: "Alternatives Shortcomings",
    description: "What are the disadvantages of the current alternatives?",
    icon: ThumbsDown,
    placeholder: "Explain why the existing alternatives fall short or create additional frustrations...",
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    key: "emotionalImpact",
    label: "Emotional Impact",
    description: "How does the problem make customers feel?",
    icon: Heart,
    placeholder: "Describe the frustration, anxiety, stress, or other emotions the problem triggers...",
    color: "bg-pink-50 border-pink-200",
  },
]

type CustomerFields = {
  segmentName: string
  occupation: string
  ageRange: string
  whoTheyAre: string
  whatTheyDo: string
  goalsAndMotivations: string
  frustrationsAndChallenges: string
}

const CUSTOMER_TEXT_FIELDS: { key: keyof CustomerFields; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: "segmentName", label: "Segment Name", placeholder: "e.g. Freelance Designers, Mid-market HR Teams..." },
  { key: "occupation", label: "Occupation", placeholder: "e.g. Product Manager, Small Business Owner..." },
  { key: "ageRange", label: "Age Range", placeholder: "e.g. 25–40" },
  { key: "whoTheyAre", label: "Who They Are", placeholder: "Describe their background, lifestyle, and identity...", multiline: true },
  { key: "whatTheyDo", label: "What They Do", placeholder: "Describe their daily activities and responsibilities...", multiline: true },
  { key: "goalsAndMotivations", label: "Goals & Motivations", placeholder: "What are they trying to achieve? What drives them?", multiline: true },
  { key: "frustrationsAndChallenges", label: "Frustrations & Challenges", placeholder: "What blocks them from achieving their goals?", multiline: true },
]

const IMPACT_CATEGORIES = [
  "Time Lost",
  "Money Wasted",
  "Error Rates",
  "Customer Churn",
  "Support Tickets",
  "Productivity Loss",
  "Revenue Impact",
  "Compliance Risk",
]

type ImpactItem = { category: string; description: string }
type ImpactDraft = ImpactItem

function CustomersCard({
  value,
  onChange,
}: {
  value: CustomerFields
  onChange: (updated: CustomerFields) => void
}) {
  const set = (key: keyof CustomerFields, val: string) =>
    onChange({ ...value, [key]: val })

  return (
    <div className="rounded-xl border-2 bg-blue-50 border-blue-200 p-5 flex flex-col gap-4 md:col-span-2">
      <div className="flex items-start gap-2.5">
        <Users className="h-4 w-4 mt-0.5 shrink-0 text-foreground/70" />
        <div>
          <p className="font-semibold text-sm leading-tight">Customers</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Who they are, what they do, their goals and characteristics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CUSTOMER_TEXT_FIELDS.filter((f) => !f.multiline).map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/70">{f.label}</label>
            <Input
              placeholder={f.placeholder}
              value={value[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              className="bg-white/70 border-blue-200 text-sm h-8"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CUSTOMER_TEXT_FIELDS.filter((f) => f.multiline).map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/70">{f.label}</label>
            <Textarea
              rows={3}
              placeholder={f.placeholder}
              value={value[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              className="bg-white/70 border-blue-200 resize-none text-sm focus-visible:ring-1"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function AlternativesCard({
  items,
  draft,
  onDraftChange,
  onChange,
}: {
  items: string[]
  draft: string
  onDraftChange: (val: string) => void
  onChange: (updated: string[]) => void
}) {
  const add = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    onDraftChange("")
  }

  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); add() }
  }

  return (
    <div className="rounded-xl border-2 bg-purple-50 border-purple-200 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <GitFork className="h-4 w-4 mt-0.5 shrink-0 text-foreground/70" />
        <div>
          <p className="font-semibold text-sm leading-tight">Alternatives to the Problem</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            How customers currently solve or work around this problem
          </p>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 text-sm">
              <span className="flex-1">{item}</span>
              <button
                onClick={() => remove(i)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        <Input
          placeholder="Type an alternative..."
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="bg-white/70 border-purple-200 text-sm h-8"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={add}
          disabled={!draft.trim()}
          className="w-full border-purple-200 bg-white/70 hover:bg-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Alternative
        </Button>
      </div>
    </div>
  )
}

function QuantifiableImpactCard({
  items,
  draft,
  onDraftChange,
  onChange,
}: {
  items: ImpactItem[]
  draft: ImpactDraft
  onDraftChange: (updated: ImpactDraft) => void
  onChange: (updated: ImpactItem[]) => void
}) {
  const add = () => {
    if (!draft.category.trim() && !draft.description.trim()) return
    onChange([...items, { category: draft.category.trim(), description: draft.description.trim() }])
    onDraftChange({ category: "", description: "" })
  }

  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index))

  return (
    <div className="rounded-xl border-2 bg-orange-50 border-orange-200 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <BarChart2 className="h-4 w-4 mt-0.5 shrink-0 text-foreground/70" />
        <div>
          <p className="font-semibold text-sm leading-tight">Quantifiable Impact</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            What is the measurable cost of the problem?
          </p>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 text-sm">
              <span className="shrink-0 font-medium text-orange-700 min-w-[7rem]">{item.category || "—"}</span>
              <span className="flex-1 text-muted-foreground border-l border-orange-200 pl-2">{item.description || "—"}</span>
              <button
                onClick={() => remove(i)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        <>
          <datalist id="impact-categories">
            {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
          </datalist>
          <div className="flex gap-2">
            <Input
              list="impact-categories"
              placeholder="Type or select category..."
              value={draft.category}
              onChange={(e) => onDraftChange({ ...draft, category: e.target.value })}
              className="bg-white/70 border-orange-200 text-sm h-8 w-2/5 shrink-0"
            />
            <Input
              placeholder="Describe the impact..."
              value={draft.description}
              onChange={(e) => onDraftChange({ ...draft, description: e.target.value })}
              className="bg-white/70 border-orange-200 text-sm h-8 flex-1"
            />
          </div>
        </>
        <Button
          variant="outline"
          size="sm"
          onClick={add}
          disabled={!draft.category.trim() && !draft.description.trim()}
          className="w-full border-orange-200 bg-white/70 hover:bg-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Quantifiable Impact
        </Button>
      </div>
    </div>
  )
}

function JobsToBeDoneCard({
  jobs,
  onChange,
}: {
  jobs: Job[]
  onChange: (updated: Job[]) => void
}) {
  const add = () =>
    onChange([...jobs, { id: Date.now(), job: "", functional: "", emotional: "", social: "" }])

  const remove = (id: number) => onChange(jobs.filter((j) => j.id !== id))

  const update = (id: number, field: keyof Omit<Job, "id">, val: string) =>
    onChange(jobs.map((j) => (j.id === id ? { ...j, [field]: val } : j)))

  return (
    <div className="rounded-xl border-2 bg-teal-50 border-teal-200 p-5 flex flex-col gap-4 md:col-span-2">
      <div className="flex items-start gap-2.5">
        <Briefcase className="h-4 w-4 mt-0.5 shrink-0 text-foreground/70" />
        <div>
          <p className="font-semibold text-sm leading-tight">Jobs to Be Done</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            What your customers are trying to accomplish — functionally, emotionally, and socially
          </p>
        </div>
      </div>

      {jobs.length > 0 && (
        <ul className="flex flex-col gap-3">
          {jobs.map((job, i) => (
            <li key={job.id} className="bg-white/70 rounded-lg p-3 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground/60 flex-1">Job {i + 1}</p>
                <button
                  onClick={() => remove(job.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove job"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Input
                placeholder="What are your customers trying to get done?"
                value={job.job}
                onChange={(e) => update(job.id, "job", e.target.value)}
                className="bg-white border-teal-200 text-sm h-8"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["functional", "emotional", "social"] as const).map((field) => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-foreground/60 capitalize">{field}</label>
                    <Textarea
                      rows={2}
                      placeholder={
                        field === "functional"
                          ? "Practical outcome they need..."
                          : field === "emotional"
                          ? "How they want to feel..."
                          : "How they want to be seen..."
                      }
                      value={job[field]}
                      onChange={(e) => update(job.id, field, e.target.value)}
                      className="bg-white border-teal-200 resize-none text-sm focus-visible:ring-1"
                    />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={add}
        className="w-full border-teal-200 bg-white/70 hover:bg-white"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Job to Be Done
      </Button>
    </div>
  )
}

function CanvasCard({
  field,
  value,
  onChange,
}: {
  field: CanvasField
  value: string
  onChange: (val: string) => void
}) {
  const FieldIcon = field.icon
  return (
    <div className={`rounded-xl border-2 p-5 flex flex-col gap-3 ${field.color}`}>
      <div className="flex items-start gap-2.5">
        <FieldIcon className="h-4 w-4 mt-0.5 shrink-0 text-foreground/70" />
        <div>
          <p className="font-semibold text-sm leading-tight">{field.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
        </div>
      </div>
      <Textarea
        rows={4}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/70 border-0 resize-none text-sm focus-visible:ring-1"
      />
    </div>
  )
}

const DEFAULT_CUSTOMER: CustomerFields = {
  segmentName: "",
  occupation: "",
  ageRange: "",
  whoTheyAre: "",
  whatTheyDo: "",
  goalsAndMotivations: "",
  frustrationsAndChallenges: "",
}

export default function ProblemDiscoveryPage() {
  const navItem = getNavigationItem("/problem-discovery")
  const Icon = navItem?.icon
  const router = useRouter()

  const [canvas, setCanvas] = useState<Record<string, string>>(
    Object.fromEntries([...CANVAS_FIELDS_BEFORE, ...CANVAS_FIELDS_AFTER].map((f) => [f.key, ""]))
  )
  const [customer, setCustomer] = useState<CustomerFields>(DEFAULT_CUSTOMER)
  const [jobs, setJobs] = useState<Job[]>([])
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [alternativesDraft, setAlternativesDraft] = useState("")
  const [impacts, setImpacts] = useState<ImpactItem[]>([])
  const [impactDraft, setImpactDraft] = useState<ImpactDraft>({ category: "", description: "" })

  return (
    <Card className="w-full flex-1">
      <CardContent className="flex p-10 w-full flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {navItem && Icon && (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500">
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
            <h1 className="text-xl font-bold">Problem Discovery</h1>
          </div>
          <p className="text-muted-foreground">
            Start your problem discovery journey here. Use the canvas below to articulate the problem space,
            or explore new problems using the discovery tools. You don&apos;t need to complete every section,
            but filling in as much as possible will help you better define the problem. At a minimum, we
            recommend completing the <span className="font-medium text-foreground">Segment Name</span>,{" "}
            <span className="font-medium text-foreground">Problem</span>,{" "}
            <span className="font-medium text-foreground">Alternatives</span>, and{" "}
            <span className="font-medium text-foreground">Alternatives Shortcomings</span>.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Problem Statement Canvas</h2>
              <p className="text-sm text-muted-foreground">
                Fill in each section to build a clear picture of the problem you are solving.
              </p>
            </div>
            <Button
              variant="primary-outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push("/problem-discovery/guided-workflow")}
            >
              <Plus className="h-4 w-4" />
              Continue with Guided Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomersCard value={customer} onChange={setCustomer} />

            <JobsToBeDoneCard jobs={jobs} onChange={setJobs} />

            {CANVAS_FIELDS_BEFORE.map((field) => (
              <CanvasCard
                key={field.key}
                field={field}
                value={canvas[field.key]}
                onChange={(val) => setCanvas((prev) => ({ ...prev, [field.key]: val }))}
              />
            ))}

            <AlternativesCard
              items={alternatives}
              draft={alternativesDraft}
              onDraftChange={setAlternativesDraft}
              onChange={setAlternatives}
            />

            {CANVAS_FIELDS_AFTER.map((field) => (
              <CanvasCard
                key={field.key}
                field={field}
                value={canvas[field.key]}
                onChange={(val) => setCanvas((prev) => ({ ...prev, [field.key]: val }))}
              />
            ))}

            <QuantifiableImpactCard
              items={impacts}
              draft={impactDraft}
              onDraftChange={setImpactDraft}
              onChange={setImpacts}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
