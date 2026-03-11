"use client"

import { useState, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { ThumbsDown, Plus, X } from "lucide-react"

export default function ShortcomingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, alternatives, setAlternatives } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const [drafts, setDrafts] = useState<Record<number, string>>({})

  const addShortcoming = (altIdx: number) => {
    const trimmed = (drafts[altIdx] ?? "").trim()
    if (!trimmed) return
    setAlternatives(
      alternatives.map((alt, idx) =>
        idx === altIdx ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
      )
    )
    setDrafts((prev) => ({ ...prev, [altIdx]: "" }))
  }

  const removeShortcoming = (altIdx: number, scIdx: number) =>
    setAlternatives(
      alternatives.map((alt, idx) =>
        idx === altIdx
          ? { ...alt, shortcomings: alt.shortcomings.filter((_, j) => j !== scIdx) }
          : alt
      )
    )

  const onKeyDown = (altIdx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addShortcoming(altIdx) }
  }

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

        {alternatives.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No alternatives added yet. Go back and add some alternatives first.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {alternatives.map((alt, i) => (
              <div key={i} className="flex flex-col gap-2">
                <p className="text-sm font-medium">{alt.text}</p>
                {alt.shortcomings.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {alt.shortcomings.map((sc, j) => (
                      <li key={j} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                        <span className="flex-1">{sc}</span>
                        <button onClick={() => removeShortcoming(i, j)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a shortcoming and press Enter..."
                    value={drafts[i] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    className="text-sm h-9"
                  />
                  <Button variant="outline" onClick={() => addShortcoming(i)} disabled={!(drafts[i] ?? "").trim()}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

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
