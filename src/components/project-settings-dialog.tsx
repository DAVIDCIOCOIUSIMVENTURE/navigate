"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useDispatch, useStore } from "react-redux"
import { toast } from "sonner"
import { ArrowDownToLine, ArrowUpFromLine, Check, Copy, Globe, Plus, Trash2, Users } from "lucide-react"
import type { AppDispatch, RootState } from "@/store"
import type { Project, ProjectMember, ProjectVisibility } from "@/store/projects-model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MemberAvatar } from "@/components/member-avatar"
import { DELETE_PROJECT_COPY } from "@/components/project-name-dialog"
import { createProjectMember, hasMemberWithEmail, isEmailLike } from "@/lib/project-team"
import { projectRoutes } from "@/lib/projects"
import {
  BundleParseError,
  downloadProjectBundle,
  importProblemBundle,
  importSummary,
  parseProblemBundle,
} from "@/lib/problem-export"

/**
 * A project's settings: its name, the people it is shared with, whether its
 * preview page is public, and the way to delete it. Team membership is mocked
 * for now (there are no accounts yet), so a member is only a name and an email
 * kept on the project itself. Nothing is saved until Save changes, so Cancel
 * leaves the project as it was; Delete is the exception and acts once
 * confirmed. `onDeleted` lets a caller move on afterwards (the project page
 * goes Home).
 */
export function ProjectSettingsDialog({
  project,
  open,
  onOpenChange,
  onDeleted,
}: {
  project: Project | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called once the project has been deleted, after the dialog closes. */
  onDeleted?: (projectId: number) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [name, setName] = useState("")
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [memberName, setMemberName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [visibility, setVisibility] = useState<ProjectVisibility>("private")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Start each visit from what the project currently holds.
  useEffect(() => {
    if (!open || !project) return
    setName(project.name)
    setMembers(project.members)
    setVisibility(project.visibility)
    setMemberName("")
    setMemberEmail("")
    setCopied(false)
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

  const previewUrl =
    project && typeof window !== "undefined"
      ? `${window.location.origin}${projectRoutes.preview(project.id)}`
      : ""

  const copyPreviewLink = async () => {
    if (!previewUrl) return
    try {
      await navigator.clipboard.writeText(previewUrl)
      setCopied(true)
    } catch {
      // Clipboard access can be refused; the link is on screen to copy by hand.
      setError("The link could not be copied. Select it and copy it by hand.")
    }
  }

  // Export writes the project as it is saved, so anything typed in this dialog
  // and not yet saved is deliberately left out of the file.
  const handleExport = () => {
    if (!project) return
    if (downloadProjectBundle(store.getState(), project.id)) {
      toast.success("Project exported.")
    } else {
      toast.error("Could not export this project.")
    }
  }

  // Importing never touches this project: the file always arrives as a new one,
  // and the page stays where it is rather than opening it.
  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setImporting(true)
    try {
      const result = await importProblemBundle(parseProblemBundle(await file.text()), dispatch)
      toast.success(importSummary(result))
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof BundleParseError ? err.message :
        err instanceof Error ? err.message :
        "Failed to import the file."
      toast.error(message)
    } finally {
      setImporting(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!project || !trimmedName) return
    dispatch.projects.update({ id: project.id, patch: { name: trimmedName, members, visibility } })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {/* Kept outside the form so picking a file can never submit it. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Project settings</DialogTitle>
            <DialogDescription>
              Change what this project is called, who is working on it with you, and who may read it.
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-secondary-brand" />
              <h3 className="text-base font-semibold text-secondary-brand">Sharing</h3>
            </div>
            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="project-visibility" className="text-base">
                  Share a public preview
                </Label>
                <p className="text-base">
                  Anyone holding the link can read the preview page: the problem, the evidence behind it and the
                  solutions. They need no account and no licence. The project itself stays yours to edit.
                </p>
              </div>
              <Switch
                id="project-visibility"
                checked={visibility === "public"}
                onCheckedChange={(checked) => setVisibility(checked ? "public" : "private")}
              />
            </div>
            {visibility === "public" && previewUrl && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <span className="min-w-0 flex-1 truncate text-base">{previewUrl}</span>
                <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={copyPreviewLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-secondary-brand" />
              <h3 className="text-base font-semibold text-secondary-brand">Export and import</h3>
            </div>
            <p className="text-base">
              An exported file holds the whole project: its problem, every solution found for it, the team, and the work
              captured along the way. Importing one always creates a new project, so this project is never overwritten.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="gap-2" onClick={handleExport} disabled={!project}>
                <ArrowDownToLine className="h-4 w-4" />
                Export this project
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                <ArrowUpFromLine className="h-4 w-4" />
                {importing ? "Importing..." : "Import a project"}
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-between sm:space-x-0">
            <ConfirmDialog
              trigger={
                <Button type="button" variant="destructive-outline" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete project
                </Button>
              }
              title={DELETE_PROJECT_COPY.title}
              description={DELETE_PROJECT_COPY.description}
              onConfirm={async () => {
                if (!project) return
                const deletedId = project.id
                await dispatch.projects.delete(deletedId)
                onOpenChange(false)
                onDeleted?.(deletedId)
              }}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!trimmedName}>
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
