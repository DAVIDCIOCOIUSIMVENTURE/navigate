"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
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
  const [addingAlt, setAddingAlt] = useState(false)
  const [draft, setDraft] = useState("")
  const [addingSc, setAddingSc] = useState<Record<number, boolean>>({})
  const [scDrafts, setScDrafts] = useState<Record<number, string>>({})
  const altInputRef = useRef<HTMLInputElement>(null)
  const scInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    if (addingAlt) altInputRef.current?.focus()
  }, [addingAlt])

  useEffect(() => {
    const entries = Object.entries(addingSc)
    const lastTrue = entries.findLast(([, v]) => v)
    if (lastTrue) scInputRefs.current[Number(lastTrue[0])]?.focus()
  }, [addingSc])

  const addAlternative = () => {
    const trimmed = draft.trim()
    if (trimmed) {
      setAlternatives([...alternatives, { id: Date.now(), text: trimmed, shortcomings: [] }])
    }
    setDraft("")
    setAddingAlt(false)
  }

  const removeAlternative = (i: number) => setAlternatives(alternatives.filter((_, idx) => idx !== i))

  const onAltKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addAlternative() }
    if (e.key === "Escape") { setDraft(""); setAddingAlt(false) }
  }

  const addShortcoming = (altIdx: number) => {
    const trimmed = (scDrafts[altIdx] ?? "").trim()
    if (trimmed) {
      setAlternatives(
        alternatives.map((alt, idx) =>
          idx === altIdx ? { ...alt, shortcomings: [...alt.shortcomings, trimmed] } : alt
        )
      )
    }
    setScDrafts((prev) => ({ ...prev, [altIdx]: "" }))
    setAddingSc((prev) => ({ ...prev, [altIdx]: false }))
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
    if (e.key === "Escape") { setScDrafts((prev) => ({ ...prev, [altIdx]: "" })); setAddingSc((prev) => ({ ...prev, [altIdx]: false })) }
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

              <div className="pl-2">
                {addingSc[i] ? (
                  <div className="flex gap-2">
                    <Input
                      ref={(el) => { scInputRefs.current[i] = el }}
                      placeholder="Why does this fall short?"
                      value={scDrafts[i] ?? ""}
                      onChange={(e) => setScDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                      onKeyDown={(e) => onScKeyDown(i, e)}
                      onBlur={() => addShortcoming(i)}
                      className="text-sm h-8"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingSc((prev) => ({ ...prev, [i]: true }))}
                    className="w-full flex items-center justify-center gap-1.5 border border-dashed rounded-md py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add shortcoming
                  </button>
                )}
              </div>
            </div>
          ))}

          {addingAlt ? (
            <Input
              ref={altInputRef}
              placeholder="Type an alternative and press Enter..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onAltKeyDown}
              onBlur={addAlternative}
              className="text-sm h-9"
            />
          ) : (
            <button
              onClick={() => setAddingAlt(true)}
              className="w-full flex items-center justify-center gap-1.5 border border-dashed rounded-lg py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add alternative
            </button>
          )}
        </div>

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
