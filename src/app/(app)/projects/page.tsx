"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { FolderKanban, Plus } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AboutDialog } from "@/components/about-toggle"
import { BundleMenuButton } from "@/components/bundle-menu-button"
import { NewProjectDialog } from "@/components/project-name-dialog"
import { ProjectsEmptyState } from "@/components/projects-empty-state"
import { ProjectsTable } from "@/components/projects-table"
import { useContainerSize } from "@/context/container-size-context"
import { PAGE_TITLE_CLASS } from "@/lib/nav-item-styles"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"

/**
 * The projects list. Each project is one problem and the solutions found
 * for it; opening a project shows the problem with its explore, test and
 * identify-solutions actions. Home only summarises the projects in a row of
 * figures; this page is the list itself. The page title, the New
 * project button and the import and export menu all sit in the card's
 * header, so the card is the whole page.
 */
export default function ProjectsPage() {
  const projects = useSelector((state: RootState) => state.projects.projects)
  const hydrated = useSelector((state: RootState) => state.projects.hydrated)
  const [newOpen, setNewOpen] = useState(false)
  const isWide = useContainerSize() === "wide"

  // The page title and its buttons live inside the card, so the card is the
  // page. The same pair heads the empty state, which keeps the import menu
  // reachable while there is nothing to list yet.
  const title = (
    <div className="flex flex-wrap items-center gap-3">
      <CardTitle size="md" icon={FolderKanban} className={PAGE_TITLE_CLASS}>Projects</CardTitle>
      <AboutDialog subject="your projects">
        <p>
          These are your <span className="font-bold">projects</span>.
          A <span className="font-bold">project</span> holds one problem and the solutions you find for it.
          Press <span className="font-bold">New project</span> to start one, then open it to identify its problem, explore and test it, and identify solutions.
          The menu beside it exports a project as a file or imports one somebody else exported.
        </p>
      </AboutDialog>
    </div>
  )
  const actions = (
    <>
      {/* The guided tour's "Start a project" step points here, on the list and on the empty state alike. */}
      <Button onClick={() => setNewOpen(true)} className="gap-2" data-tour={TOUR_TARGETS.projectsNewProject}>
        <Plus className="h-4 w-4" />
        New project
      </Button>
      <BundleMenuButton kind="project" />
    </>
  )

  return (
    <div
      className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}
    >
      {/* Nothing until the projects have loaded, so the empty state never flashes over a list that is about to arrive. */}
      {!hydrated ? null : projects.length === 0 ? (
        <Card className={cn("flex flex-col", isWide && "flex-1 min-h-0 overflow-y-auto")}>
          <CardHeader className="shrink-0 pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {title}
              <div className="flex items-center gap-2 flex-wrap">{actions}</div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col flex-1">
            <ProjectsEmptyState onNew={() => setNewOpen(true)} />
          </CardContent>
        </Card>
      ) : (
        <ProjectsTable
          projects={projects}
          className={cn(isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")}
          title={title}
          headerExtra={actions}
        />
      )}
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}
