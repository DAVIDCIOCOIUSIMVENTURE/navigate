"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { FolderKanban, Home, Plus } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { AboutDialog } from "@/components/about-toggle"
import { BundleMenuButton } from "@/components/bundle-menu-button"
import { NewProjectDialog } from "@/components/project-name-dialog"
import { ProjectsTable } from "@/components/projects-table"
import { useContainerSize } from "@/context/container-size-context"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"

/**
 * Home lists the user's projects. Each project is one problem and the
 * solutions found for it; opening a project shows the problem with its
 * explore, validate and identify-solutions actions.
 */
export default function DashboardPage() {
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
          <CardTitle size="md" icon={Home} className="text-xl text-foreground">Home</CardTitle>
          <AboutDialog subject="the home page">
            <p>
              This is your <span className="font-bold">home</span>, the list of your projects.
              A <span className="font-bold">project</span> holds one problem and the solutions you find for it.
              Press <span className="font-bold">New project</span> to start one, then open it to identify its problem, explore and test it, and identify solutions.
            </p>
          </AboutDialog>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button onClick={() => setNewOpen(true)} className="gap-2" data-tour={TOUR_TARGETS.dashboardNewProject}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
          <BundleMenuButton kind="project" />
        </div>
      </div>
      {/* Nothing until the projects have loaded, so the empty state never flashes over a list that is about to arrive. */}
      {!hydrated ? null : projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-brand">
            <FolderKanban className="h-8 w-8 text-secondary-brand-foreground" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No projects yet</h2>
            <p className="text-base">
              Start a project, then identify the problem it is about and work towards a solution.
            </p>
          </div>
          <Button onClick={() => setNewOpen(true)} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>
      ) : (
        <ProjectsTable projects={projects} className={cn(isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")} />
      )}
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}
