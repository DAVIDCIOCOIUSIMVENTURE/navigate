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

  const add = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    setAlternatives([...alternatives, { id: Date.now(), text: trimmed, shortcomings: [] }])
    setDraft("")
  }

  const remove = (i: number) => setAlternatives(alternatives.filter((_, idx) => idx !== i))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); add() }
  }

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <GitFork className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Alternatives to the Problem</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          How are customers currently solving or working around this problem? List every alternative they
          might use — tools, workarounds, doing nothing, or hiring someone.
        </p>

        {alternatives.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {alternatives.map((item, i) => (
              <li key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                <span className="flex-1">{item.text}</span>
                <button onClick={() => remove(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Type an alternative and press Enter..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            className="text-sm h-9"
          />
          <Button variant="outline" onClick={add} disabled={!draft.trim()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
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
