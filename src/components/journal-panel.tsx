"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Note } from "@/store/notes-model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ArrowLeft, NotebookText, Plus, Trash2, X } from "lucide-react"

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

function NoteRow({
  note,
  onSelect,
  onDelete,
}: {
  note: Note
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="group flex items-start gap-2 rounded-md border bg-card p-3 cursor-pointer transition-colors hover:bg-accent/50"
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{notePreview(note)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatEditedAt(note.editedAt)}</p>
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

function NoteEditor({ note }: { note: Note }) {
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

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="text-base font-medium"
      />
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts here..."
        className="flex-1 min-h-0 resize-none"
      />
    </div>
  )
}

export function JournalPanel({ onClose }: { onClose: () => void }) {
  const allNotes = useSelector((state: RootState) => state.notes.notes)
  const dispatch = useDispatch<AppDispatch>()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const sortedNotes = useMemo(
    () => [...allNotes].sort((a, b) => b.editedAt.localeCompare(a.editedAt)),
    [allNotes]
  )

  const selectedNote = sortedNotes.find((n) => n.id === selectedId) ?? null

  const handleCreate = () => {
    const newNote = dispatch.notes.create()
    setSelectedId(newNote.id)
  }

  const handleDelete = (id: number) => {
    dispatch.notes.delete(id)
    if (selectedId === id) setSelectedId(null)
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
          <h2 className="text-sm font-semibold truncate">
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

      <div className="flex-1 min-h-0 overflow-hidden">
        {selectedNote ? (
          <div className="h-full p-4">
            <NoteEditor key={selectedNote.id} note={selectedNote} />
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 h-full px-6 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
              <NotebookText className="h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold">No entries yet</h3>
              <p className="text-xs text-muted-foreground">
                Capture thoughts as you work through each step.
              </p>
            </div>
            <Button onClick={handleCreate} size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New entry
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 h-full overflow-y-auto p-3">
            {sortedNotes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
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
