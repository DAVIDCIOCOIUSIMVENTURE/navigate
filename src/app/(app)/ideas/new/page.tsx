"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useIdeas } from "@/store/ideas-hooks"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Map, Zap } from "lucide-react"

export default function NewIdeaPage() {
  const router = useRouter()
  const { createIdea } = useIdeas()
  const dispatch = useDispatch<AppDispatch>()

  const handleSelect = (mode: "guided" | "quickstart") => {
    dispatch.settings.setIdeaMode(mode)
    const idea = createIdea(mode)
    if (mode === "guided") {
      router.push(`/ideas/${idea.id}/problem-discovery/customers`)
    } else {
      router.push(`/ideas/${idea.id}/problem-discovery/quickstart`)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full flex-1 max-w-2xl mx-auto py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">Start a New Idea</h1>
        <p className="text-muted-foreground text-sm">
          Choose how you want to work through your idea.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect("guided")}
          className="text-left group"
        >
          <Card className="h-full border-2 border-transparent group-hover:border-primary transition-all group-hover:shadow-md cursor-pointer">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Map className="h-6 w-6 text-blue-700" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="font-semibold text-base">Guided Journey</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Walk me through it step by step. Discover your customer segment, map out jobs to be done, identify problems, and validate the best one.
                </p>
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-auto">
                <span className="font-medium text-foreground/70">Includes:</span>
                <ul className="flex flex-col gap-0.5 pl-2">
                  <li>· Problem Discovery</li>
                  <li>· Problem Validation</li>
                  <li>· Solution Discovery (coming soon)</li>
                  <li>· Solution Validation (coming soon)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => handleSelect("quickstart")}
          className="text-left group"
        >
          <Card className="h-full border-2 border-transparent group-hover:border-primary transition-all group-hover:shadow-md cursor-pointer">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <Zap className="h-6 w-6 text-purple-700" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="font-semibold text-base">Quick Start</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I already know what I&apos;m doing. Take me straight to the idea canvas to fill in the details directly.
                </p>
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-auto">
                <span className="font-medium text-foreground/70">Opens:</span>
                <ul className="flex flex-col gap-0.5 pl-2">
                  <li>· Idea Canvas</li>
                  <li>· All sections editable immediately</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>
    </div>
  )
}
