"use client"

import { useState, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { GitFork, Plus, X } from "lucide-react"

export default function AlternativesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, alternatives, setAlternatives } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const [draft, setDraft] = useState("")
  const [scDrafts, setScDrafts] = useState<Record<number, string>>({})

  const addAlternative = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    setAlternatives([...alternatives, { id: Date.now(), text: trimmed, shortcomings: [] }])
    setDraft("")
  }

  const removeAlternative = (i: number) => setAlternatives(alternatives.filter((_, idx) => idx !== i))

  const onAltKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addAlternative() }
  }

  const addShortcoming = (altIdx: number) => {
    const trimmed = (scDrafts[altIdx] ?? "").trim()
    if (!trimmed) return
    setAlternatives(
      alternatives.map((alt, idx) =>
        idx === altIdx ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
      )
    )
    setScDrafts((prev) => ({ ...prev, [altIdx]: "" }))
  }

  const removeShortcoming = (altIdx: number, scIdx: number) =>
    setAlternatives(
      alternatives.map((alt, idx) =>
        idx === altIdx
          ? { ...alt, shortcomings: alt.shortcomings.filter((_, j) => j !== scIdx) }
          : alt
      )
    )

  const onScKeyDown = (altIdx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addShortcoming(altIdx) }
  }

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <GitFork className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Alternatives &amp; Shortcomings</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          How are customers currently solving or working around this problem? List every alternative they
          might use — tools, workarounds, doing nothing, or hiring someone. Then note why each falls short.
        </p>

        <div className="flex gap-2">
          <Input
            placeholder="Type an alternative and press Enter..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onAltKeyDown}
            className="text-sm h-9"
          />
          <Button variant="outline" onClick={addAlternative} disabled={!draft.trim()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {alternatives.length > 0 && (
          <div className="flex flex-col gap-5">
            {alternatives.map((alt, i) => (
              <div key={alt.id} className="flex flex-col gap-2 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm font-medium">{alt.text}</span>
                  <button
                    onClick={() => removeAlternative(i)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {alt.shortcomings.length > 0 && (
                  <ul className="flex flex-col gap-1.5 pl-2">
                    {alt.shortcomings.map((sc, j) => (
                      <li key={j} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                        <span className="flex-1 text-muted-foreground">{sc}</span>
                        <button
                          onClick={() => removeShortcoming(i, j)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2 pl-2">
                  <Input
                    placeholder="Why does this fall short?"
                    value={scDrafts[i] ?? ""}
                    onChange={(e) => setScDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                    onKeyDown={(e) => onScKeyDown(i, e)}
                    className="text-sm h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addShortcoming(i)}
                    disabled={!(scDrafts[i] ?? "").trim()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add shortcoming
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

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
