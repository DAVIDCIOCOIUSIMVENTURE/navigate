"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { AlertCircle, GitFork, Clock, Heart, BarChart2, Pencil, Plus, X } from "lucide-react"
import { useProblemValidation } from "../context"
import { getProblemLabel } from "@/store/problems-model"
import type { AlternativeItem, ImpactItem } from "@/types/idea"

const IMPACT_CATEGORIES = [
  "Time Lost", "Money Wasted", "Error Rates", "Customer Churn",
  "Support Tickets", "Productivity Loss", "Revenue Impact", "Compliance Risk",
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
  const router = useRouter()
  const {
    problemId,
    alternatives, setAlternatives,
    contextWhen, setContextWhen,
    emotionalImpact, setEmotionalImpact,
    impacts, setImpacts,
  } = useProblemValidation()

  const problems = useSelector((state: RootState) => state.problems.problems)
  const problem = problems.find((p) => p.id === problemId)
  const selectedLabel = problem ? getProblemLabel(problem) : null

  const [impactOpen, setImpactOpen] = useState(false)
  const [impactDraft, setImpactDraft] = useState<ImpactItem>({ category: "", description: "" })
  const [altOpen, setAltOpen] = useState(false)
  const [altDraft, setAltDraft] = useState("")
  const [scDrafts, setScDrafts] = useState<Record<number, string>>({})

  const addImpact = () => {
    if (!impactDraft.category.trim() && !impactDraft.description.trim()) return
    setImpacts([...impacts, { ...impactDraft }])
    setImpactDraft({ category: "", description: "" })
  }
  const removeImpact = (i: number) => setImpacts(impacts.filter((_, idx) => idx !== i))

  const addAlternative = () => {
    const trimmed = altDraft.trim()
    if (!trimmed) return
    const newItem: AlternativeItem = { id: Date.now(), text: trimmed, shortcomings: [] }
    setAlternatives([...alternatives, newItem])
    setAltDraft("")
  }
  const removeAlternative = (i: number) => setAlternatives(alternatives.filter((_, idx) => idx !== i))

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">Problem Statement</h1>
        <p className="text-sm text-muted-foreground">Click any card title to edit its contents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border-2 bg-rose-50 border-rose-200 p-5 flex flex-col gap-3">
          <ClickableCardTitle
            icon={AlertCircle}
            label="Core Problem"
            description="The core problem your customers face"
            onEdit={() => router.push("/problem-validation")}
          />
          {selectedLabel ? (
            <p className="text-sm whitespace-pre-wrap">{selectedLabel}</p>
          ) : (
            <span className="text-sm text-muted-foreground/50 italic">No problem selected</span>
          )}
        </div>

        <SimpleTextCard
          icon={Clock}
          label="Context"
          description="When and where does the problem occur?"
          value={contextWhen}
          placeholder="Describe the situation, trigger, or environment..."
          color="bg-amber-50 border-amber-200"
          dialogColor="bg-amber-50/50 border-amber-200"
          onChange={setContextWhen}
        />

        <div className="rounded-xl border-2 bg-purple-50 border-purple-200 p-5 flex flex-col gap-3">
          <ClickableCardTitle
            icon={GitFork}
            label="Alternatives & Shortcomings"
            description="How customers solve the problem and why those solutions fall short"
            onEdit={() => setAltOpen(true)}
          />
          {alternatives.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {alternatives.map((alt, i) => (
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

        <SimpleTextCard
          icon={Heart}
          label="Emotional Impact"
          description="How does the problem make customers feel?"
          value={emotionalImpact}
          placeholder="Describe frustration, anxiety, stress, or other emotions..."
          color="bg-pink-50 border-pink-200"
          dialogColor="bg-pink-50/50 border-pink-200"
          onChange={setEmotionalImpact}
        />

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

      <Dialog open={altOpen} onOpenChange={setAltOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Alternatives &amp; Shortcomings</DialogTitle>
            <DialogDescription>How customers solve the problem and why those solutions fall short</DialogDescription>
          </DialogHeader>
          {alternatives.length > 0 && (
            <ul className="flex flex-col gap-3">
              {alternatives.map((item, i) => (
                <li key={i} className="flex flex-col gap-2 bg-muted/50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm font-medium">{item.text}</span>
                    <button onClick={() => removeAlternative(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
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
                              setAlternatives(alternatives.map((alt, idx) =>
                                idx === i ? { ...alt, shortcomings: alt.shortcomings.filter((_, k) => k !== j) } : alt
                              ))
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
                          setAlternatives(alternatives.map((alt, idx) =>
                            idx === i ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
                          ))
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
                        setAlternatives(alternatives.map((alt, idx) =>
                          idx === i ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
                        ))
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
            <datalist id="impact-cats-ps-standalone">
              {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
            <div className="flex gap-2">
              <Input
                list="impact-cats-ps-standalone"
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
