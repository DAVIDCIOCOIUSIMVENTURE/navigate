"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useIdeas } from "@/store/ideas-hooks"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Users, AlertCircle, GitFork, Clock, Heart, BarChart2,
  Pencil, Plus, X, Briefcase,
} from "lucide-react"
import type { ExistingSolutionItem, CustomerFields, ImpactItem, Problem } from "@/types/idea"

const IMPACT_CATEGORIES = [
  "Time Lost", "Money Wasted", "Error Rates", "Customer Churn",
  "Support Tickets", "Productivity Loss", "Revenue Impact", "Compliance Risk",
]

const CUSTOMER_TEXT_FIELDS: {
  key: keyof CustomerFields; label: string; placeholder: string; multiline?: boolean
}[] = [
  { key: "segmentName", label: "Segment Name", placeholder: "e.g. Freelance Designers..." },
  { key: "ageFrom", label: "Age From", placeholder: "e.g. 25" },
  { key: "ageTo", label: "Age To", placeholder: "e.g. 40" },
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
  const [solutionOpen, setAltOpen] = useState(false)
  const [solutionDraft, setAltDraft] = useState("")
  const [scDrafts, setScDrafts] = useState<Record<number, string>>({})

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

  const allProblems = idea.jobs.flatMap((j) => j.problems)
  const filledProblems = allProblems.filter((p) => p.text.trim())
  const activeProblem: Problem | null =
    filledProblems.find((p) => p.validationStatus === "valid") ??
    filledProblems.find((p) => p.validationStatus !== "unvalidated") ??
    filledProblems[0] ??
    null

  const coreProblem = activeProblem

  const existingSolutions = activeProblem?.existingSolutions ?? []
  const contextWhen = activeProblem?.contextWhen ?? ""
  const emotionalImpact = activeProblem?.emotionalImpact ?? ""
  const impacts = activeProblem?.impacts ?? []

  const updateActiveProblemField = (patch: Partial<Problem>) => {
    if (!activeProblem) return
    const updatedJobs = idea.jobs.map((j) => ({
      ...j,
      problems: j.problems.map((p) => (p.id === activeProblem.id ? { ...p, ...patch } : p)),
    }))
    updateIdea(ideaId, { jobs: updatedJobs })
  }

  const addImpact = () => {
    if (!impactDraft.category.trim() && !impactDraft.description.trim()) return
    updateActiveProblemField({ impacts: [...impacts, { ...impactDraft }] })
    setImpactDraft({ category: "", description: "" })
  }
  const removeImpact = (i: number) =>
    updateActiveProblemField({ impacts: impacts.filter((_, idx) => idx !== i) })

  const addSolution = () => {
    const trimmed = solutionDraft.trim()
    if (!trimmed) return
    const newItem: ExistingSolutionItem = { id: Date.now(), text: trimmed, shortcomings: [], impacts: [] }
    updateActiveProblemField({ existingSolutions: [...existingSolutions, newItem] })
    setAltDraft("")
  }
  const removeSolution = (i: number) =>
    updateActiveProblemField({ existingSolutions: existingSolutions.filter((_, idx) => idx !== i) })

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
          {(customer.ageFrom || customer.ageTo) && (
            <p className="text-xs text-muted-foreground">
              {[customer.ageFrom, customer.ageTo].filter(Boolean).join(" – ")}
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
              No problem selected. Pick a problem to validate first.
            </span>
          )}
          {coreProblem && (() => {
            const job = idea.jobs.find((j) => j.problems.some((p) => p.id === coreProblem.id))
            return job?.name ? (
              <div className="flex flex-col gap-1 border-t border-rose-200 pt-3">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-foreground/50 shrink-0" />
                  <p className="text-xs font-medium text-foreground/60">Job to Be Done</p>
                </div>
                <p className="text-sm">{job.name}</p>
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
          onChange={(val) => updateActiveProblemField({ contextWhen: val })}
        />

        {/* Existing Solutions & Shortcomings Card */}
        <div className="rounded-xl border-2 bg-purple-50 border-purple-200 p-5 flex flex-col gap-3">
          <ClickableCardTitle
            icon={GitFork}
            label="Existing Solutions & Shortcomings"
            description="How customers solve the problem and why those solutions fall short"
            onEdit={() => setAltOpen(true)}
          />
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
            <EmptyValue />
          )}
        </div>

        {/* Emotional Impact Card */}
        <SimpleTextCard
          icon={Heart}
          label="Emotional Impact"
          description="How does the problem make customers feel?"
          value={emotionalImpact}
          placeholder="Describe frustration, anxiety, stress, or other emotions..."
          color="bg-pink-50 border-pink-200"
          dialogColor="bg-pink-50/50 border-pink-200"
          onChange={(val) => updateActiveProblemField({ emotionalImpact: val })}
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
                <label className="text-sm font-medium text-foreground/70">{f.label}</label>
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
                <label className="text-sm font-medium text-foreground/70">{f.label}</label>
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

      {/* Existing Solutions & Shortcomings dialog */}
      <Dialog open={solutionOpen} onOpenChange={setAltOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Existing Solutions & Shortcomings</DialogTitle>
            <DialogDescription>How customers solve the problem and why those solutions fall short</DialogDescription>
          </DialogHeader>
          {existingSolutions.length > 0 && (
            <ul className="flex flex-col gap-3">
              {existingSolutions.map((item, i) => (
                <li key={i} className="flex flex-col gap-2 bg-muted/50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm font-medium">{item.text}</span>
                    <button onClick={() => removeSolution(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {item.shortcomings.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {item.shortcomings.map((sc, j) => (
                        <li key={j} className="flex items-center gap-2 bg-background rounded px-2 py-1 text-sm">
                          <span className="flex-1">{sc}</span>
                          <button
                            onClick={() =>
                              updateActiveProblemField({
                                existingSolutions: existingSolutions.map((alt, idx) =>
                                  idx === i ? { ...alt, shortcomings: alt.shortcomings.filter((_, k) => k !== j) } : alt
                                ),
                              })
                            }
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a shortcoming..."
                      value={scDrafts[i] ?? ""}
                      onChange={(e) => setScDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const trimmed = (scDrafts[i] ?? "").trim()
                          if (!trimmed) return
                          updateActiveProblemField({
                            existingSolutions: existingSolutions.map((alt, idx) =>
                              idx === i ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
                            ),
                          })
                          setScDrafts((prev) => ({ ...prev, [i]: "" }))
                        }
                      }}
                      className="text-sm h-8 bg-background"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!(scDrafts[i] ?? "").trim()}
                      onClick={() => {
                        const trimmed = (scDrafts[i] ?? "").trim()
                        if (!trimmed) return
                        updateActiveProblemField({
                          existingSolutions: existingSolutions.map((alt, idx) =>
                            idx === i ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
                          ),
                        })
                        setScDrafts((prev) => ({ ...prev, [i]: "" }))
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Type an existing solution and press Enter..."
              value={solutionDraft}
              onChange={(e) => setAltDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSolution() } }}
              className="text-sm h-9"
            />
            <Button variant="outline" onClick={addSolution} disabled={!solutionDraft.trim()}>
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
