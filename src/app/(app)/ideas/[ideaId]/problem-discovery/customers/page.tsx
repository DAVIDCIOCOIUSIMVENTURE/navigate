"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProblemDiscovery, getAdjacentSteps, type CustomerFields } from "../context"
import { Users } from "lucide-react"

const FIELDS: {
  key: keyof CustomerFields
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  { key: "segmentName", label: "Segment Name", placeholder: "e.g. Freelance Designers, Mid-market HR Teams..." },
  { key: "occupation", label: "Occupation", placeholder: "e.g. Product Manager, Small Business Owner..." },
  { key: "ageRange", label: "Age Range", placeholder: "e.g. 25–40" },
  { key: "whoTheyAre", label: "Who They Are", placeholder: "Describe their background, lifestyle, and identity...", multiline: true },
  { key: "whatTheyDo", label: "What They Do", placeholder: "Describe their daily activities and responsibilities...", multiline: true },
  { key: "goalsAndMotivations", label: "Goals & Motivations", placeholder: "What are they trying to achieve? What drives them?", multiline: true },
  { key: "frustrationsAndChallenges", label: "Frustrations & Challenges", placeholder: "What blocks them from achieving their goals?", multiline: true },
]

export default function CustomersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { customer, setCustomer } = useProblemDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)

  const set = (key: keyof CustomerFields, val: string) =>
    setCustomer({ ...customer, [key]: val })

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Customers</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Define your target customer segment — who they are, what they do, and what drives them.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FIELDS.filter((f) => !f.multiline).map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground/70">{f.label}</label>
              <Input
                placeholder={f.placeholder}
                value={customer[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                className="text-sm h-8"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.filter((f) => f.multiline).map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground/70">{f.label}</label>
              <Textarea
                rows={3}
                placeholder={f.placeholder}
                value={customer[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                className="resize-none text-sm focus-visible:ring-1"
              />
            </div>
          ))}
        </div>

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
