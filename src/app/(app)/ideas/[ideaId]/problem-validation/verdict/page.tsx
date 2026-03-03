"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { useIdeas } from "@/store/ideas-hooks"
import { Gavel, CheckCircle2, XCircle, GitFork, Clock, Heart, BarChart2 } from "lucide-react"

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      {value ? (
        <p className="text-sm">{value}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">Not filled in</p>
      )}
    </div>
  )
}

export default function VerdictPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { prevPath } = getAdjacentSteps(pathname, ideaId)
  const {
    selectedProblemId, alternatives, contextWhen, emotionalImpact,
    impacts, status, setStatus, reason, setReason, saveValidation,
  } = useProblemValidation()
  const { getIdea, updateIdea } = useIdeas()

  const idea = getIdea(ideaId)
  const allProblems = idea?.jobs.flatMap((j) => j.problems) ?? []
  const selectedProblem = allProblems.find((p) => p.id === selectedProblemId)

  const handleVerdict = (verdict: "valid" | "invalid") => {
    setStatus(verdict)
    saveValidation(verdict)
    // Check if all problems are now decided
    const filledProblems = allProblems.filter((p) => p.text.trim())
    const allDecided =
      filledProblems.length > 0 &&
      filledProblems.every(
        (p) =>
          p.id === selectedProblemId
            ? verdict === "valid" || verdict === "invalid"
            : p.validationStatus === "valid" || p.validationStatus === "invalid"
      )
    if (allDecided) {
      updateIdea(ideaId, { problemValidationComplete: true })
    }
    router.push(`/ideas/${ideaId}/problem-validation/pick-a-problem`)
  }

  const handleSave = () => {
    const effectiveStatus = status === "unvalidated" ? "in_progress" : status
    setStatus(effectiveStatus)
    saveValidation(effectiveStatus)
  }

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <Gavel className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Verdict</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Review your validation data and decide: is this problem worth solving?
        </p>

        {selectedProblem && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Problem</p>
            <p className="text-sm font-medium">{selectedProblem.text}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <GitFork className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm font-semibold">Alternatives</p>
            </div>
            {alternatives.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {alternatives.map((alt, i) => (
                  <li key={i} className="flex flex-col gap-0.5">
                    <div className="text-sm flex gap-2">
                      <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                      <span className="font-medium">{alt.text}</span>
                    </div>
                    {alt.shortcomings.length > 0 && (
                      <ul className="pl-4 flex flex-col gap-0.5">
                        {alt.shortcomings.map((sc, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex gap-1.5">
                            <span className="shrink-0">–</span>
                            <span>{sc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not filled in</p>
            )}
          </div>

          <div className="rounded-lg border p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm font-semibold">Context</p>
            </div>
            <SummaryField label="" value={contextWhen} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold">Emotional Impact</p>
              </div>
              <SummaryField label="" value={emotionalImpact} />
            </div>
            <div className="rounded-lg border p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold">Quantifiable Impact</p>
              </div>
              {impacts.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {impacts.map((item, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="font-medium shrink-0">{item.category || "—"}</span>
                      <span className="text-muted-foreground">{item.description || "—"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not filled in</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Notes (optional)
          </p>
          <Textarea
            rows={3}
            placeholder="Add any notes about your decision..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="resize-none text-sm focus-visible:ring-1"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700"
            onClick={() => handleVerdict("valid")}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Valid — Worth Solving
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 border-red-300 hover:bg-red-50 hover:border-red-400 text-red-700"
            onClick={() => handleVerdict("invalid")}
          >
            <XCircle className="h-5 w-5 mr-2" />
            Invalid — Not Worth Solving
          </Button>
        </div>

        <div className="flex justify-between">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          <Button variant="ghost" onClick={handleSave}>Save Progress</Button>
        </div>
      </CardContent>
    </Card>
  )
}
