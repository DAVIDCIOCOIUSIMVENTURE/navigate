"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSelector } from "react-redux"
import { Check, ChevronDown, FolderKanban, Plus, Settings } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewProjectDialog } from "@/components/project-name-dialog"
import { ProjectSettingsDialog } from "@/components/project-settings-dialog"
import { projectIdFromPathname, projectLabel, projectRoutes } from "@/lib/projects"
import { TOUR_TARGETS } from "@/lib/tour-steps"

/**
 * The header's project switcher: a dropdown listing every project with "New
 * project" at the top. The trigger shows the name of the project the current
 * page belongs to (everything under `/projects/<id>`), or "Projects"
 * elsewhere. Each row carries a settings button for the project's name and
 * team. The list of projects scrolls inside a capped area so a long list never
 * stretches the menu down the window; "New project" stays in view above it. The
 * dropdown is non-modal because those dialogs open from it.
 */
export function ProjectsMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [settingsId, setSettingsId] = useState<number | null>(null)
  const projects = useSelector((state: RootState) => state.projects.projects)
  const problems = useSelector((state: RootState) => state.problems.problems)

  const currentId = projectIdFromPathname(pathname)
  const current = currentId === null ? undefined : projects.find((p) => p.id === currentId)

  const label = current ? projectLabel(current, problems) : "Projects"
  const editing = settingsId === null ? undefined : projects.find((p) => p.id === settingsId)

  const openSettings = (id: number) => {
    setMenuOpen(false)
    setSettingsId(id)
  }

  return (
    <>
      <DropdownMenu modal={false} open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-2 bg-white text-quaternary hover:bg-white/90 hover:text-quaternary max-w-56"
            aria-label={current ? `Projects: ${label}` : "Projects"}
            data-tour={TOUR_TARGETS.headerProjects}
          >
            <FolderKanban className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline truncate">{label}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuItem
            onSelect={() => setNewOpen(true)}
            className="gap-2 font-medium"
            data-tour={TOUR_TARGETS.headerNewProject}
          >
            <Plus className="h-4 w-4" />
            New project
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Your projects</DropdownMenuLabel>
          {projects.length === 0 ? (
            <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
          ) : (
            <div className="max-h-72 overflow-y-auto overflow-x-hidden">
              {projects.map((project) => {
                const projectName = projectLabel(project, problems)
                return (
                  <div key={project.id} className="flex items-center gap-1">
                    <DropdownMenuItem asChild className="gap-2 flex-1 min-w-0">
                      <Link href={projectRoutes.page(project.id)} onClick={onNavigate}>
                        <FolderKanban className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{projectName}</span>
                        {current?.id === project.id && <Check className="h-4 w-4 shrink-0" />}
                      </Link>
                    </DropdownMenuItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => openSettings(project.id)}
                      aria-label={`Settings for ${projectName}`}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
      <ProjectSettingsDialog
        project={editing}
        open={editing !== undefined}
        onOpenChange={(open) => { if (!open) setSettingsId(null) }}
      />
    </>
  )
}
