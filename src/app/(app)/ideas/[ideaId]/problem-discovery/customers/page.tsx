"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProblemDiscovery, getAdjacentSteps, type CustomerFields } from "../context"
import { USE_CASES } from "../use-cases"
import { Users } from "lucide-react"

const SINGLE_FIELDS: {
  key: keyof CustomerFields
  label: string
  placeholder: string
}[] = [
  { key: "segmentName", label: "Segment Name", placeholder: "e.g. Freelance Designers, Mid-market HR Teams..." },
]

const MULTILINE_FIELDS: {
  key: keyof CustomerFields
  label: string
  placeholder: string
}[] = [
  { key: "whoTheyAre", label: "Who They Are", placeholder: "Describe their background, lifestyle, and identity..." },
  { key: "whatTheyDo", label: "What They Do", placeholder: "Describe their daily activities and responsibilities..." },
  { key: "goalsAndMotivations", label: "Goals & Motivations", placeholder: "What are they trying to achieve? What drives them?" },
  { key: "frustrationsAndChallenges", label: "Frustrations & Challenges", placeholder: "What blocks them from achieving their goals?" },
]

type Tab = "strategy" | "use-cases"

export default function CustomersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { customer, setCustomer } = useProblemDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)
  const [tab, setTab] = useState<Tab>("strategy")

  const set = (key: keyof CustomerFields, val: string) =>
    setCustomer({ ...customer, [key]: val })

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Customers</h2>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            A <strong className="text-foreground/80">customer segment</strong> is a clearly defined group of people who share similar characteristics, behaviors, and needs. Rather than trying to build for everyone, great innovators start with a specific type of person they deeply understand.
          </p>
          <p className="text-sm text-muted-foreground">
            Use this page to paint a vivid picture of who your target customer is. Think beyond demographics — consider their day-to-day life, what they&apos;re trying to accomplish, and where they get stuck. The more concrete and specific you are, the easier it becomes to identify real problems worth solving.
          </p>
          <p className="text-sm text-muted-foreground">
            Not sure who to focus on? Revisit your <strong className="text-foreground/80">Self-Discovery</strong> section — your values, strengths, and lived experiences often point directly to the people you&apos;re best placed to help.
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
            Your Strategy
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SINGLE_FIELDS.map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-brand-foreground">{f.label}</label>
                  <Input
                    placeholder={f.placeholder}
                    value={customer[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="text-sm h-8 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-brand-foreground">Age Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="From"
                    value={customer.ageFrom}
                    onChange={(e) => set("ageFrom", e.target.value)}
                    className="text-sm h-8 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                  />
                  <span className="text-brand-foreground text-sm shrink-0">to</span>
                  <Input
                    placeholder="To"
                    value={customer.ageTo}
                    onChange={(e) => set("ageTo", e.target.value)}
                    className="text-sm h-8 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MULTILINE_FIELDS.map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-brand-foreground">{f.label}</label>
                  <Textarea
                    rows={3}
                    placeholder={f.placeholder}
                    value={customer[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="resize-none text-sm focus-visible:ring-1 bg-background text-foreground placeholder:text-muted-foreground border-brand/30"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "use-cases" && (
          <div className="rounded-xl border border-surface/20 bg-surface p-5 flex flex-col gap-4">
            <p className="text-sm text-surface-foreground/70">
              Not sure where to start? Browse these example customer segments to spark ideas or get a feel for the level of detail that works well. You can apply any example directly to your strategy.
            </p>
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="rounded-lg border border-surface-foreground/10 bg-surface-foreground/10 p-4 flex flex-col gap-3"
              >
                <p className="text-sm font-semibold text-surface-foreground">{uc.title}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Segment</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.customer.segment}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Who They Are</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.customer.whoTheyAre}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">What They Do</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.customer.whatTheyDo}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Goals & Motivations</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.customer.goalsAndMotivations}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-surface-foreground/50 uppercase tracking-wide">Frustrations & Challenges</span>
                    <p className="mt-0.5 text-surface-foreground/80">{uc.customer.frustrationsAndChallenges}</p>
                  </div>
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
