"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIdeas } from "@/store/ideas-hooks"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { HelpCircle, Lightbulb, Plus } from "lucide-react"
import type { Idea } from "@/types/idea"
import { useGuidance } from "@/context/guidance-context"

function IdeaCard({ idea }: { idea: Idea }) {
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

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={openIdea}
    >
      <CardContent className="p-5 flex flex-col gap-2">
        <h3 className="font-semibold text-sm truncate">{idea.title}</h3>
        <p className="text-xs text-muted-foreground">
          {new Date(idea.createdAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </p>
      </CardContent>
    </Card>
  )
}

export default function IdeasPage() {
  const router = useRouter()
  const { ideas } = useIdeas()
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
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  )
}
