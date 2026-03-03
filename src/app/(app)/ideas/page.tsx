"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIdeas } from "@/store/ideas-hooks"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { HelpCircle, Lightbulb, Plus, Trash2 } from "lucide-react"
import type { Idea } from "@/types/idea"
import { useGuidance } from "@/context/guidance-context"

function IdeaCard({ idea, onDelete }: { idea: Idea; onDelete: (id: number) => void }) {
  const router = useRouter()
  const ideaMode = useSelector((state: RootState) => state.settings.ideaMode)

  const openIdea = () => {
    if (ideaMode === "quickstart") {
      if (idea.problemDiscoveryComplete) {
        router.push(`/ideas/${idea.id}/problem-validation/quickstart`)
      } else {
        router.push(`/ideas/${idea.id}/problem-discovery/quickstart`)
      }
    } else {
      if (idea.problemDiscoveryComplete) {
        router.push(`/ideas/${idea.id}/problem-validation/introduction`)
      } else {
        router.push(`/ideas/${idea.id}/problem-discovery/customers`)
      }
    }
  }

  const namedJobs = idea.jobs.filter((j) => j.name.trim())

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={openIdea}
    >
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{idea.title}</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(idea.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(idea.id) }}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete idea"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {namedJobs.length > 0 && (
          <ul className="flex flex-col gap-2">
            {namedJobs.map((job) => {
              const jobProblems = job.problems
              return (
                <li key={job.id} className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Job</p>
                    <p className="text-xs font-medium text-foreground">{job.name}</p>
                    {job.functional && (
                      <p className="text-[11px] text-muted-foreground"><span className="font-medium">Functional:</span> {job.functional}</p>
                    )}
                    {job.emotional && (
                      <p className="text-[11px] text-muted-foreground"><span className="font-medium">Emotional:</span> {job.emotional}</p>
                    )}
                    {job.social && (
                      <p className="text-[11px] text-muted-foreground"><span className="font-medium">Social:</span> {job.social}</p>
                    )}
                  </div>
                  {jobProblems.filter((p) => p.text.trim()).length > 0 && (
                    <ul className="flex flex-col gap-1 pl-3 border-l border-border">
                      {jobProblems.filter((p) => p.text.trim()).map((problem) => (
                        <li key={problem.id} className="flex flex-col gap-0.5">
                          <p className="text-[11px] text-foreground/80">{problem.text}</p>
                          {problem.contextWhen && (
                            <p className="text-[10px] text-muted-foreground"><span className="font-medium">Context:</span> {problem.contextWhen}</p>
                          )}
                          {problem.emotionalImpact && (
                            <p className="text-[10px] text-muted-foreground"><span className="font-medium">Emotional impact:</span> {problem.emotionalImpact}</p>
                          )}
                          {problem.impacts.length > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              <span className="font-medium">Impacts:</span>{" "}
                              {problem.impacts.map((i) => i.category).filter(Boolean).join(", ")}
                            </p>
                          )}
                          {problem.reason && (
                            <p className="text-[10px] text-muted-foreground"><span className="font-medium">Verdict:</span> {problem.reason}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default function IdeasPage() {
  const router = useRouter()
  const { ideas, deleteIdea } = useIdeas()
  const { openGuidance } = useGuidance()

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Ideas</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => openGuidance("ideas")}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Each idea takes you from problem discovery to a validated solution.
          </p>
        </div>
        <Button onClick={() => router.push("/ideas/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Start Generating New Idea
        </Button>
      </div>

      {ideas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No ideas yet</h2>
            <p className="text-sm text-muted-foreground">
              Start your first idea and work through problem discovery, validation, and solution design.
            </p>
          </div>
          <Button onClick={() => router.push("/ideas/new")} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Start Generating New Idea
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onDelete={deleteIdea} />
          ))}
        </div>
      )}
    </div>
  )
}
