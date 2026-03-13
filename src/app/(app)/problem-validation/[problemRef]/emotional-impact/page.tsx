"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Heart, Plus, X } from "lucide-react"

export default function EmotionalImpactPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, emotionalImpact, setEmotionalImpact } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const addItem = () => {
    const trimmed = draft.trim()
    if (trimmed) {
      setEmotionalImpact([...emotionalImpact, trimmed])
    }
    setDraft("")
    setAdding(false)
  }

  const removeItem = (i: number) =>
    setEmotionalImpact(emotionalImpact.filter((_, idx) => idx !== i))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addItem() }
    if (e.key === "Escape") { setDraft(""); setAdding(false) }
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-8 pt-8 pb-0">
        <CardTitle icon={Heart} className="text-lg">Emotional Impact</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 flex flex-col gap-6">

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            How does this problem make people feel? Capturing the emotional weight helps you understand
            the real cost of the problem beyond the practical inconvenience.
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li><strong className="text-foreground">Frustration &amp; anger</strong> — feeling blocked, wasting time, hitting walls</li>
            <li><strong className="text-foreground">Anxiety &amp; stress</strong> — uncertainty, fear of mistakes, pressure</li>
            <li><strong className="text-foreground">Embarrassment</strong> — looking incompetent, letting others down</li>
            <li><strong className="text-foreground">Helplessness</strong> — no control, no good options, stuck</li>
          </ul>
          <p>
            Add one emotional impact per entry. Be specific — the more precise the feeling, the more
            powerfully you can speak to it in your messaging.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {emotionalImpact.map((item, i) => (
            <div key={i} className="flex items-center gap-2 border rounded-lg px-4 py-2.5">
              <Input
                value={item}
                onChange={(e) => setEmotionalImpact(
                  emotionalImpact.map((v, idx) => idx === i ? e.target.value : v)
                )}
                className="flex-1 text-sm h-8"
              />
              <ConfirmDialog
                trigger={
                  <button className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                }
                title="Remove emotional impact?"
                description="This entry will be permanently removed."
                onConfirm={() => removeItem(i)}
              />
            </div>
          ))}

          {adding ? (
            <Input
              ref={inputRef}
              placeholder="e.g. Frustration when the report takes hours to compile manually..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={addItem}
              className="text-sm h-9"
            />
          ) : (
            <Button variant="dashed" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" />
              Add Emotional Impact
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
