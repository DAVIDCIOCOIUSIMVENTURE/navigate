"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "@/lib/router"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Lightbulb } from "lucide-react"

const NO_PROBLEM = "none"

export type PortfolioDraft = {
  title: string
  description: string
  problemId: number | null
}

/**
 * Shared create / edit form for a portfolio. The "new" and "edit" pages both
 * render this and pass an `onSave` that creates or updates the record. The
 * problem picker lists every problem; assigning one carries its solutions over
 * automatically (resolved live on the detail page, nothing is copied here).
 */
export function PortfolioEditor({
  heading,
  initial,
  onSave,
  cancelHref,
}: {
  heading: string
  initial: PortfolioDraft
  onSave: (draft: PortfolioDraft) => void
  cancelHref: string
}) {
  const router = useRouter()
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)

  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [problemId, setProblemId] = useState<number | null>(initial.problemId)

  const selectedSolutionCount =
    problemId != null ? solutions.filter((s) => s.problemId === problemId).length : 0

  const handleSave = () => {
    onSave({ title: title.trim(), description: description.trim(), problemId })
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto pb-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push(cancelHref)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-6">
          <CardTitle>{heading}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="portfolio-title">Title</Label>
            <Input
              id="portfolio-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name this portfolio"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="portfolio-description">Description</Label>
            <Textarea
              id="portfolio-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this idea, and where is it up to?"
              className="min-h-[6rem]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="portfolio-problem">Problem</Label>
            <Select
              value={problemId == null ? NO_PROBLEM : String(problemId)}
              onValueChange={(v) => setProblemId(v === NO_PROBLEM ? null : Number(v))}
            >
              <SelectTrigger id="portfolio-problem" className="w-full">
                <SelectValue placeholder="Choose a problem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROBLEM}>No problem assigned</SelectItem>
                {problems.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.title || `Problem #${p.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {problemId != null ? (
              <p className="flex items-center gap-1.5 text-base text-foreground/70">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                {selectedSolutionCount} {selectedSolutionCount === 1 ? "solution" : "solutions"} will carry over from this problem.
              </p>
            ) : (
              <p className="text-base text-foreground/60">
                You can assign a problem now or later. Its solutions are carried over automatically.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => router.push(cancelHref)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-1.5 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  )
}
