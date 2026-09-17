"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useDispatch } from "react-redux"
import { Plus, Trash2, Users } from "lucide-react"
import type { AppDispatch } from "@/store"
import type { Project, ProjectMember } from "@/store/projects-model"
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
import { MemberAvatar } from "@/components/member-avatar"
import { createProjectMember, hasMemberWithEmail, isEmailLike } from "@/lib/project-team"

/**
 * A project's settings: its name and the people it is shared with. Team
 * membership is mocked for now (there are no accounts yet), so a member is
 * only a name and an email kept on the project itself. Nothing is saved until
 * Save changes, so Cancel leaves the project as it was.
 */
export function ProjectSettingsDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [name, setName] = useState("")
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [memberName, setMemberName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Start each visit from what the project currently holds.
  useEffect(() => {
    if (!open || !project) return
    setName(project.name)
    setMembers(project.members)
    setMemberName("")
    setMemberEmail("")
    setError(null)
  }, [open, project])

  const trimmedName = name.trim()
  const canAdd = memberName.trim().length > 0 && isEmailLike(memberEmail)

  const addMember = () => {
    if (!canAdd) return
    if (hasMemberWithEmail(members, memberEmail)) {
      setError("Somebody with that email is already on the team.")
      return
    }
    setMembers((current) => [...current, createProjectMember(memberName, memberEmail)])
    setMemberName("")
    setMemberEmail("")
    setError(null)
  }

  const removeMember = (id: string) => {
    setMembers((current) => current.filter((member) => member.id !== id))
    setError(null)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!project || !trimmedName) return
    dispatch.projects.update({ id: project.id, patch: { name: trimmedName, members } })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Project settings</DialogTitle>
            <DialogDescription>
              Change what this project is called and who is working on it with you.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-settings-name">Project name</Label>
            <Input
              id="project-settings-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="For example: Commuting in the rain"
              autoFocus
              maxLength={120}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary-brand" />
              <h3 className="text-base font-semibold text-secondary-brand">Team ({members.length})</h3>
            </div>
            <p className="text-base">
              People you add here share this project: its problem, its solutions and everything you capture along the way.
            </p>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-base italic rounded-md border border-dashed px-3 py-4 text-center">
                  Nobody else yet. Add the first person below.
                </p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
                    <MemberAvatar member={member} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-base font-medium">{member.name}</span>
                      <span className="truncate text-base opacity-70">{member.email}</span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive-ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeMember(member.id)}
                      aria-label={`Remove ${member.name || member.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="project-member-name">Name</Label>
                  <Input
                    id="project-member-name"
                    value={memberName}
                    onChange={(event) => setMemberName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        addMember()
                      }
                    }}
                    placeholder="Jane Okonkwo"
                    maxLength={80}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="project-member-email">Email</Label>
                  <Input
                    id="project-member-email"
                    type="email"
                    value={memberEmail}
                    onChange={(event) => setMemberEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        addMember()
                      }
                    }}
                    placeholder="jane@example.com"
                    maxLength={120}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="secondary-brand"
                className="gap-2 self-start"
                onClick={addMember}
                disabled={!canAdd}
              >
                <Plus className="h-4 w-4" />
                Add to team
              </Button>
              {error && <p className="text-base text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmedName}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
