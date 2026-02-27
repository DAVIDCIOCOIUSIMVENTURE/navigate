"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useIdeas } from "@/context/ideas-context"
import {
  Lightbulb,
  Plus,
  ChevronRight,
  CheckCircle2,
  Circle,
  Pencil,
  Check,
} from "lucide-react"
import type { Idea } from "@/types/idea"

const STAGES = [
  { key: "problemDiscoveryComplete", label: "Problem Discovery" },
  { key: "problemValidationComplete", label: "Problem Validation" },
  { key: "solutionDiscovery", label: "Solution Discovery" },
  { key: "solutionValidation", label: "Solution Validation" },
] as const

function StageIndicator({ idea }: { idea: Idea }) {
  const statuses = [
    idea.problemDiscoveryComplete,
    idea.problemValidationComplete,
    false,
    false,
  ]

  return (
    <div className="flex items-center gap-1.5">
      {STAGES.map((stage, i) => {
        const done = statuses[i]
        const future = i >= 2
        return (
          <div key={stage.label} className="flex items-center gap-1.5">
            {done ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
            ) : (
              <Circle className={`h-3.5 w-3.5 shrink-0 ${future ? "text-muted-foreground/30" : "text-muted-foreground/60"}`} />
            )}
            <span className={`text-xs ${future ? "text-muted-foreground/40" : done ? "text-green-700" : "text-muted-foreground"}`}>
              {stage.label}
            </span>
            {i < STAGES.length - 1 && (
              <span className="text-muted-foreground/30 text-xs">·</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function IdeaCard({ idea }: { idea: Idea }) {
  const router = useRouter()
  const { updateIdea } = useIdeas()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(idea.title)

  const saveTitle = () => {
    if (title.trim()) updateIdea(idea.id, { title: title.trim() })
    else setTitle(idea.title)
    setEditing(false)
  }

  const openIdea = () => {
    if (idea.problemDiscoveryComplete) {
      router.push(`/ideas/${idea.id}/problem-validation/pick-a-problem`)
    } else {
      router.push(`/ideas/${idea.id}/problem-discovery/customers`)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle()
                    if (e.key === "Escape") { setTitle(idea.title); setEditing(false) }
                  }}
                  className="h-7 text-sm font-semibold"
                />
                <button onClick={saveTitle} className="text-green-600 hover:text-green-700">
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm truncate">{idea.title}</h3>
                <button
                  onClick={() => setEditing(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
            {idea.customer.segmentName && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{idea.customer.segmentName}</p>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
            idea.mode === "guided"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}>
            {idea.mode === "guided" ? "Guided" : "Quick Start"}
          </span>
        </div>

        <StageIndicator idea={idea} />

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            {new Date(idea.updatedAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
          <Button size="sm" variant="outline" onClick={openIdea} className="gap-1.5 h-7 text-xs">
            Open
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function IdeasPage() {
  const router = useRouter()
  const { ideas } = useIdeas()

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Ideas</h1>
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
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  )
}
