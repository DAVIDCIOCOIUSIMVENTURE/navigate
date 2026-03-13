"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
      <CardHeader className="px-8 pt-8 pb-0">
        <CardTitle icon={GitFork} className="text-lg">Alternatives &amp; Shortcomings</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            How are people currently solving — or living with — this problem? List every existing solution
            they reach for today, even if it&apos;s imperfect or informal.
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li><strong className="text-foreground">Existing tools &amp; software</strong> — products already on the market</li>
            <li><strong className="text-foreground">Manual workarounds</strong> — spreadsheets, sticky notes, email threads</li>
            <li><strong className="text-foreground">Hiring or outsourcing</strong> — paying someone else to handle it</li>
            <li><strong className="text-foreground">Doing nothing</strong> — ignoring or tolerating the problem</li>
          </ul>
          <p>
            Then, for each existing solution, capture its <strong className="text-foreground">shortcomings</strong> — the
            specific ways it fails to fully solve the problem. These unmet needs are the gap your solution must fill.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {alternatives.map((alt, i) => (
            <div key={alt.id} className="flex flex-col gap-2 border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={alt.text}
                  onChange={(e) => setAlternatives(alternatives.map((a, idx) => idx === i ? { ...a, text: e.target.value } : a))}
                  className="flex-1 text-sm font-medium h-8"
                />
                <ConfirmDialog
                  trigger={
                    <button className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  }
                  title="Remove alternative?"
                  description="This will also delete all shortcomings associated with it."
                  onConfirm={() => removeAlternative(i)}
                />
              </div>

              {alt.shortcomings.length > 0 && (
                <p className="pl-2 text-xs text-muted-foreground">Shortcomings of this solution</p>
              )}
              {alt.shortcomings.length > 0 && (
                <ul className="flex flex-col gap-1.5 pl-2">
                  {alt.shortcomings.map((sc, j) => (
                    <li key={j} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                      <Input
                        value={sc}
                        onChange={(e) => setAlternatives(alternatives.map((a, idx) =>
                          idx === i ? { ...a, shortcomings: a.shortcomings.map((s, k) => k === j ? e.target.value : s) } : a
                        ))}
                        className="flex-1 text-sm h-7"
                      />
                      <ConfirmDialog
                        trigger={
                          <button className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        }
                        title="Remove shortcoming?"
                        description="This shortcoming will be permanently removed."
                        onConfirm={() => removeShortcoming(i, j)}
                      />
                    </li>
                  ))}
                </ul>
              )}

              <div className="pl-2">
                {addingSc[i] ? (
                  <Input
                    ref={(el) => { scInputRefs.current[i] = el }}
                    placeholder="Why does this fall short?"
                    value={scDrafts[i] ?? ""}
                    onChange={(e) => setScDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                    onKeyDown={(e) => onScKeyDown(i, e)}
                    onBlur={() => addShortcoming(i)}
                    className="text-sm h-8"
                  />
                ) : (
                  <Button
                    variant="dashed"
                    size="sm"
                    onClick={() => setAddingSc((prev) => ({ ...prev, [i]: true }))}
                  >
                    <Plus className="h-3 w-3" />
                    Add shortcoming
                  </Button>
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
            <Button variant="dashed" onClick={() => setAddingAlt(true)}>
              <Plus className="h-4 w-4" />
              Add Alternative
            </Button>
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
