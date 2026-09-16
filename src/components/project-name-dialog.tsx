"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Project } from "@/store/projects-model"
import { projectRoutes } from "@/lib/projects"

/**
 * Asks for a project name. Used to create a project ("New project" in the
 * header and on the home page) and to rename one from its page or the
 * projects list. The name is required; it is what the project is called in
 * the header menu and the home list.
 */
export function ProjectNameDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  initialName = "",
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  initialName?: string
  onSubmit: (name: string) => void
}) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

  const trimmed = name.trim()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!trimmed) return
    onSubmit(trimmed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="For example: Commuting in the rain"
              autoFocus
              maxLength={120}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmed}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Creates a project with the given name and opens its page. */
export function NewProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  return (
    <ProjectNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New project"
      description="A project holds one problem and the solutions you find for it. Give it a name, then identify the problem it is about."
      confirmLabel="Create project"
      onSubmit={async (name) => {
        const project = await dispatch.projects.create({ name })
        router.push(projectRoutes.page(project.id))
      }}
    />
  )
}

/** What deleting a project takes with it. Shown wherever a project can be deleted. */
export const DELETE_PROJECT_COPY = {
  title: "Delete this project?",
  description: "This will permanently delete the project, its problem and every solution found for it.",
} as const

/**
 * Renames one project. The wording lives here so the home list and the
 * project page ask for it in the same words.
 */
export function RenameProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const dispatch = useDispatch<AppDispatch>()

  return (
    <ProjectNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rename project"
      description="Choose the name shown in the projects menu and on the home page."
      confirmLabel="Save"
      initialName={project?.name ?? ""}
      onSubmit={(name) => {
        if (project) dispatch.projects.update({ id: project.id, patch: { name } })
      }}
    />
  )
}
