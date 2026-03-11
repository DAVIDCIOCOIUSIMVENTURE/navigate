"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
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
  const { problemRef, impacts, setImpacts } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  const [items, setItems] = useState<ImpactItem[]>([EMPTY_ITEM()])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty = useRef(false)

  // Sync from Redux until the user starts editing (handles store hydration after refresh)
  useEffect(() => {
    if (!isDirty.current) {
      setItems(impacts.length > 0 ? impacts : [EMPTY_ITEM()])
    }
  }, [impacts])

  const save = (next: ImpactItem[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setImpacts(next)
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
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Quantifiable Impact</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          What is the measurable cost of the problem? Quantify the impact in concrete terms — time, money,
          errors, or other metrics that make the problem tangible.
        </p>

        <datalist id="impact-cats-standalone">
          {IMPACT_CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>

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

        <Button variant="outline" className="w-fit" onClick={addAnother}>
          <Plus className="h-4 w-4" />
          Add another
        </Button>

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
