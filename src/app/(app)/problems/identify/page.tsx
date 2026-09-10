"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Brain, Clock, PenLine, Glasses, Microscope, Target } from "lucide-react"
import { EditProblemDialog } from "@/components/edit-problem-dialog"
import { ProblemSavedDialog } from "@/components/problem-saved-dialog"
import { useContainerSize } from "@/context/container-size-context"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"
import type { MethodPickerItem } from "@/components/method-picker-board"
import { MethodTile } from "@/components/method-tile"

type IdentifyTool = MethodPickerItem & {
  /** Optional illustration shown beside the tool's description on wide containers. */
  image?: { src: string; alt: string }
}

export default function IdentifyProblemsPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const isWide = useContainerSize() === "wide"

  const [draftProblemId, setDraftProblemId] = useState<number | null>(null)
  const draftProblem = useSelector((s: RootState) =>
    draftProblemId !== null ? s.problems.problems.find((p) => p.id === draftProblemId) ?? null : null
  )

  const [savedProblemId, setSavedProblemId] = useState<number | null>(null)
  const [savedDialogOpen, setSavedDialogOpen] = useState(false)

  async function handleDefine() {
    const created = await dispatch.problems.create({ source: "manual" })
    setDraftProblemId(created.id)
  }

  function handleDraftClose() {
    if (draftProblem) {
      const isEmpty =
        !draftProblem.title.trim() &&
        !draftProblem.description.trim() &&
        draftProblem.customers.length === 0 &&
        draftProblem.contexts.length === 0 &&
        draftProblem.problems.length === 0
      if (isEmpty) {
        dispatch.problems.delete(draftProblem.id)
      }
    }
    setDraftProblemId(null)
  }

  function handleDraftDone(problemId: number) {
    setDraftProblemId(null)
    setSavedProblemId(problemId)
    setSavedDialogOpen(true)
  }

  const items: IdentifyTool[] = [
    {
      id: "reflect",
      title: "Reflect",
      shortDescription: "Turn a lived experience into a problem through guided prompts about your own life and work.",
      longDescription: "Turn a lived experience into a problem through guided prompts about your own life and work.",
      helperText: "Best for identifying problems if you're unsure where to start: a guided approach that walks you through prompts about your own life and work.",
      icon: Glasses,
      estimatedMinutes: 10,
      enabled: true,
      image: {
        src: "/images/reflection.jpg",
        alt: "A person writing in a notebook at a wooden table with a coffee beside them",
      },
    },
    {
      id: "canvas-builder",
      title: "Canvas Builder",
      shortDescription: "Combine customer segments, contexts, and types of pain on a single canvas to surface problems worth solving.",
      longDescription: "Combine customer segments, contexts, and types of pain on a single canvas to surface problems worth solving.",
      helperText: "Best for people who already know how to ask the right questions, or who want to explore a wide space of possibilities quickly by mixing dimensions from a curated catalogue.",
      icon: Brain,
      estimatedMinutes: 15,
      enabled: true,
      image: {
        src: "/images/puzzle.jpg",
        alt: "A wall painted with brightly coloured interlocking jigsaw pieces",
      },
    },
    {
      id: "research",
      title: "Research",
      shortDescription: "Hunt for problems out in the world using curated tools and a guided capture form.",
      longDescription: "Hunt for problems out in the world using curated tools and a guided capture form.",
      helperText: "Best for looking outside your own experience: review sites, forums, communities, and conversations with strangers.",
      icon: Microscope,
      estimatedMinutes: 20,
      enabled: true,
      image: {
        src: "/images/research.jpg",
        alt: "Hands typing on a laptop with a second monitor in the background",
      },
    },
    {
      id: "define",
      title: "Define a Problem Statement",
      shortDescription: "Already know what you want to explore? Write it directly without working through a tool.",
      longDescription: "Already know what you want to explore? Write it directly without working through a tool.",
      helperText: "Best for capturing a problem you have in mind right now so you can come back and validate it later.",
      icon: PenLine,
      estimatedMinutes: 5,
      enabled: true,
      image: {
        src: "/images/write.jpg",
        alt: "A hand writing with an orange pen in an open notebook",
      },
    },
  ]

  function handlePick(id: string) {
    switch (id) {
      case "canvas-builder":
        router.push("/problems/identify/canvas-builder")
        return
      case "reflect":
        router.push("/problems/identify/reflect")
        return
      case "research":
        router.push("/problems/identify/research")
        return
      case "define":
        handleDefine()
        return
    }
  }

  return (
    <>
      <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
        <Card className={cn("w-full flex flex-col", isWide ? "flex-1 min-h-0 overflow-hidden" : "min-h-[320px]")}>
          <CardHeader className="space-y-6">
            <CardTitle icon={Target}>Identify a Problem</CardTitle>
            <p className="text-base leading-relaxed">
              Every problem in your library starts here. Each tool is a different doorway to the same goal: a problem that&apos;s real, painful, and worth solving. We suggest starting with <span className="font-semibold">Reflect</span> to ground a problem in your own experience, then returning to the <span className="font-semibold">Canvas Builder</span> or <span className="font-semibold">Research</span> to explore more broadly or gather outside evidence. If you already know what you want to explore, <span className="font-semibold">Define a Problem Statement</span> captures it straight away. Whichever tool you choose, the problem lands in your library, ready to refine and validate.
            </p>
          </CardHeader>
          <CardContent className={cn("flex flex-col gap-3", isWide && "flex-1 min-h-0 overflow-y-auto")}>
            <Tabs defaultValue={items[0].id} className="w-full">
              <TabsList className="h-auto flex-wrap justify-start" aria-label="Ways to identify a problem" data-tour={TOUR_TARGETS.identifyMethods}>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className="gap-2 text-base"
                      data-tour={item.id === "define" ? TOUR_TARGETS.identifyDefineTab : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.title}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {items.map((item) => {
                const Icon = item.icon
                return (
                  <TabsContent key={item.id} value={item.id} className="mt-4">
                    <div
                      className={cn(
                        "rounded-lg border bg-muted/70 p-6 grid gap-6",
                        item.image && isWide && "grid-cols-[minmax(0,1fr),26rem] items-center",
                      )}
                    >
                      <div className="flex flex-col gap-5 min-w-0">
                        <div className="flex items-center gap-3">
                          <MethodTile icon={Icon} size="lg" />
                          <h3 className="text-xl font-bold leading-tight tracking-tight text-secondary-brand">{item.title}</h3>
                        </div>
                        <p className="text-base leading-relaxed">{item.longDescription}</p>
                        {item.helperText && (
                          <div className="rounded-lg border bg-card p-4">
                            <p className="text-base leading-relaxed">{item.helperText}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-base">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          <span>About {item.estimatedMinutes} minutes</span>
                        </div>
                        <div>
                          <Button
                            type="button"
                            onClick={() => handlePick(item.id)}
                            disabled={!item.enabled}
                            className="gap-2"
                            data-tour={item.id === "define" ? TOUR_TARGETS.identifyDefineUse : undefined}
                          >
                            Use this tool
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {item.image && (
                        <div className="relative w-full max-w-[26rem] aspect-[3/2] overflow-hidden rounded-lg">
                          <Image
                            src={item.image.src}
                            alt={item.image.alt}
                            fill
                            sizes="26rem"
                            className="object-cover"
                            priority={item.id === items[0].id}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <EditProblemDialog
        problem={draftProblem}
        onClose={handleDraftClose}
        onDone={handleDraftDone}
        title="Define a Problem Statement"
        showStatus={false}
      />

      <ProblemSavedDialog
        open={savedDialogOpen}
        onOpenChange={setSavedDialogOpen}
        problemId={savedProblemId}
      />
    </>
  )
}
