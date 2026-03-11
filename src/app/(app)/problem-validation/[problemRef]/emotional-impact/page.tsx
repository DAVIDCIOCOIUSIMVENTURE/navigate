"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { Heart } from "lucide-react"

export default function EmotionalImpactPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, emotionalImpact, setEmotionalImpact } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Emotional Impact</h2>
        </div>
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
