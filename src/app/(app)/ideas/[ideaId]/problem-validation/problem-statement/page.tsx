"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useIdeas } from "@/context/ideas-context"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Users, AlertCircle, GitFork, Clock, ThumbsDown, Heart, BarChart2,
  Pencil, Plus, X, Briefcase,
} from "lucide-react"
import type { CustomerFields, ImpactItem } from "@/types/idea"

const IMPACT_CATEGORIES = [
  "Time Lost", "Money Wasted", "Error Rates", "Customer Churn",
  "Support Tickets", "Productivity Loss", "Revenue Impact", "Compliance Risk",
]

const CUSTOMER_TEXT_FIELDS: {
  key: keyof CustomerFields; label: string; placeholder: string; multiline?: boolean
}[] = [
  { key: "segmentName", label: "Segment Name", placeholder: "e.g. Freelance Designers..." },
  { key: "occupation", label: "Occupation", placeholder: "e.g. Product Manager..." },
  { key: "ageRange", label: "Age Range", placeholder: "e.g. 25–40" },
  { key: "whoTheyAre", label: "Who They Are", placeholder: "Describe their background...", multiline: true },
  { key: "whatTheyDo", label: "What They Do", placeholder: "Describe their daily activities...", multiline: true },
  { key: "goalsAndMotivations", label: "Goals & Motivations", placeholder: "What are they trying to achieve?", multiline: true },
  { key: "frustrationsAndChallenges", label: "Frustrations & Challenges", placeholder: "What blocks them?", multiline: true },
]

function ClickableCardTitle({
  icon: Icon, label, description, onEdit,
}: {
  icon: React.ElementType; label: string; description: string; onEdit: () => void
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

function SimpleTextCard({
  icon, label, description, value, placeholder, color, dialogColor, onChange,
}: {
  icon: React.ElementType; label: string; description: string; value: string;
  placeholder: string; color: string; dialogColor: string; onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className={`rounded-xl border-2 p-5 flex flex-col gap-3 ${color}`}>
        <ClickableCardTitle icon={icon} label={label} description={description} onEdit={() => setOpen(true)} />
        {value ? (
          <p className="text-sm whitespace-pre-wrap">{value}</p>
        ) : (
          <span className="text-sm text-muted-foreground/50 italic">{placeholder}</span>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={6}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`resize-none text-sm focus-visible:ring-1 ${dialogColor}`}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function ProblemStatementPage() {
  const params = useParams()
  const router = useRouter()
  const ideaId = Number(params.ideaId)
  const { getIdea, updateIdea } = useIdeas()

  const idea = getIdea(ideaId)

  const [customerOpen, setCustomerOpen] = useState(false)
  const [impactOpen, setImpactOpen] = useState(false)
  const [impactDraft, setImpactDraft] = useState<ImpactItem>({ category: "", description: "" })
  const [altOpen, setAltOpen] = useState(false)
  const [altDraft, setAltDraft] = useState("")

  if (!idea) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-muted-foreground text-sm">Idea not found.</p>
        <Button variant="outline" onClick={() => router.push("/ideas")}>Back to Ideas</Button>
      </div>
    )
  }

  const customer = idea.customer
  const setCustomer = (val: CustomerFields) => updateIdea(ideaId, { customer: val })
  const setCustomerField = (key: keyof CustomerFields, val: string) =>
    setCustomer({ ...customer, [key]: val })

  const validValidation = idea.validations.find((v) => v.status === "valid")
  const anyValidation = idea.validations[0] ?? null
  const activeValidation = validValidation ?? anyValidation

  const coreProblem = activeValidation
    ? idea.problems.find((p) => p.id === activeValidation.problemId)
    : idea.problems[0] ?? null

  const alternatives = activeValidation?.alternatives ?? []
  const contextWhen = activeValidation?.contextWhen ?? ""
  const shortcomings = activeValidation?.shortcomings ?? ""
  const emotionalImpact = activeValidation?.emotionalImpact ?? ""
  const impacts = activeValidation?.impacts ?? []

  const updateValidationField = (patch: Partial<typeof activeValidation>) => {
    if (!activeValidation) return
    const next = idea.validations.map((v) =>
      v.id === activeValidation.id ? { ...v, ...patch } : v
    )
    updateIdea(ideaId, { validations: next })
  }

  const addImpact = () => {
    if (!impactDraft.category.trim() && !impactDraft.description.trim()) return
    updateValidationField({ impacts: [...impacts, { ...impactDraft }] })
    setImpactDraft({ category: "", description: "" })
  }
  const removeImpact = (i: number) =>
    updateValidationField({ impacts: impacts.filter((_, idx) => idx !== i) })

  const addAlternative = () => {
    const trimmed = altDraft.trim()
    if (!trimmed) return
    updateValidationField({ alternatives: [...alternatives, trimmed] })
    setAltDraft("")
  }
  const removeAlternative = (i: number) =>
    updateValidationField({ alternatives: alternatives.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">Problem Statement</h1>
        <p className="text-sm text-muted-foreground">Click any card title to edit its contents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Segment Card */}
        <div className="rounded-xl border-2 bg-blue-50 border-blue-200 p-5 flex flex-col gap-3">
          <ClickableCardTitle
            icon={Users}
            label="Customer Segment"
            description="Who they are, what they do, goals and characteristics"
            onEdit={() => setCustomerOpen(true)}
          />
          {customer.segmentName ? (
            <p className="text-sm font-medium">{customer.segmentName}</p>
          ) : (
            <span className="text-sm text-muted-foreground/50 italic">No segment set</span>
          )}
          {(customer.occupation || customer.ageRange) && (
            <p className="text-xs text-muted-foreground">
              {[customer.occupation, customer.ageRange].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Core Problem Card */}
        <div className="rounded-xl border-2 bg-rose-50 border-rose-200 p-5 flex flex-col gap-3">
          <ClickableCardTitle
            icon={AlertCircle}
            label="Core Problem"
            description="The core problem your customers face"
            onEdit={() => router.push(`/ideas/${ideaId}/problem-validation/pick-a-problem`)}
          />
          {coreProblem?.text ? (
            <p className="text-sm whitespace-pre-wrap">{coreProblem.text}</p>
          ) : (
            <span className="text-sm text-muted-foreground/50 italic">
              No problem selected — pick a problem to validate first
            </span>
          )}
          {coreProblem && (() => {
            const job = idea.jobs.find((j) => j.id === coreProblem.jobId)
            return job?.job ? (
              <div className="flex flex-col gap-1 border-t border-rose-200 pt-3">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-foreground/50 shrink-0" />
                  <p className="text-xs font-medium text-foreground/60">Job to Be Done</p>
                </div>
                <p className="text-sm">{job.job}</p>
              </div>
            ) : null
          })()}
        </div>

        {/* Context Card */}
        <SimpleTextCard
          icon={Clock}
          label="Context"
          description="When and where does the problem occur?"
          value={contextWhen}
          placeholder="Describe the situation, trigger, or environment..."
          color="bg-amber-50 border-amber-200"
          dialogColor="bg-amber-50/50 border-amber-200"
          onChange={(val) => updateValidationField({ contextWhen: val })}
        />

        {/* Alternatives Card */}
        <div className="rounded-xl border-2 bg-purple-50 border-purple-200 p-5 flex flex-col gap-3">
          <ClickableCardTitle
            icon={GitFork}
            label="Alternatives"
            description="How customers currently solve or work around the problem"
            onEdit={() => setAltOpen(true)}
          />
          {alternatives.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {alternatives.map((alt, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                  <span>{alt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyValue />
          )}
        </div>

        {/* Shortcomings Card */}
        <SimpleTextCard
          icon={ThumbsDown}
          label="Shortcomings"
          description="Why existing alternatives fall short"
          value={shortcomings}
          placeholder="Explain why existing solutions fail or frustrate customers..."
          color="bg-purple-50 border-purple-200"
          dialogColor="bg-purple-50/50 border-purple-200"
          onChange={(val) => updateValidationField({ shortcomings: val })}
        />

        {/* Emotional Impact Card */}
        <SimpleTextCard
          icon={Heart}
          label="Emotional Impact"
          description="How does the problem make customers feel?"
          value={emotionalImpact}
          placeholder="Describe frustration, anxiety, stress, or other emotions..."
          color="bg-pink-50 border-pink-200"
          dialogColor="bg-pink-50/50 border-pink-200"
          onChange={(val) => updateValidationField({ emotionalImpact: val })}
        />

        {/* Quantifiable Impact Card */}
        <div className="rounded-xl border-2 bg-orange-50 border-orange-200 p-5 flex flex-col gap-3">
          <ClickableCardTitle
            icon={BarChart2}
            label="Quantifiable Impact"
            description="What is the measurable cost of the problem?"
            onEdit={() => setImpactOpen(true)}
          />
          {impacts.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {impacts.map((item, i) => (
                <li key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 text-sm">
                  <span className="shrink-0 font-medium text-orange-700 min-w-[7rem]">{item.category || "—"}</span>
                  <span className="flex-1 text-muted-foreground border-l border-orange-200 pl-2">{item.description || "—"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyValue />
          )}
        </div>
      </div>

      {/* Customer dialog */}
      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Segment</DialogTitle>
            <DialogDescription>Who they are, what they do, goals and characteristics</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CUSTOMER_TEXT_FIELDS.filter((f) => !f.multiline).map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                <Input
                  placeholder={f.placeholder}
                  value={customer[f.key]}
                  onChange={(e) => setCustomerField(f.key, e.target.value)}
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
                  value={customer[f.key]}
                  onChange={(e) => setCustomerField(f.key, e.target.value)}
                  className="bg-blue-50/50 border-blue-200 resize-none text-sm focus-visible:ring-1"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Alternatives dialog */}
      <Dialog open={altOpen} onOpenChange={setAltOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Alternatives</DialogTitle>
            <DialogDescription>How customers currently solve or work around the problem</DialogDescription>
          </DialogHeader>
          {alternatives.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {alternatives.map((item, i) => (
                <li key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <span className="flex-1">{item}</span>
                  <button onClick={() => removeAlternative(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Type an alternative and press Enter..."
              value={altDraft}
              onChange={(e) => setAltDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAlternative() } }}
              className="text-sm h-9"
            />
            <Button variant="outline" onClick={addAlternative} disabled={!altDraft.trim()}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quantifiable impact dialog */}
      <Dialog open={impactOpen} onOpenChange={(v) => { setImpactOpen(v); if (!v) setImpactDraft({ category: "", description: "" }) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quantifiable Impact</DialogTitle>
            <DialogDescription>What is the measurable cost of the problem?</DialogDescription>
          </DialogHeader>
          {impacts.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {impacts.map((item, i) => (
                <li key={i} className="flex items-center gap-2 bg-orange-50/50 rounded-lg px-3 py-2 text-sm">
                  <span className="shrink-0 font-medium text-orange-700 min-w-[7rem]">{item.category || "—"}</span>
                  <span className="flex-1 text-muted-foreground border-l border-orange-200 pl-2">{item.description || "—"}</span>
                  <button onClick={() => removeImpact(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2">
            <datalist id="impact-cats-ps">
              {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
            <div className="flex gap-2">
              <Input
                list="impact-cats-ps"
                placeholder="Type or select category..."
                value={impactDraft.category}
                onChange={(e) => setImpactDraft((d) => ({ ...d, category: e.target.value }))}
                className="bg-orange-50/50 border-orange-200 text-sm h-9 w-2/5 shrink-0"
              />
              <Input
                placeholder="Describe the impact..."
                value={impactDraft.description}
                onChange={(e) => setImpactDraft((d) => ({ ...d, description: e.target.value }))}
                className="bg-orange-50/50 border-orange-200 text-sm h-9 flex-1"
              />
            </div>
            <Button
              variant="outline"
              onClick={addImpact}
              disabled={!impactDraft.category.trim() && !impactDraft.description.trim()}
              className="w-full border-orange-200 bg-white/70 hover:bg-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Quantifiable Impact
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
