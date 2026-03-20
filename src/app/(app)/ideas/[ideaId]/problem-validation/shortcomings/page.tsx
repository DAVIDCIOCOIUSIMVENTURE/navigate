"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { ThumbsDown, Plus, X } from "lucide-react"

export default function ShortcomingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { existingSolutions, setExistingSolutions } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)
  const [adding, setAdding] = useState<Record<number, boolean>>({})
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    const entries = Object.entries(adding)
    const lastTrue = entries.findLast(([, v]) => v)
    if (lastTrue) inputRefs.current[Number(lastTrue[0])]?.focus()
  }, [adding])

  const addShortcoming = (altIdx: number) => {
    const trimmed = (drafts[altIdx] ?? "").trim()
    if (trimmed) {
      setExistingSolutions(
        existingSolutions.map((alt, idx) =>
          idx === altIdx ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
        )
      )
    }
    setDrafts((prev) => ({ ...prev, [altIdx]: "" }))
    setAdding((prev) => ({ ...prev, [altIdx]: false }))
  }

  const removeShortcoming = (altIdx: number, scIdx: number) =>
    setExistingSolutions(
      existingSolutions.map((alt, idx) =>
        idx === altIdx
          ? { ...alt, shortcomings: alt.shortcomings.filter((_, j) => j !== scIdx) }
          : alt
      )
    )

  const onKeyDown = (altIdx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addShortcoming(altIdx) }
    if (e.key === "Escape") { setDrafts((prev) => ({ ...prev, [altIdx]: "" })); setAdding((prev) => ({ ...prev, [altIdx]: false })) }
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardEyebrow icon={ThumbsDown}>Problem Validation</CardEyebrow>
        <CardTitle icon={ThumbsDown} className="text-lg">Existing Solutions Shortcomings</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Why do the existing solutions fall short? What frustrations, gaps, or additional problems do
          they create for customers?
        </p>

        {existingSolutions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No existing solutions added yet. Go back and add some existing solutions first.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {existingSolutions.map((alt, i) => (
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

                {adding[i] ? (
                  <Input
                    ref={(el) => { inputRefs.current[i] = el }}
                    placeholder="Add a shortcoming and press Enter..."
                    value={drafts[i] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    onBlur={() => addShortcoming(i)}
                    className="text-sm h-9"
                  />
                ) : (
                  <button
                    onClick={() => setAdding((prev) => ({ ...prev, [i]: true }))}
                    className="w-full flex items-center justify-center gap-1.5 border border-dashed rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add shortcoming
                  </button>
                )}
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
