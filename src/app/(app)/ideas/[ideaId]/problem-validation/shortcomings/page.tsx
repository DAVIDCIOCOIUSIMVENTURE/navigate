"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { ThumbsDown } from "lucide-react"

export default function ShortcomingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { shortcomings, setShortcomings } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Alternatives Shortcomings</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Why do the existing alternatives fall short? What frustrations, gaps, or additional problems do
          they create for customers?
        </p>
        <Textarea
          rows={7}
          placeholder="Explain why the existing alternatives fall short or create additional frustrations..."
          value={shortcomings}
          onChange={(e) => setShortcomings(e.target.value)}
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
