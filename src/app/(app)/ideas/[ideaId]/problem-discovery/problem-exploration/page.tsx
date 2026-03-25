"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProblemDiscovery, getAdjacentSteps } from "../context"
import type { PriorKnowledgeFields } from "@/types/idea"
import { USE_CASES } from "../use-cases"
import { Search } from "lucide-react"

type Tab = "strategy" | "use-cases"

const FIELDS: {
  key: keyof PriorKnowledgeFields
  label: string
  placeholder: string
}[] = [
  {
    key: "personalFrustrations",
    label: "What frustrations have you experienced?",
    placeholder: "Think about moments where you felt stuck, annoyed, or had to work around something...",
  },
  {
    key: "whoStruggles",
    label: "Who do you see struggling with this?",
    placeholder: "Describe the types of people who face this problem. What's their situation?",
  },
  {
    key: "existingWorkarounds",
    label: "What workarounds or makeshift solutions exist?",
    placeholder: "How are people currently dealing with this? Spreadsheets, manual processes, asking friends...",
  },
  {
    key: "complaintsHeard",
    label: "What have you heard others complain about?",
    placeholder: "Think about conversations, social media, forums, or news stories...",
  },
  {
    key: "whyItMatters",
    label: "Why does this matter to you?",
    placeholder: "What draws you to this problem space? What would change if it were solved?",
  },
]

export default function ProblemExplorationPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { priorKnowledge, setPriorKnowledge } = useProblemDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)
  const [tab, setTab] = useState<Tab>("strategy")

  const set = (key: keyof PriorKnowledgeFields, val: string) =>
    setPriorKnowledge({ ...priorKnowledge, [key]: val })

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Problem Exploration</h2>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Before diving into the structured steps, take a moment to capture what you already know. Most people come to innovation with a wealth of lived experience: problems they&apos;ve run into, people they&apos;ve seen struggle, workarounds they&apos;ve noticed. This step helps you get it all out of your head.
          </p>
          <p className="text-sm text-muted-foreground">
            Don&apos;t worry about being structured or polished here. Write freely. These notes will appear as a reference panel throughout the rest of the process, helping you stay grounded in real observations as you define your customer, jobs, and problems.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setTab("strategy")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "strategy"
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Your Notes
          </button>
          <button
            onClick={() => setTab("use-cases")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "use-cases"
                ? "bg-surface text-surface-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Use Cases
          </button>
        </div>

        {/* Tab content */}
        {tab === "strategy" && (
          <div className="rounded-xl border border-brand/20 bg-brand p-5 flex flex-col gap-4">
            {FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-brand-foreground">{f.label}</label>
                <Textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={priorKnowledge[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="resize-none text-sm focus-visible:ring-1 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                />
              </div>
            ))}
          </div>
        )}

        {tab === "use-cases" && (
          <div className="rounded-xl border border-surface/20 bg-surface p-5 flex flex-col gap-4">
            <p className="text-sm text-surface-foreground/70">
              Here&apos;s how the same brainstorming step might look for each of our example innovators, before they had a defined customer segment or problem statement.
            </p>
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="rounded-lg border border-surface-foreground/10 bg-surface-foreground/10 p-4 flex flex-col gap-3"
              >
                <p className="text-sm font-semibold text-surface-foreground">{uc.title}</p>
                <div className="flex flex-col gap-2">
                  {FIELDS.map((f) => {
                    const val = uc.priorKnowledge?.[f.key]
                    if (!val) return null
                    return (
                      <div key={f.key}>
                        <p className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">{f.label}</p>
                        <p className="mt-0.5 text-sm text-surface-foreground/80">{val}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : (
            <div />
          )}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
