"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { Heart } from "lucide-react"

export default function EmotionalImpactPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { emotionalImpact, setEmotionalImpact } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={Heart}>Problem Validation</CardEyebrow>
        <CardTitle icon={Heart} className="text-lg">Emotional Impact</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          How does the problem make your customers feel? Understanding the emotional weight of a problem
          helps you connect more deeply with customer needs.
        </p>
        <Textarea
          rows={7}
          placeholder="Describe the frustration, anxiety, stress, or other emotions the problem triggers..."
          value={emotionalImpact}
          onChange={(e) => setEmotionalImpact(e.target.value)}
          className="resize-none text-sm focus-visible:ring-1"
        />
        <div className="flex justify-between">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
