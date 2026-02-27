"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { useIdeas } from "@/context/ideas-context"
import { CheckCircle2, Lock, Map, Zap } from "lucide-react"

const STAGES_GUIDED = [
  {
    key: "problem-discovery",
    label: "Problem Discovery",
    path: "problem-discovery/customers",
    completedKey: "problemDiscoveryComplete" as const,
    future: false,
  },
  {
    key: "problem-validation",
    label: "Problem Validation",
    path: "problem-validation/pick-a-problem",
    completedKey: "problemValidationComplete" as const,
    future: false,
  },
  {
    key: "solution-discovery",
    label: "Solution Discovery",
    path: null,
    completedKey: null,
    future: true,
  },
  {
    key: "solution-validation",
    label: "Solution Validation",
    path: null,
    completedKey: null,
    future: true,
  },
]

const STAGES_QUICKSTART = [
  {
    key: "problem-discovery",
    label: "Problem Discovery",
    path: "problem-discovery/quickstart",
    completedKey: "problemDiscoveryComplete" as const,
    future: false,
  },
  {
    key: "problem-validation",
    label: "Problem Validation",
    path: "problem-validation/quickstart",
    completedKey: "problemValidationComplete" as const,
    future: false,
  },
  {
    key: "solution-discovery",
    label: "Solution Discovery",
    path: null,
    completedKey: null,
    future: true,
  },
  {
    key: "solution-validation",
    label: "Solution Validation",
    path: null,
    completedKey: null,
    future: true,
  },
]

export default function IdeaShellLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const { getIdea, updateIdea } = useIdeas()

  const ideaId = Number(params.ideaId)
  const idea = getIdea(ideaId)

  const isQuickStart = idea?.mode === "quickstart"
  const STAGES = isQuickStart ? STAGES_QUICKSTART : STAGES_GUIDED

  const handleModeSwitch = (mode: "guided" | "quickstart") => {
    updateIdea(ideaId, { mode })
    const targetStages = mode === "quickstart" ? STAGES_QUICKSTART : STAGES_GUIDED
    const currentStage = STAGES_GUIDED.concat(STAGES_QUICKSTART).find(
      (s) => s.key && pathname.includes(s.key)
    )
    const targetStage = targetStages.find((s) => s.key === currentStage?.key)
    const targetPath = targetStage?.path ?? targetStages[0].path
    router.push(`/ideas/${ideaId}/${targetPath}`)
  }

  return (
    <div className="flex flex-col gap-0 w-full flex-1">
      <div className="flex items-center gap-3 mb-6">
        {/* Stage bar */}
        <div className="flex items-stretch flex-1 rounded-xl border bg-card overflow-hidden">
          {STAGES.map((stage) => {
            const completed = stage.completedKey && idea ? idea[stage.completedKey] : false
            const isActive = stage.path && pathname.includes(stage.key)

            return (
              <button
                key={stage.key}
                disabled={stage.future || !stage.path}
                onClick={() => {
                  if (!stage.future && stage.path) {
                    router.push(`/ideas/${ideaId}/${stage.path}`)
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-r last:border-r-0
                  ${stage.future
                    ? "text-muted-foreground/40 cursor-not-allowed bg-muted/20"
                    : isActive
                      ? "bg-primary/5 text-primary"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {stage.future ? (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                ) : completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                ) : null}
                <span className="flex flex-col items-center leading-tight text-center">
                  {stage.label.split(" ").map((word, i) => (
                    <span key={i}>{word}</span>
                  ))}
                </span>
                {stage.future && (
                  <span className="text-xs text-muted-foreground/40 font-normal hidden sm:inline">
                    (coming soon)
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Mode toggle */}
        <div className="flex items-stretch rounded-xl border bg-card overflow-hidden shrink-0">
          <button
            onClick={() => handleModeSwitch("guided")}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-r
              ${!isQuickStart
                ? "bg-primary/5 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
          >
            <Map className="h-3.5 w-3.5 shrink-0" />
            Guided Journey
          </button>
          <button
            onClick={() => handleModeSwitch("quickstart")}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors
              ${isQuickStart
                ? "bg-primary/5 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
          >
            <Zap className="h-3.5 w-3.5 shrink-0" />
            Quick Start
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}

