"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AlertCircle, GitFork, Heart, BarChart2, Plus, X, CheckCircle2, HelpCircle, XCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProblemValidation } from "../context"
import type { AlternativeItem, ImpactItem, ValidationStatus } from "@/types/idea"

const IMPACT_CATEGORIES = [
  "Time Lost", "Money Wasted", "Error Rates", "Customer Churn",
  "Support Tickets", "Productivity Loss", "Revenue Impact", "Compliance Risk",
]

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-foreground/70" />
      <span className="font-semibold text-sm">{label}</span>
    </div>
  )
}

function TagInput({
  tags, onChange, placeholder, chipBorder,
}: {
  tags: string[]; onChange: (t: string[]) => void; placeholder: string; chipBorder?: string
}) {
  const [draft, setDraft] = useState("")
  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...tags, v])
    setDraft("")
  }
  return (
    <div className="flex flex-col gap-1.5">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className={`inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-xs border ${chipBorder ?? "border-border"}`}>
              {t}
              <button onClick={() => onChange(tags.filter((x) => x !== t))} className="text-muted-foreground hover:text-destructive">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <Input
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          className="h-7 text-xs"
        />
        <Button variant="outline" size="sm" className="h-7 px-2 shrink-0" onClick={add} disabled={!draft.trim()}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

const STATUS_OPTIONS: { value: ValidationStatus; label: string; icon: React.ElementType; iconClass: string }[] = [
  { value: "unvalidated", label: "Not validated", icon: Clock,        iconClass: "text-muted-foreground" },
  { value: "valid",       label: "Valid",         icon: CheckCircle2, iconClass: "text-green-600" },
  { value: "unsure",      label: "Unsure",        icon: HelpCircle,   iconClass: "text-orange-500" },
  { value: "invalid",     label: "Invalid",       icon: XCircle,      iconClass: "text-red-500" },
]

function StatusSelect({ status, setStatus }: { status: ValidationStatus; setStatus: (v: ValidationStatus) => void }) {
  const current = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0]
  const CurrentIcon = current.icon
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Validation Status</span>
      <Select value={status} onValueChange={(v) => setStatus(v as ValidationStatus)}>
        <SelectTrigger className="h-8 w-40 bg-white text-xs font-medium">
          <SelectValue>
            <span className="flex items-center gap-1.5">
              <CurrentIcon className={`h-3.5 w-3.5 shrink-0 ${current.iconClass}`} />
              {current.label}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, iconClass }) => (
            <SelectItem key={value} value={value}>
              <span className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProblemStatementPage() {
  const dispatch = useDispatch<AppDispatch>()

  const {
    problemId,
    alternatives, setAlternatives,
    emotionalImpact, setEmotionalImpact,
    quantifiableImpacts, setQuantifiableImpacts,
    status, setStatus,
  } = useProblemValidation()

  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  // ── helpers ──

  const updateProblem = (patch: Parameters<typeof dispatch.problems.update>[0]["patch"]) =>
    dispatch.problems.update({ id: problemId, patch })

  // quantifiable impacts
  const updateImpact = (i: number, patch: Partial<ImpactItem>) =>
    setQuantifiableImpacts(quantifiableImpacts.map((item, idx) => idx === i ? { ...item, ...patch } : item))
  const removeImpact = (i: number) =>
    setQuantifiableImpacts(quantifiableImpacts.filter((_, idx) => idx !== i))
  const addImpact = () =>
    setQuantifiableImpacts([...quantifiableImpacts, { category: "", description: "" }])

  // emotional impact
  const updateEmotion = (i: number, value: string) =>
    setEmotionalImpact(emotionalImpact.map((item, idx) => idx === i ? value : item))
  const removeEmotion = (i: number) =>
    setEmotionalImpact(emotionalImpact.filter((_, idx) => idx !== i))
  const addEmotion = () =>
    setEmotionalImpact([...emotionalImpact, ""])

  // alternatives
  const updateAltText = (i: number, value: string) =>
    setAlternatives(alternatives.map((alt, idx) => idx === i ? { ...alt, text: value } : alt))
  const removeAlternative = (i: number) =>
    setAlternatives(alternatives.filter((_, idx) => idx !== i))
  const addAlternative = () =>
    setAlternatives([...alternatives, { id: Date.now(), text: "", shortcomings: [] }])

  const updateShortcoming = (altIdx: number, scIdx: number, value: string) =>
    setAlternatives(alternatives.map((alt, i) =>
      i === altIdx ? { ...alt, shortcomings: alt.shortcomings.map((sc, j) => j === scIdx ? value : sc) } : alt
    ))
  const removeShortcoming = (altIdx: number, scIdx: number) =>
    setAlternatives(alternatives.map((alt, i) =>
      i === altIdx ? { ...alt, shortcomings: alt.shortcomings.filter((_, j) => j !== scIdx) } : alt
    ))
  const addShortcoming = (altIdx: number) =>
    setAlternatives(alternatives.map((alt, i) =>
      i === altIdx ? { ...alt, shortcomings: [...alt.shortcomings, ""] } : alt
    ))

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Problem Statement</h1>
            <p className="text-sm text-muted-foreground">All fields are editable directly on the canvas.</p>
          </div>
          <StatusSelect status={status} setStatus={setStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

          {/* ── Core Problem ── */}
        <div className="rounded-xl border-2 bg-rose-50 border-rose-200 p-5 flex flex-col gap-4">
          <SectionTitle icon={AlertCircle} label="Core Problem" />

          {problem ? (
            <>
              <Textarea
                rows={3}
                placeholder="Describe the problem…"
                value={problem.description}
                onChange={(e) => updateProblem({ description: e.target.value })}
                className="resize-none text-sm bg-white/80 border-rose-200 focus-visible:ring-rose-300"
              />

              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Customer Segments</p>
                <TagInput
                  tags={problem.customerSegments}
                  onChange={(v) => updateProblem({ customerSegments: v })}
                  placeholder="Add segment…"
                  chipBorder="border-rose-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Context</p>
                <TagInput
                  tags={problem.contexts}
                  onChange={(v) => updateProblem({ contexts: v })}
                  placeholder="Add context…"
                  chipBorder="border-rose-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Jobs to Be Done</p>
                <TagInput
                  tags={problem.jobsToBeDone}
                  onChange={(v) => updateProblem({ jobsToBeDone: v })}
                  placeholder="Add job…"
                  chipBorder="border-rose-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Problem Types</p>
                <TagInput
                  tags={problem.problemTypes}
                  onChange={(v) => updateProblem({ problemTypes: v })}
                  placeholder="Add type…"
                  chipBorder="border-rose-200"
                />
              </div>

            </>
          ) : (
            <span className="text-sm text-muted-foreground/50 italic">No problem selected</span>
          )}
        </div>

        {/* ── Alternatives & Shortcomings ── */}
        <div className="rounded-xl border-2 bg-purple-50 border-purple-200 p-5 flex flex-col gap-3">
          <SectionTitle icon={GitFork} label="Alternatives & Shortcomings" />

          {alternatives.length > 0 && (
            <ul className="flex flex-col gap-3">
              {alternatives.map((alt, i) => (
                <li key={alt.id} className="flex flex-col gap-2 bg-white/60 rounded-lg px-3 py-2.5 border border-purple-100">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Alternative solution…"
                      value={alt.text}
                      onChange={(e) => updateAltText(i, e.target.value)}
                      className="text-sm h-8 bg-transparent border-purple-200 font-medium"
                    />
                    <button onClick={() => removeAlternative(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {alt.shortcomings.length > 0 && (
                    <ul className="flex flex-col gap-1.5 pl-2">
                      {alt.shortcomings.map((sc, j) => (
                        <li key={j} className="flex gap-1.5 items-center">
                          <span className="text-muted-foreground text-xs shrink-0">–</span>
                          <Input
                            placeholder="Shortcoming…"
                            value={sc}
                            onChange={(e) => updateShortcoming(i, j, e.target.value)}
                            className="text-xs h-7 bg-transparent border-purple-100"
                          />
                          <button onClick={() => removeShortcoming(i, j)} className="shrink-0 text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => addShortcoming(i)}
                    className="self-start text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add shortcoming
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={addAlternative}
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800 mt-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Alternative
          </Button>
        </div>

        {/* ── Emotional Impact ── */}
        <div className="rounded-xl border-2 bg-pink-50 border-pink-200 p-5 flex flex-col gap-3">
          <SectionTitle icon={Heart} label="Emotional Impact" />

          {emotionalImpact.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {emotionalImpact.map((item, i) => (
                <li key={i} className="flex gap-2 items-center">
                  <span className="text-muted-foreground text-sm shrink-0">–</span>
                  <Input
                    placeholder="e.g. Frustrated, overwhelmed…"
                    value={item}
                    onChange={(e) => updateEmotion(i, e.target.value)}
                    className="text-sm h-8 bg-white/70 border-pink-200"
                  />
                  <button onClick={() => removeEmotion(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={addEmotion}
            className="w-full border-pink-200 text-pink-700 hover:bg-pink-100 hover:text-pink-800 mt-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Emotional Impact
          </Button>
        </div>

        {/* ── Quantifiable Impact ── */}
        <div className="rounded-xl border-2 bg-orange-50 border-orange-200 p-5 flex flex-col gap-3">
          <SectionTitle icon={BarChart2} label="Quantifiable Impact" />

          {quantifiableImpacts.length > 0 && (
            <>
              <datalist id="impact-cats-ps">
                {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
              </datalist>
              <ul className="flex flex-col gap-1.5">
                {quantifiableImpacts.map((item, i) => (
                  <li key={i} className="flex gap-2 items-center">
                    <Input
                      list="impact-cats-ps"
                      placeholder="Category…"
                      value={item.category}
                      onChange={(e) => updateImpact(i, { category: e.target.value })}
                      className="text-sm h-8 bg-white/70 border-orange-200 w-2/5 shrink-0 font-medium text-orange-800"
                    />
                    <Input
                      placeholder="Describe impact…"
                      value={item.description}
                      onChange={(e) => updateImpact(i, { description: e.target.value })}
                      className="text-sm h-8 bg-white/70 border-orange-200 flex-1"
                    />
                    <button onClick={() => removeImpact(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={addImpact}
            className="w-full border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-800 mt-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Quantifiable Impact
          </Button>
        </div>

        </div>{/* end grid */}

      </CardContent>
    </Card>
  )
}
