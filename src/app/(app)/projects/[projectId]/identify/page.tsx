"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector, useStore } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowRight, Brain, ChevronDown, Clock, PenLine, Glasses, Microscope, Target } from "lucide-react"
import { EditProblemDialog } from "@/components/edit-problem-dialog"
import { ProblemSavedDialog } from "@/components/problem-saved-dialog"
import { IdentifyHubShell } from "@/components/identify-hub-shell"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"
import type { MethodPickerItem } from "@/components/method-picker-board"
import { MethodTile } from "@/components/method-tile"

/**
 * The project's Identify a Problem hub. While the project has no problem,
 * each tool creates one for it. Once it has one, the same tools revisit that
 * problem: they open pre-filled with what was captured and saving updates
 * the problem, because a project holds exactly one.
 */
export default function IdentifyProblemsPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const { projectId, problem: existing } = useProjectScope()

  /**
   * The problem open in the Define dialog. `isNew` is captured when the
   * dialog opens, because creating the draft hands it to the project straight
   * away: from the next render the project has a problem, so "is this a new
   * one?" can no longer be answered by looking at the project.
   */
  const [draft, setDraft] = useState<{ id: number; isNew: boolean } | null>(null)
  const draftProblem = useSelector((s: RootState) =>
    draft !== null ? s.problems.problems.find((p) => p.id === draft.id) ?? null : null
  )

  const [savedProblemId, setSavedProblemId] = useState<number | null>(null)
  const [savedDialogOpen, setSavedDialogOpen] = useState(false)

  async function handleDefine() {
    if (existing) {
      setDraft({ id: existing.id, isNew: false })
      return
    }
    const created = await dispatch.problems.create({ source: "manual", projectId })
    setDraft({ id: created.id, isNew: true })
  }

  function handleDraftClose() {
    // A brand-new draft left empty is thrown away, so cancelling leaves the project as it was.
    // The dialog writes any pending edit before closing, so read the problem as it stands now.
    if (draft?.isNew) {
      const latest = store.getState().problems.problems.find((p) => p.id === draft.id)
      const isEmpty =
        latest !== undefined &&
        !latest.title.trim() &&
        !latest.description.trim() &&
        latest.customers.length === 0 &&
        latest.contexts.length === 0 &&
        latest.problems.length === 0
      if (isEmpty) {
        dispatch.problems.delete(draft.id)
      }
    }
    setDraft(null)
  }

  function handleDraftDone(problemId: number) {
    const wasNew = draft?.isNew ?? false
    setDraft(null)
    if (!wasNew) {
      router.push(projectRoutes.page(projectId))
      return
    }
    setSavedProblemId(problemId)
    setSavedDialogOpen(true)
  }

  const items: MethodPickerItem[] = [
    {
      id: "reflect",
      title: "Reflect",
      shortDescription: "Turn a lived experience into a problem through guided prompts about your own life and work.",
      longDescription: "Turn a lived experience into a problem through guided prompts about your own life and work.",
      helperText: "Best for identifying problems if you're unsure where to start: a guided approach that walks you through prompts about your own life and work.",
      icon: Glasses,
      estimatedMinutes: 10,
      enabled: true,
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
      tourTarget: TOUR_TARGETS.identifyDefineUse,
    },
  ]

  function handlePick(id: string) {
    switch (id) {
      case "canvas-builder":
        router.push(projectRoutes.canvasBuilder(projectId))
        return
      case "reflect":
        router.push(projectRoutes.reflect(projectId))
        return
      case "research":
        router.push(projectRoutes.research(projectId))
        return
      case "define":
        handleDefine()
        return
    }
  }

  return (
    <>
      <IdentifyHubShell
        title={existing ? "Revisit the Problem" : "Identify a Problem"}
        icon={Target}
        backHref={projectRoutes.page(projectId)}
        aboutTitle="About identifying a problem"
        description={
          existing ? (
            <>
              This project&apos;s problem is <span className="font-semibold">{existing.title || "untitled"}</span>. A project holds one problem, so each tool below reopens it with what you captured and saving updates it rather than adding another.
            </>
          ) : (
            "Pick the tool that suits how you want to find a problem. Whichever you choose, the problem lands in your project, ready to explore and validate."
          )
        }
        journeyStep="identify-problems"
        journeyProblemId={existing?.id ?? null}
        intro={
          <p className="text-base leading-relaxed">
            Every project&apos;s problem starts here. Each tool is a different doorway to the same goal: a problem that&apos;s real, painful, and worth solving. We suggest starting with <span className="font-semibold">Reflect</span> to ground a problem in your own experience, then returning to the <span className="font-semibold">Canvas Builder</span> or <span className="font-semibold">Research</span> to explore more broadly or gather outside evidence. If you already know what you want to explore, <span className="font-semibold">Define a Problem Statement</span> captures it straight away. Whichever tool you choose, the problem lands in your project, ready to refine and validate. Once the project has its problem, the tools reopen it so you can change your mind without starting again.
          </p>
        }
      >
        <ul className="flex flex-col gap-3" aria-label="Ways to identify a problem" data-tour={TOUR_TARGETS.identifyMethods}>
          {items.map((item) => (
            <IdentifyToolCard key={item.id} item={item} onPick={handlePick} editing={existing !== undefined} />
          ))}
        </ul>
      </IdentifyHubShell>

      <EditProblemDialog
        problem={draftProblem}
        onClose={handleDraftClose}
        onDone={handleDraftDone}
        title={draft && !draft.isNew ? "Edit the Problem Statement" : "Define a Problem Statement"}
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

/**
 * One row of the tool list: title and description with the call to action on
 * the right, and a "Best for" section the user can drop down when they want
 * help choosing between the tools.
 */
function IdentifyToolCard({ item, onPick, editing }: { item: MethodPickerItem; onPick: (id: string) => void; editing: boolean }) {
  const [open, setOpen] = useState(false)
  const helperId = `identify-tool-${item.id}-best-for`

  return (
    <li className="rounded-lg border bg-muted/70 p-5">
      <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-1 min-w-0 items-start gap-3">
            <MethodTile icon={item.icon} size="lg" />
            <div className="flex flex-1 min-w-0 flex-col gap-1.5">
              <h2 className="text-xl font-bold leading-tight tracking-tight text-secondary-brand">{item.title}</h2>
              <p className="text-base leading-relaxed">{item.longDescription}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
                {item.helperText && (
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium text-secondary-brand rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-controls={helperId}
                    >
                      Best for
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                  </CollapsibleTrigger>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  About {item.estimatedMinutes} minutes
                </span>
              </div>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => onPick(item.id)}
            disabled={!item.enabled}
            className="gap-2 shrink-0 self-start"
            data-tour={item.tourTarget}
          >
            {editing ? "Revisit with this tool" : "Use this tool"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {item.helperText && (
          <CollapsibleContent id={helperId} className="sm:pl-[3.25rem]">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-base leading-relaxed">{item.helperText}</p>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </li>
  )
}
