"use client"

import { FolderKanban, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * What the Projects page and the Home overview show while there are no
 * projects yet: an invitation to start one. `compact` is the version for a
 * card that shares the page with other sections, with less room around it.
 */
export function ProjectsEmptyState({
  onNew,
  compact = false,
  className,
  tourTarget,
}: {
  onNew: () => void
  compact?: boolean
  className?: string
  /** The guided tour id for the New project button, when this is the only one on the page (Home). */
  tourTarget?: string
}) {
  return (
    <div className={cn("flex-1 flex flex-col items-center justify-center gap-6", compact ? "py-10" : "py-24", className)}>
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-brand">
        <FolderKanban className="h-8 w-8 text-secondary-brand-foreground" />
      </div>
      <div className="text-center flex flex-col gap-2 max-w-sm">
        <h2 className="text-lg font-semibold">No projects yet</h2>
        <p className="text-base">
          Start a project, then identify the problem it is about and work towards a solution.
        </p>
      </div>
      <Button onClick={onNew} size={compact ? "default" : "lg"} className="gap-2" data-tour={tourTarget}>
        <Plus className="h-4 w-4" />
        New project
      </Button>
    </div>
  )
}
