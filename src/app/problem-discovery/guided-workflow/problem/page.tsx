"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, usePathname } from "next/navigation"
import { useWorkflow, getAdjacentSteps } from "../context"
import { AlertCircle } from "lucide-react"

export default function ProblemPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problem, setProblem } = useWorkflow()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Problem</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          What is the core problem your customers face? Be specific and concrete — describe the pain point in
          their own terms.
        </p>
        <Textarea
          rows={7}
          placeholder="Describe the specific problem or pain point your customers experience..."
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
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
