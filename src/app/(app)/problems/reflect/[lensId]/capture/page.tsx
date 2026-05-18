"use client"

import { useState } from "react"
import Link from "next/link"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Lightbulb, Plus, Radar } from "lucide-react"
import { useReflect } from "../context"
import { toast } from "sonner"

/**
 * Single-form variant used by the Market signals lens. Each submission writes one
 * candidate (the "what problem does it suggest?" answer is the title; the rest
 * is stored as context on the candidate). The form clears so the user can
 * capture several finds in a sitting.
 */
export default function LensCapturePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { lens, sessionId } = useReflect()
  const Icon = lens.icon

  const [whatFound, setWhatFound] = useState("")
  const [whereSeen, setWhereSeen] = useState("")
  const [problem, setProblem] = useState("")
  const [whoAffected, setWhoAffected] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  function clearForm() {
    setWhatFound("")
    setWhereSeen("")
    setProblem("")
    setWhoAffected("")
  }

  async function handleSave() {
    if (problem.trim().length === 0) return
    setSaving(true)
    try {
      const context: Record<string, string> = {}
      if (whatFound.trim()) context["what-found"] = whatFound.trim()
      if (whereSeen.trim()) context["where-seen"] = whereSeen.trim()
      if (whoAffected.trim()) context["who-affected"] = whoAffected.trim()

      const created = await dispatch.problemCandidates.bulkCreateForSession({
        sessionId,
        lensId: lens.id,
        answers: [
          {
            promptId: "what-problem",
            title: problem.trim(),
            context,
          },
        ],
      })
      if (created.length > 0) {
        setSavedCount((n) => n + 1)
        toast.success("Saved as candidate")
        clearForm()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card>
        <CardHeader className="space-y-6">
          <CardTitle icon={Icon} iconBg={lens.tileColor}>
            {lens.title}
          </CardTitle>
          <p className="text-base leading-relaxed">
            Capture what you spotted when you looked outward. Each save creates one candidate.
            The form clears so you can capture several finds in a row.
          </p>
          <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-md bg-orange-700 shrink-0"
              aria-hidden="true"
            >
              <Radar className="h-5 w-5 text-white" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold">Useful source categories</p>
              <p className="text-base leading-relaxed">
                Low-rated but in-demand products on app stores, trend-tracking sites, scientific
                or industry research aggregators, and public data portals. Capture the insight,
                not just the URL.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="what-found" className="text-base font-medium">
              What did you find?
            </label>
            <p className="text-base">A short title for the signal you spotted.</p>
            <Input
              id="what-found"
              value={whatFound}
              onChange={(e) => setWhatFound(e.target.value)}
              placeholder="e.g. cluster of low-rated invoicing apps with high install counts"
              className="text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="where-seen" className="text-base font-medium">
              Where did you see it?
            </label>
            <p className="text-base">
              One line: the source category or the specific tool, dataset, or report.
            </p>
            <Input
              id="where-seen"
              value={whereSeen}
              onChange={(e) => setWhereSeen(e.target.value)}
              placeholder="e.g. App Store finance category, reviews below 3.0"
              className="text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="what-problem" className="text-base font-medium">
              What problem does it suggest?{" "}
              <span className="font-normal italic">(this becomes the candidate)</span>
            </label>
            <Textarea
              id="what-problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Phrase it as a problem in plain language."
              className="text-base min-h-[5rem]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="who-affected" className="text-base font-medium">
              Who is affected?
            </label>
            <Input
              id="who-affected"
              value={whoAffected}
              onChange={(e) => setWhoAffected(e.target.value)}
              placeholder="e.g. freelancers invoicing in multiple currencies"
              className="text-base"
            />
          </div>
        </CardContent>
      </Card>

      {savedCount > 0 && (
        <Card>
          <CardContent className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-tertiary" aria-hidden="true" />
              <span className="text-base">
                {savedCount === 1
                  ? "1 candidate captured this session."
                  : `${savedCount} candidates captured this session.`}
              </span>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/problems/reflect#candidates">
                Review candidates
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/problems/reflect/${lens.id}/introduction`}>
            <ArrowLeft className="h-4 w-4" />
            Back to introduction
          </Link>
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || problem.trim().length === 0}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {saving ? "Saving..." : "Save as candidate"}
        </Button>
      </div>
    </div>
  )
}
