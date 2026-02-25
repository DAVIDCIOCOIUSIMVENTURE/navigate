"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Search, X, Users } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"

const EXAMPLES = [
  {
    title: "Freelance designers",
    age: "28–40",
    occupation: "Independent graphic / UX designer",
    whoTheyAre: "Left agency life to work independently. Comfortable with digital tools but overwhelmed by the business side — contracts, invoicing, client management — without agency support.",
    goals: "Build a stable client base, earn a reliable income, and carve out time for creative work they find meaningful.",
    frustrations: "Feast-or-famine income cycles, chasing late payments, and constantly context-switching between creative and admin work.",
  },
  {
    title: "New parents returning to work",
    age: "30–42",
    occupation: "Various — office-based or hybrid roles",
    whoTheyAre: "Took 6–18 months out on parental leave. Highly capable but experiencing a dip in professional confidence and facing logistical constraints around childcare and flexible hours.",
    goals: "Re-establish a professional identity, earn fairly, and maintain enough flexibility to be present as a parent.",
    frustrations: "Feeling overlooked for opportunities, guilt around work-life trade-offs, and workplaces that haven't adapted to their new circumstances.",
  },
  {
    title: "Independent café owners",
    age: "35–55",
    occupation: "Small business owner / operator",
    whoTheyAre: "Passionate about hospitality; typically self-funded with limited formal business training. Wears many hats — barista, manager, bookkeeper, and marketer — all at once.",
    goals: "Build a loyal local customer base, cover costs comfortably, and eventually step back from day-to-day operations.",
    frustrations: "Tight margins, unreliable staff, competing against chains, and not knowing which marketing efforts actually work.",
  },
]

export default function YourCustomersPage() {
  const customerProfile = useSelector((state: RootState) => state.findingMyCustomers.customerProfile)
  const ageMin = useSelector((state: RootState) => state.findingMyCustomers.ageMin)
  const ageMax = useSelector((state: RootState) => state.findingMyCustomers.ageMax)
  const dispatch = useDispatch<AppDispatch>()

  function update(field: keyof typeof customerProfile, value: string) {
    dispatch.findingMyCustomers.updateCustomerProfile({ field, value })
  }

  return (
    <Card className="w-full flex-1 flex flex-col h-[calc(100svh-9rem)]">
      <CardContent className="p-8 flex flex-col gap-4 overflow-y-auto flex-1">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-yellow-400">
            <Search className="h-3 w-3 text-white" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Finding My Customers</span>
        </div>
        <h2 className="text-xl font-semibold">Your Customers</h2>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Your <span className="font-medium text-foreground">customers</span> are the specific people
            you want to serve — a defined group who share enough in common that they tend to experience
            the same kinds of problems. The more clearly you can describe who they are, the easier it
            becomes to understand what they truly need.
          </p>
        </div>

        <details className="rounded-lg border">
          <summary className="p-4 text-sm font-medium cursor-pointer select-none list-none flex items-center justify-between gap-2">
            <span>See examples</span>
            <span className="text-xs text-muted-foreground">click to expand</span>
          </summary>
          <div className="px-4 pb-4 flex flex-col gap-3">
            {EXAMPLES.map((ex) => (
              <div key={ex.title} className="rounded-md bg-muted/40 px-3 py-2 flex flex-col gap-1">
                <p className="text-sm font-medium">{ex.title}</p>
                <p className="text-xs text-muted-foreground">Ages {ex.age} &middot; {ex.occupation}</p>
                <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium text-foreground/70">Who they are:</span> {ex.whoTheyAre}</p>
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">Goals:</span> {ex.goals}</p>
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">Frustrations:</span> {ex.frustrations}</p>
              </div>
            ))}
          </div>
        </details>

        <hr className="border-border my-1" />
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-lg font-semibold text-primary">Your turn</h3>
          <p className="text-sm text-muted-foreground">Describe your customer segment</p>
        </div>

        <div className="rounded-lg bg-primary p-8 flex flex-col gap-4 text-primary-foreground">
          <p className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5" />Your Customers</p>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Segment name</label>
            <div className="relative">
              <Input
                placeholder="e.g. Freelance designers"
                value={customerProfile.name}
                onChange={(e) => update("name", e.target.value)}
                className={`bg-white border-white/20 text-foreground placeholder:text-muted-foreground${customerProfile.name ? " pr-8" : ""}`}
              />
              {customerProfile.name && (
                <button
                  onClick={() => update("name", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Occupation / role</label>
            <div className="relative">
              <Input
                placeholder="e.g. Independent designer"
                value={customerProfile.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                className={`bg-white border-white/20 text-foreground placeholder:text-muted-foreground${customerProfile.occupation ? " pr-8" : ""}`}
              />
              {customerProfile.occupation && (
                <button
                  onClick={() => update("occupation", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Age range</label>
              <span className="text-sm font-semibold tabular-nums">{ageMin} – {ageMax}</span>
            </div>
            <Slider
              min={18}
              max={100}
              step={1}
              value={[ageMin, ageMax]}
              onValueChange={([min, max]) => dispatch.findingMyCustomers.updateAgeRange({ min, max })}
              trackClassName="bg-white/20"
              rangeClassName="bg-white"
              thumbClassName="bg-white border-white/50 hover:bg-white/90"
            />
            <div className="flex justify-between text-xs text-primary-foreground/60">
              <span>18</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Who they are</label>
            <Textarea
              placeholder="Their background, life stage, and what connects them as a group — what shapes how they see the world?"
              value={customerProfile.whoTheyAre}
              onChange={(e) => update("whoTheyAre", e.target.value)}
              rows={3}
              className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Goals & motivations</label>
            <Textarea
              placeholder="What are they broadly trying to achieve in this area of their life or work?"
              value={customerProfile.goals}
              onChange={(e) => update("goals", e.target.value)}
              rows={3}
              className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Frustrations & challenges</label>
            <Textarea
              placeholder="What currently gets in their way? What do they find difficult, annoying, or unsatisfying?"
              value={customerProfile.frustrations}
              onChange={(e) => update("frustrations", e.target.value)}
              rows={3}
              className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
