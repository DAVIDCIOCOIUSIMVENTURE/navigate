"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Note } from "@/store/notes-model"
import type { Project } from "@/store/projects-model"
import { projectIdFromPathname, projectLabel } from "@/lib/projects"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ArrowLeft, FolderKanban, NotebookText, Plus, Trash2, X } from "lucide-react"

/** The Select needs a non-empty string for "no project"; this is it. */
const NO_PROJECT = "none"

type NoteFilter = "all" | "project"

function formatEditedAt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

function notePreview(note: Note) {
  const title = note.title.trim()
  if (title) return title
  const snippet = note.text.trim().split("\n")[0]?.slice(0, 40)
  return snippet || "Untitled note"
}

/** The cobalt pill naming the project a note is linked to. */
function ProjectPill({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full bg-secondary-brand/10 px-2.5 py-0.5 text-base text-secondary-brand",
        className,
      )}
    >
      <FolderKanban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  )
}

function NoteRow({
  note,
  projectName,
  onSelect,
  onDelete,
}: {
  note: Note
  /** The linked project's name, or null when the note is general. */
  projectName: string | null
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="group flex items-start gap-2 rounded-md border bg-card p-3 cursor-pointer transition-colors hover:bg-accent/50"
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-base font-medium truncate">{notePreview(note)}</p>
        <p className="text-base">{formatEditedAt(note.editedAt)}</p>
        {projectName !== null && <ProjectPill label={projectName} className="self-start" />}
      </div>
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
        title="Delete this note?"
        description="This note will be permanently removed. This action cannot be undone."
        onConfirm={onDelete}
      />
    </div>
  )
}

function NoteEditor({
  note,
  projectOptions,
}: {
  note: Note
  /** Every project the note may be linked to, with the name to show for it. */
  projectOptions: { id: number; label: string }[]
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [title, setTitle] = useState(note.title)
  const [text, setText] = useState(note.text)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTitle(note.title)
    setText(note.text)
  }, [note.id, note.title, note.text])

  useEffect(() => {
    if (title === note.title && text === note.text) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      dispatch.notes.update({ id: note.id, patch: { title, text } })
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [title, text, note.id, note.title, note.text, dispatch.notes])

  // A link to a project that no longer exists reads as no link.
  const linkedValue =
    note.projectId !== null && projectOptions.some((p) => p.id === note.projectId)
      ? String(note.projectId)
      : NO_PROJECT

  const handleLinkChange = (value: string) => {
    const projectId = value === NO_PROJECT ? null : Number(value)
    dispatch.notes.update({ id: note.id, patch: { projectId } })
  }

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="text-base font-medium"
      />
      <div className="flex items-center gap-2">
        <Label htmlFor="journal-note-project" className="shrink-0 text-base">
          Linked to
        </Label>
        <Select value={linkedValue} onValueChange={handleLinkChange}>
          <SelectTrigger id="journal-note-project" className="h-9 min-w-0 flex-1 text-base">
            <SelectValue placeholder="No project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PROJECT}>No project</SelectItem>
            {projectOptions.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts here..."
        className="flex-1 min-h-0 resize-none"
      />
    </div>
  )
}

/** The two ways to read the journal while inside a project: everything, or only what is linked to it. */
function FilterChips({
  value,
  counts,
  onChange,
}: {
  value: NoteFilter
  counts: Record<NoteFilter, number>
  onChange: (value: NoteFilter) => void
}) {
  const chip = (id: NoteFilter, label: string) => {
    const active = value === id
    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => onChange(id)}
        className={cn(
          "rounded-full border px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active
            ? "border-secondary-brand bg-secondary-brand/10 text-secondary-brand font-medium"
            : "border-transparent hover:bg-accent/50",
        )}
      >
        {label} ({counts[id]})
      </button>
    )
  }
  return (
    <div role="radiogroup" aria-label="Which notes to show" className="flex flex-wrap gap-1 border-b px-3 py-2">
      {chip("all", "All notes")}
      {chip("project", "This project")}
    </div>
  )
}

export function JournalPanel({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const allNotes = useSelector((state: RootState) => state.notes.notes)
  const projects = useSelector((state: RootState) => state.projects.projects)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const dispatch = useDispatch<AppDispatch>()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<NoteFilter>("all")

  // The project the user is inside, if any. Outside a project every note shows and new notes are general.
  const routeProjectId = projectIdFromPathname(pathname ?? "")
  const currentProject: Project | undefined = projects.find((p) => p.id === routeProjectId)
  const currentProjectId = currentProject?.id ?? null
  const activeFilter: NoteFilter = currentProjectId === null ? "all" : filter

  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p.id, label: projectLabel(p, problems) })),
    [projects, problems],
  )
  const projectNameById = useMemo(
    () => new Map(projectOptions.map((p) => [p.id, p.label] as const)),
    [projectOptions],
  )

  const sortedNotes = useMemo(
    () => [...allNotes].sort((a, b) => b.editedAt.localeCompare(a.editedAt)),
    [allNotes]
  )
  const projectNotes = useMemo(
    () => (currentProjectId === null ? [] : sortedNotes.filter((n) => n.projectId === currentProjectId)),
    [sortedNotes, currentProjectId],
  )
  const visibleNotes = activeFilter === "project" ? projectNotes : sortedNotes

  const selectedNote = sortedNotes.find((n) => n.id === selectedId) ?? null

  const handleCreate = () => {
    const newNote = dispatch.notes.create({ projectId: currentProjectId })
    setSelectedId(newNote.id)
  }

  const handleDelete = (id: number) => {
    dispatch.notes.delete(id)
    if (selectedId === id) setSelectedId(null)
  }

  const emptyCopy =
    activeFilter === "project"
      ? {
          title: "No notes for this project yet",
          body: "Notes you write here are linked to the project, so you can find them again from any page.",
          action: "New note",
        }
      : {
          title: "No entries yet",
          body: "Capture thoughts as you work through each step.",
          action: "New entry",
        }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {selectedNote ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSelectedId(null)}
              aria-label="Back to notes"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
              <NotebookText className="h-4 w-4 text-primary" />
            </div>
          )}
          <h2 className="text-base font-semibold truncate">
            {selectedNote ? "Edit note" : "Journal"}
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!selectedNote && (
            <Button onClick={handleCreate} size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close journal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!selectedNote && currentProjectId !== null && (
        <FilterChips
          value={activeFilter}
          counts={{ all: sortedNotes.length, project: projectNotes.length }}
          onChange={setFilter}
        />
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {selectedNote ? (
          <div className="h-full p-4">
            <NoteEditor key={selectedNote.id} note={selectedNote} projectOptions={projectOptions} />
          </div>
        ) : visibleNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 h-full px-6 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
              <NotebookText className="h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold">{emptyCopy.title}</h3>
              <p className="text-base">{emptyCopy.body}</p>
            </div>
            <Button onClick={handleCreate} size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {emptyCopy.action}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 h-full overflow-y-auto p-3">
            {visibleNotes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                projectName={note.projectId === null ? null : (projectNameById.get(note.projectId) ?? null)}
                onSelect={() => setSelectedId(note.id)}
                onDelete={() => handleDelete(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
