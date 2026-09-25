"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { FolderKanban, Plus } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { AboutDialog } from "@/components/about-toggle"
import { BundleMenuButton } from "@/components/bundle-menu-button"
import { NewProjectDialog } from "@/components/project-name-dialog"
import { ProjectsEmptyState } from "@/components/projects-empty-state"
import { ProjectsTable } from "@/components/projects-table"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

/**
 * The projects list. Each project is one problem and the solutions found
 * for it; opening a project shows the problem with its explore, test and
 * identify-solutions actions. Home shows the same list as part of its
 * overview; this page is about the projects alone, with the import and
 * export menu beside the New project button.
 */
export default function ProjectsPage() {
  const projects = useSelector((state: RootState) => state.projects.projects)
  const hydrated = useSelector((state: RootState) => state.projects.hydrated)
  const [newOpen, setNewOpen] = useState(false)
  const isWide = useContainerSize() === "wide"

  return (
    <div
      className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle size="md" icon={FolderKanban} className="text-xl text-foreground">Projects</CardTitle>
          <AboutDialog subject="your projects">
            <p>
              These are your <span className="font-bold">projects</span>.
              A <span className="font-bold">project</span> holds one problem and the solutions you find for it.
              Press <span className="font-bold">New project</span> to start one, then open it to identify its problem, explore and test it, and identify solutions.
              The menu beside it exports a project as a file or imports one somebody else exported.
            </p>
          </AboutDialog>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button onClick={() => setNewOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New project
          </Button>
          <BundleMenuButton kind="project" />
        </div>
      </div>
      {/* Nothing until the projects have loaded, so the empty state never flashes over a list that is about to arrive. */}
      {!hydrated ? null : projects.length === 0 ? (
        <ProjectsEmptyState onNew={() => setNewOpen(true)} />
      ) : (
        <ProjectsTable projects={projects} className={cn(isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")} />
      )}
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}
