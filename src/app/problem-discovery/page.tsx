"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getNavigationItem } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Plus, Users, AlertCircle, GitFork, Clock, ThumbsDown, Heart, BarChart2, X, Briefcase, Pencil } from "lucide-react"
import { useState, KeyboardEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type ImpactItem = { category: string; description: string }

type Alternative = {
  id: number
  text: string
  shortcomings: string[]
}

type Problem = {
  id: number
  text: string
  linkedJob: string
  alternatives: Alternative[]
  context: string
  emotionalImpact: string
  impacts: ImpactItem[]
}

type CanvasField = {
  key: keyof Pick<Problem, "context" | "emotionalImpact">
  label: string
  description: string
  icon: React.ElementType
  placeholder: string
  color: string
}

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

const DEFAULT_PROBLEM: Omit<Problem, "id"> = {
  text: "",
  linkedJob: "",
  alternatives: [],
  context: "",
  emotionalImpact: "",
  impacts: [],
}

let nextAltId = 1

function ClickableCardTitle({
  icon: Icon,
  label,
  description,
  onEdit,
}: {
  icon: React.ElementType
  label: string
  description: string
  onEdit: () => void
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 mt-0.5 shrink-0 text-foreground/70" />
      <div className="flex-1">
        <button onClick={onEdit} className="flex items-center gap-1.5 group">
          <span className="font-semibold text-sm leading-tight group-hover:underline underline-offset-2">
            {label}
          </span>
          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function EmptyValue() {
  return <span className="text-sm text-muted-foreground/50 italic">—</span>
}

function CustomersCard({
  value,
  onChange,
}: {
  value: CustomerFields
  onChange: (updated: CustomerFields) => void
}) {
  const [open, setOpen] = useState(false)
  const set = (key: keyof CustomerFields, val: string) =>
    onChange({ ...value, [key]: val })

  return (
    <>
      <div className="rounded-xl border-2 bg-blue-50 border-blue-200 p-5 flex flex-col gap-4">
        <ClickableCardTitle
          icon={Users}
          label="Customers"
          description="Who they are, what they do, their goals and characteristics"
          onEdit={() => setOpen(true)}
        />
        {value.segmentName ? (
          <p className="text-sm font-medium">{value.segmentName}</p>
        ) : (
          <span className="text-sm text-muted-foreground/50 italic">No segment name set</span>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customers</DialogTitle>
            <DialogDescription>
              Who they are, what they do, their goals and characteristics
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CUSTOMER_TEXT_FIELDS.filter((f) => !f.multiline).map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                <Input
                  placeholder={f.placeholder}
                  value={value[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="bg-blue-50/50 border-blue-200 text-sm h-8"
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
                  className="bg-blue-50/50 border-blue-200 resize-none text-sm focus-visible:ring-1"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ProblemSelector({
  problems,
  selectedId,
  onSelect,
  onAdd,
}: {
  problems: Problem[]
  selectedId: number | null
  onSelect: (id: number) => void
  onAdd: () => void
}) {
  return (
    <div className="md:col-span-2 flex flex-col gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground/80">Select a different problem</p>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Problem
        </Button>
      </div>

      {problems.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No problems yet. Add one to start filling in the canvas.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {problems.map((p) => {
            const label = p.text.trim() || "Untitled Problem"
            const truncated = label.length > 55 ? label.slice(0, 52) + "…" : label
            const isSelected = p.id === selectedId
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={[
                  "rounded-lg border px-3 py-1.5 text-xs font-medium text-left transition-colors",
                  isSelected
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-border bg-background hover:border-rose-200 hover:bg-rose-50/50 text-foreground/70",
                ].join(" ")}
              >
                {truncated}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProblemCard({
  problem,
  onChange,
}: {
  problem: Problem
  onChange: (updated: Partial<Problem>) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="rounded-xl border-2 bg-rose-50 border-rose-200 p-5 flex flex-col gap-3">
        <ClickableCardTitle
          icon={AlertCircle}
          label="Problem"
          description="The core problem your customers face"
          onEdit={() => setOpen(true)}
        />
        {problem.text ? (
          <p className="text-sm whitespace-pre-wrap">{problem.text}</p>
        ) : (
          <span className="text-sm text-muted-foreground/50 italic">
            Describe the specific problem or pain point your customers experience...
          </span>
        )}
        <div className="flex flex-col gap-1 border-t border-rose-200 pt-3">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-foreground/50 shrink-0" />
            <p className="text-xs font-medium text-foreground/60">Job to Be Done</p>
          </div>
          {problem.linkedJob ? (
            <p className="text-sm">{problem.linkedJob}</p>
          ) : (
            <EmptyValue />
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Problem</DialogTitle>
            <DialogDescription>The core problem your customers face</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Textarea
              rows={5}
              placeholder="Describe the specific problem or pain point your customers experience..."
              value={problem.text}
              onChange={(e) => onChange({ text: e.target.value })}
              className="bg-rose-50/50 border-rose-200 resize-none text-sm focus-visible:ring-1"
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-foreground/50 shrink-0" />
                <label className="text-xs font-medium text-foreground/60">Job to Be Done</label>
              </div>
              <Input
                placeholder="What job is your customer trying to get done?"
                value={problem.linkedJob}
                onChange={(e) => onChange({ linkedJob: e.target.value })}
                className="bg-rose-50/50 border-rose-200 text-sm h-8"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AlternativesShortcomingsCard({
  items,
  onChange,
}: {
  items: Alternative[]
  onChange: (updated: Alternative[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [altDraft, setAltDraft] = useState("")
  const [shortcomingDrafts, setShortcomingDrafts] = useState<Record<number, string>>({})

  const addAlt = () => {
    const trimmed = altDraft.trim()
    if (!trimmed) return
    onChange([...items, { id: nextAltId++, text: trimmed, shortcomings: [] }])
    setAltDraft("")
  }

  const removeAlt = (id: number) => onChange(items.filter((a) => a.id !== id))

  const addShortcoming = (id: number) => {
    const trimmed = (shortcomingDrafts[id] ?? "").trim()
    if (!trimmed) return
    onChange(items.map((a) => a.id === id ? { ...a, shortcomings: [...a.shortcomings, trimmed] } : a))
    setShortcomingDrafts((d) => ({ ...d, [id]: "" }))
  }

  const removeShortcoming = (altId: number, idx: number) =>
    onChange(items.map((a) => a.id === altId ? { ...a, shortcomings: a.shortcomings.filter((_, i) => i !== idx) } : a))

  const handleOpenChange = (val: boolean) => {
    if (!val) { setAltDraft(""); setShortcomingDrafts({}) }
    setOpen(val)
  }

  return (
    <>
      <div className="rounded-xl border-2 bg-purple-50 border-purple-200 p-5 flex flex-col gap-3">
        <ClickableCardTitle
          icon={GitFork}
          label="Alternatives & Shortcomings"
          description="How customers currently solve this problem and why those solutions fall short"
          onEdit={() => setOpen(true)}
        />
        {items.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {items.map((alt) => (
              <li key={alt.id} className="flex flex-col gap-1">
                <p className="text-sm font-medium">{alt.text}</p>
                {alt.shortcomings.length > 0 && (
                  <ul className="flex flex-col gap-0.5 pl-3">
                    {alt.shortcomings.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <ThumbsDown className="h-3 w-3 mt-0.5 shrink-0 text-purple-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground/50 italic">No alternatives added yet</span>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Alternatives & Shortcomings</DialogTitle>
            <DialogDescription>
              How customers currently solve this problem and why those solutions fall short
            </DialogDescription>
          </DialogHeader>

          {/* Add new alternative */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-foreground/60">Add an alternative</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Spreadsheets, hiring a consultant, manual process..."
                value={altDraft}
                onChange={(e) => setAltDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAlt() } }}
                className="bg-purple-50/50 border-purple-200 text-sm h-8 flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addAlt}
                disabled={!altDraft.trim()}
                className="border-purple-200 bg-white/70 hover:bg-white gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>

          {/* Alternatives list */}
          {items.length > 0 && (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh]">
              <p className="text-xs font-medium text-foreground/60">
                {items.length} alternative{items.length !== 1 ? "s" : ""}
              </p>
              {items.map((alt) => (
                <div key={alt.id} className="rounded-lg border border-purple-200 bg-purple-50/40 p-3 flex flex-col gap-3">
                  {/* Alternative row */}
                  <div className="flex items-center gap-2">
                    <GitFork className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                    <span className="text-sm font-medium flex-1">{alt.text}</span>
                    <button
                      onClick={() => removeAlt(alt.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Shortcomings subsection */}
                  <div className="flex flex-col gap-2 pl-3 border-l-2 border-purple-200">
                    <p className="text-xs font-medium text-foreground/60">Shortcomings</p>
                    {alt.shortcomings.length > 0 && (
                      <ul className="flex flex-col gap-1">
                        {alt.shortcomings.map((s, i) => (
                          <li key={i} className="flex items-center gap-2 bg-white/80 rounded px-2.5 py-1.5 text-xs">
                            <ThumbsDown className="h-3 w-3 shrink-0 text-purple-400" />
                            <span className="flex-1">{s}</span>
                            <button
                              onClick={() => removeShortcoming(alt.id, i)}
                              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Describe a shortcoming..."
                        value={shortcomingDrafts[alt.id] ?? ""}
                        onChange={(e) => setShortcomingDrafts((d) => ({ ...d, [alt.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addShortcoming(alt.id) } }}
                        className="bg-white/80 border-purple-200 text-xs h-7 flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addShortcoming(alt.id)}
                        disabled={!(shortcomingDrafts[alt.id] ?? "").trim()}
                        className="h-7 text-xs border-purple-200 bg-white/80 hover:bg-white px-2 shrink-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function QuantifiableImpactCard({
  items,
  onChange,
}: {
  items: ImpactItem[]
  onChange: (updated: ImpactItem[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<ImpactItem>({ category: "", description: "" })

  const add = () => {
    if (!draft.category.trim() && !draft.description.trim()) return
    onChange([...items, { category: draft.category.trim(), description: draft.description.trim() }])
    setDraft({ category: "", description: "" })
  }

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))

  const handleOpenChange = (val: boolean) => {
    if (!val) setDraft({ category: "", description: "" })
    setOpen(val)
  }

  return (
    <>
      <div className="rounded-xl border-2 bg-orange-50 border-orange-200 p-5 flex flex-col gap-3">
        <ClickableCardTitle
          icon={BarChart2}
          label="Quantifiable Impact"
          description="What is the measurable cost of the problem?"
          onEdit={() => setOpen(true)}
        />
        {items.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 text-sm">
                <span className="shrink-0 font-medium text-orange-700 min-w-[7rem]">
                  {item.category || "—"}
                </span>
                <span className="flex-1 text-muted-foreground border-l border-orange-200 pl-2">
                  {item.description || "—"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground/50 italic">No impacts added yet</span>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quantifiable Impact</DialogTitle>
            <DialogDescription>What is the measurable cost of the problem?</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {items.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 bg-orange-50/50 rounded-lg px-3 py-2 text-sm">
                    <span className="shrink-0 font-medium text-orange-700 min-w-[7rem]">
                      {item.category || "—"}
                    </span>
                    <span className="flex-1 text-muted-foreground border-l border-orange-200 pl-2">
                      {item.description || "—"}
                    </span>
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
            <div className="flex flex-col gap-2">
              <datalist id="impact-categories">
                {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
              </datalist>
              <div className="flex gap-2">
                <Input
                  list="impact-categories"
                  placeholder="Type or select category..."
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  className="bg-orange-50/50 border-orange-200 text-sm h-8 w-2/5 shrink-0"
                />
                <Input
                  placeholder="Describe the impact..."
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  className="bg-orange-50/50 border-orange-200 text-sm h-8 flex-1"
                />
              </div>
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
        </DialogContent>
      </Dialog>
    </>
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
  const [open, setOpen] = useState(false)
  const FieldIcon = field.icon

  return (
    <>
      <div className={`rounded-xl border-2 p-5 flex flex-col gap-3 ${field.color}`}>
        <ClickableCardTitle
          icon={FieldIcon}
          label={field.label}
          description={field.description}
          onEdit={() => setOpen(true)}
        />
        {value ? (
          <p className="text-sm whitespace-pre-wrap">{value}</p>
        ) : (
          <span className="text-sm text-muted-foreground/50 italic">{field.placeholder}</span>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{field.label}</DialogTitle>
            <DialogDescription>{field.description}</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={6}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="resize-none text-sm focus-visible:ring-1"
          />
        </DialogContent>
      </Dialog>
    </>
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

let nextProblemId = 1

export default function ProblemDiscoveryPage() {
  const navItem = getNavigationItem("/problem-discovery")
  const Icon = navItem?.icon
  const router = useRouter()

  const [customer, setCustomer] = useState<CustomerFields>(DEFAULT_CUSTOMER)
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null)

  const selectedProblem = problems.find((p) => p.id === selectedProblemId) ?? null

  const updateProblem = (id: number, patch: Partial<Problem>) =>
    setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const addProblem = () => {
    const id = nextProblemId++
    const newProblem: Problem = { id, ...DEFAULT_PROBLEM }
    setProblems((prev) => [...prev, newProblem])
    setSelectedProblemId(id)
  }

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
                Click a card title to edit its contents.
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomersCard value={customer} onChange={setCustomer} />

            <ProblemSelector
              problems={problems}
              selectedId={selectedProblemId}
              onSelect={setSelectedProblemId}
              onAdd={addProblem}
            />

            {selectedProblem && (
              <>
                <ProblemCard
                  problem={selectedProblem}
                  onChange={(patch) => updateProblem(selectedProblem.id, patch)}
                />

                <CanvasCard
                  key={`context-${selectedProblem.id}`}
                  field={CANVAS_FIELDS_AFTER[0]}
                  value={selectedProblem.context}
                  onChange={(val) => updateProblem(selectedProblem.id, { context: val })}
                />

                <AlternativesShortcomingsCard
                  key={`alt-${selectedProblem.id}`}
                  items={selectedProblem.alternatives}
                  onChange={(updated) => updateProblem(selectedProblem.id, { alternatives: updated })}
                />

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CanvasCard
                    key={`emotionalImpact-${selectedProblem.id}`}
                    field={CANVAS_FIELDS_AFTER[1]}
                    value={selectedProblem.emotionalImpact}
                    onChange={(val) => updateProblem(selectedProblem.id, { emotionalImpact: val })}
                  />

                  <QuantifiableImpactCard
                    key={`impact-${selectedProblem.id}`}
                    items={selectedProblem.impacts}
                    onChange={(updated) => updateProblem(selectedProblem.id, { impacts: updated })}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
