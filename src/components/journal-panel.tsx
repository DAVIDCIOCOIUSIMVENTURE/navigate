"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Note } from "@/store/notes-model"
import { projectLabel } from "@/lib/projects"
import {
  NO_PROJECT_KEY,
  SELF_DISCOVERY_LABEL,
  defaultNoteLink,
  describeNoteLink,
  isNoteInScope,
  isNoteLinkAvailable,
  journalScopeFromPathname,
  noteLinkFromParts,
  noteLinkParts,
  sectionOptions,
  type NoteLinkProject,
} from "@/lib/note-links"
import { plainTextFromMarkdown } from "@/lib/markdown-text"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ArrowLeft, Link2, NotebookText, Plus, Trash2, X } from "lucide-react"

type NoteFilter = "all" | "here"

/** A date and time as the journal shows them: "25 Sept 2026, 14:03". */
export function formatTimestamp(iso: string) {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function notePreview(note: Note) {
  const title = note.title.trim()
  if (title) return title
  const snippet = plainTextFromMarkdown(note.text).split("\n")[0]?.slice(0, 40)
  return snippet || "Untitled note"
}

/** The cobalt pill naming what a note is linked to. */
function LinkPill({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full bg-secondary-brand/10 px-2.5 py-0.5 text-base text-secondary-brand",
        className,
      )}
    >
      <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  )
}

/** When the note was written and last changed, on one line. */
function Timestamps({ note, className }: { note: Note; className?: string }) {
  return (
    <p className={cn("text-base", className)}>
      Created {formatTimestamp(note.createdAt)}
      <span aria-hidden="true"> · </span>
      Updated {formatTimestamp(note.editedAt)}
    </p>
  )
}

function NoteRow({
  note,
  linkLabel,
  onSelect,
  onDelete,
}: {
  note: Note
  /** What the note is linked to, or null when it is general. */
  linkLabel: string | null
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="group flex items-start gap-2 rounded-md border bg-card p-3 cursor-pointer transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-base font-medium truncate">{notePreview(note)}</p>
        <Timestamps note={note} />
        {linkLabel !== null && <LinkPill label={linkLabel} className="self-start" />}
      </div>
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Delete this note"
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
  linkProjects,
}: {
  note: Note
  /** Every project the note may be linked to, with its solutions. */
  linkProjects: NoteLinkProject[]
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

  // A link to a project or solution that no longer exists reads as general.
  const parts = noteLinkParts(isNoteLinkAvailable(note.link, linkProjects) ? note.link : { kind: "none" })
  const sections = sectionOptions(parts.project, linkProjects)

  const handleProjectChange = (project: string) => {
    // Moving to another project lands on its problem; leaving projects lands on General.
    dispatch.notes.update({ id: note.id, patch: { link: noteLinkFromParts({ project, section: "" }) } })
  }

  const handleSectionChange = (section: string) => {
    dispatch.notes.update({ id: note.id, patch: { link: noteLinkFromParts({ project: parts.project, section }) } })
  }

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        aria-label="Note title"
        className="text-base font-medium"
      />
      <div className="grid grid-cols-1 gap-2 @[360px]:grid-cols-2 @container">
        <div className="flex flex-col gap-1 min-w-0">
          <Label htmlFor="journal-note-project" className="text-base">
            Project
          </Label>
          <Select value={parts.project} onValueChange={handleProjectChange}>
            <SelectTrigger id="journal-note-project" className="h-9 min-w-0 text-base">
              <SelectValue placeholder="No project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PROJECT_KEY}>No project</SelectItem>
              {linkProjects.map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <Label htmlFor="journal-note-section" className="text-base">
            Section
          </Label>
          <Select value={parts.section} onValueChange={handleSectionChange}>
            <SelectTrigger id="journal-note-section" className="h-9 min-w-0 text-base">
              <SelectValue placeholder="General" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.value} value={section.value}>
                  {section.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Timestamps note={note} />
      <MarkdownEditor
        value={note.text}
        onChange={setText}
        placeholder="Write your thoughts here..."
        aria-label="Note text"
        className="flex-1"
      />
    </div>
  )
}

/** The two ways to read the journal while inside an area: everything, or only what was written about it. */
function FilterChips({
  value,
  hereLabel,
  counts,
  onChange,
}: {
  value: NoteFilter
  hereLabel: string
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
      {chip("here", hereLabel)}
    </div>
  )
}

/** Newest first. */
function sortNotes(notes: readonly Note[]): Note[] {
  return [...notes].sort((a, b) => b.editedAt.localeCompare(a.editedAt))
}

export function JournalPanel({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const allNotes = useSelector((state: RootState) => state.notes.notes)
  const projects = useSelector((state: RootState) => state.projects.projects)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const dispatch = useDispatch<AppDispatch>()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<NoteFilter>("all")

  // The area the user is in, if any. Outside one every note shows and new notes are general.
  const scope = journalScopeFromPathname(pathname ?? "")
  const activeFilter: NoteFilter = scope === null ? "all" : filter
  const hereLabel = scope?.kind === "self-discovery" ? SELF_DISCOVERY_LABEL : "This project"

  const linkProjects = useMemo<NoteLinkProject[]>(
    () =>
      projects.map((p) => ({
        id: p.id,
        label: projectLabel(p, problems),
        solutions:
          p.problemId === null
            ? []
            : solutions.filter((s) => s.problemId === p.problemId).map((s) => ({ id: s.id, title: s.title })),
      })),
    [projects, problems, solutions],
  )

  const sortedNotes = useMemo(() => sortNotes(allNotes), [allNotes])
  const hereNotes = useMemo(() => sortedNotes.filter((n) => isNoteInScope(n.link, scope)), [sortedNotes, scope])
  const visibleNotes = activeFilter === "here" ? hereNotes : sortedNotes

  const selectedNote = sortedNotes.find((n) => n.id === selectedId) ?? null

  const handleCreate = () => {
    const newNote = dispatch.notes.create({ link: defaultNoteLink(scope, linkProjects) })
    setSelectedId(newNote.id)
  }

  const handleDelete = (id: number) => {
    dispatch.notes.delete(id)
    if (selectedId === id) setSelectedId(null)
  }

  const emptyCopy =
    activeFilter === "here"
      ? {
          title: scope?.kind === "self-discovery" ? "No notes about Self Discovery yet" : "No notes for this project yet",
          body: "Notes you write here are linked to where you are, so you can find them again from any page.",
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

      {!selectedNote && scope !== null && (
        <FilterChips
          value={activeFilter}
          hereLabel={hereLabel}
          counts={{ all: sortedNotes.length, here: hereNotes.length }}
          onChange={setFilter}
        />
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {selectedNote ? (
          <div className="h-full p-4">
            <NoteEditor key={selectedNote.id} note={selectedNote} linkProjects={linkProjects} />
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
                linkLabel={describeNoteLink(note.link, linkProjects)}
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
