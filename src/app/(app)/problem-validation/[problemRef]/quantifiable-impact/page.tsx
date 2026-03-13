"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import type { ImpactItem } from "@/types/idea"
import { BarChart2, Plus, X } from "lucide-react"

const IMPACT_CATEGORIES = [
  "Time Lost", "Money Wasted", "Error Rates", "Customer Churn",
  "Support Tickets", "Productivity Loss", "Revenue Impact", "Compliance Risk",
]

const EMPTY_ITEM = (): ImpactItem => ({ category: "", description: "" })

export default function QuantifiableImpactPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, quantifiableImpacts, setQuantifiableImpacts } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  const [items, setItems] = useState<ImpactItem[]>([EMPTY_ITEM()])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty = useRef(false)

  // Sync from Redux until the user starts editing (handles store hydration after refresh)
  useEffect(() => {
    if (!isDirty.current) {
      setItems(quantifiableImpacts.length > 0 ? quantifiableImpacts : [EMPTY_ITEM()])
    }
  }, [quantifiableImpacts])

  const save = (next: ImpactItem[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setQuantifiableImpacts(next)
    }, 400)
  }

  const update = (i: number, field: keyof ImpactItem, value: string) => {
    isDirty.current = true
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item)
    setItems(next)
    save(next)
  }

  const remove = (i: number) => {
    const next = items.filter((_, idx) => idx !== i)
    const final = next.length > 0 ? next : [EMPTY_ITEM()]
    setItems(final)
    save(final)
  }

  const addAnother = () => {
    const next = [...items, EMPTY_ITEM()]
    setItems(next)
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardTitle icon={BarChart2} className="text-lg">Quantifiable Impact</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Numbers make a problem real. Investors, stakeholders, and customers all respond more strongly
            to concrete data than to descriptions alone. For each impact, choose a category and describe
            the measurable cost.
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li><strong className="text-foreground">Time Lost</strong> — hours spent per week/month on manual tasks or recovery</li>
            <li><strong className="text-foreground">Money Wasted</strong> — direct costs, overpayments, or budget leakage</li>
            <li><strong className="text-foreground">Error Rates</strong> — frequency of mistakes, rework, or failed outcomes</li>
            <li><strong className="text-foreground">Revenue Impact</strong> — lost sales, churn, or missed opportunities</li>
            <li><strong className="text-foreground">Productivity Loss</strong> — reduced output, blocked workflows, or delays</li>
          </ul>
          <p>
            Even rough estimates are valuable — a problem that costs a team 5 hours a week is far more
            compelling than one that just &ldquo;takes too long.&rdquo;
          </p>
        </div>

        <datalist id="impact-cats-standalone">
          {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  list="impact-cats-standalone"
                  placeholder="Category..."
                  value={item.category}
                  onChange={(e) => update(i, "category", e.target.value)}
                  className="text-sm h-9 w-2/5 shrink-0"
                />
                <Input
                  placeholder="Describe the impact..."
                  value={item.description}
                  onChange={(e) => update(i, "description", e.target.value)}
                  className="text-sm h-9 flex-1"
                />
                <button
                  onClick={() => remove(i)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <Button variant="dashed" onClick={addAnother}>
            <Plus className="h-4 w-4" />
            Add Quantifiable Impact
          </Button>
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
