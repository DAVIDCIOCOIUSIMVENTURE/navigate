"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, usePathname } from "next/navigation"
import { useWorkflow, getAdjacentSteps } from "../context"
import { Clock } from "lucide-react"

export default function ContextPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { contextWhen, setContextWhen } = useWorkflow()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Context</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          When and where does the problem occur? Describe the situation, trigger, or environment that causes
          the problem to arise.
        </p>
        <Textarea
          rows={7}
          placeholder="Describe the situation, trigger, or environment when the problem arises..."
          value={contextWhen}
          onChange={(e) => setContextWhen(e.target.value)}
          className="resize-none text-sm focus-visible:ring-1"
        />
        <div className="flex justify-between">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              Previous
            </Button>
          ) : (
            <div />
          )}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
