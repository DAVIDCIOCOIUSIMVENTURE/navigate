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
import { projectRoutes } from "@/lib/projects"

/**
 * Asks for a project name, for "New project" in the header and on the home
 * page. The name is required; it is what the project is called in the header
 * menu and the home list. Renaming an existing project happens in
 * `ProjectSettingsDialog` instead, alongside its team.
 */
function ProjectNameDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onSubmit: (name: string) => void
}) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (open) setName("")
  }, [open])

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
