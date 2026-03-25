"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps, type ImpactItem } from "../context"
import { BarChart2, Plus, X } from "lucide-react"

const IMPACT_CATEGORIES = [
  "Time Lost", "Money Wasted", "Error Rates", "Customer Churn",
  "Support Tickets", "Productivity Loss", "Revenue Impact", "Compliance Risk",
]

export default function QuantifiableImpactPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { impacts, setImpacts } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)
  const [draft, setDraft] = useState<ImpactItem>({ category: "", description: "" })

  const add = () => {
    if (!draft.category.trim() && !draft.description.trim()) return
    setImpacts([...impacts, { category: draft.category.trim(), description: draft.description.trim() }])
    setDraft({ category: "", description: "" })
  }

  const remove = (i: number) => setImpacts(impacts.filter((_, idx) => idx !== i))

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={BarChart2}>Problem Validation</CardEyebrow>
        <CardTitle icon={BarChart2} className="text-lg">Quantifiable Impact</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          What is the measurable cost of the problem? Quantify the impact in concrete terms: time, money,
          errors, or other metrics that make the problem tangible.
        </p>

        {impacts.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {impacts.map((item, i) => (
              <li key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                <span className="shrink-0 font-medium min-w-[7rem]">{item.category || "—"}</span>
                <span className="flex-1 text-muted-foreground border-l pl-2">{item.description || "—"}</span>
                <button onClick={() => remove(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          <datalist id="impact-cats-idea">
            {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
          </datalist>
          <div className="flex gap-2">
            <Input
              list="impact-cats-idea"
              placeholder="Type or select category..."
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="text-sm h-9 w-2/5 shrink-0"
            />
            <Input
              placeholder="Describe the impact..."
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="text-sm h-9 flex-1"
            />
            <Button variant="outline" onClick={add} disabled={!draft.category.trim() && !draft.description.trim()}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
