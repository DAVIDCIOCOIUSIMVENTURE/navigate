"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Note } from "@/store/notes-model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { NotebookText, Plus, Trash2 } from "lucide-react"

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
  selected,
  onSelect,
  onDelete,
}: {
  note: Note
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`group flex items-start gap-2 rounded-md border p-3 cursor-pointer transition-colors ${
        selected ? "bg-accent border-accent-foreground/20" : "bg-card hover:bg-accent/50"
      }`}
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
    <div className="flex flex-col gap-3 h-full">
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
        className="flex-1 min-h-[200px] resize-none"
      />
    </div>
  )
}

export default function NotesPage() {
  const allNotes = useSelector((state: RootState) => state.notes.notes)
  const dispatch = useDispatch<AppDispatch>()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const sortedNotes = useMemo(
    () => [...allNotes].sort((a, b) => b.editedAt.localeCompare(a.editedAt)),
    [allNotes]
  )

  useEffect(() => {
    if (sortedNotes.length === 0) {
      if (selectedId !== null) setSelectedId(null)
      return
    }
    if (selectedId === null || !sortedNotes.some((n) => n.id === selectedId)) {
      setSelectedId(sortedNotes[0].id)
    }
  }, [sortedNotes, selectedId])

  const selectedNote = sortedNotes.find((n) => n.id === selectedId) ?? null

  const handleCreate = () => {
    const newNote = dispatch.notes.create()
    setSelectedId(newNote.id)
  }

  const handleDelete = (id: number) => {
    dispatch.notes.delete(id)
  }

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 shrink-0">
            <NotebookText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Notes</h1>
            <p className="text-sm text-muted-foreground">
              Capture thoughts, observations, and ideas across your innovation process.
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </div>

      {sortedNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <NotebookText className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center flex flex-col gap-2 max-w-sm">
              <h2 className="text-lg font-semibold">No notes yet</h2>
              <p className="text-sm text-muted-foreground">
                Create your first note to start capturing your thoughts.
              </p>
            </div>
            <Button onClick={handleCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              New note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 flex-1 min-h-0">
          <Card className="flex flex-col min-h-0">
            <CardContent className="flex flex-col gap-2 p-3 overflow-y-auto">
              {sortedNotes.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  selected={note.id === selectedId}
                  onSelect={() => setSelectedId(note.id)}
                  onDelete={() => handleDelete(note.id)}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="flex flex-col min-h-0">
            <CardContent className="flex-1 p-4 min-h-0">
              {selectedNote ? (
                <NoteEditor key={selectedNote.id} note={selectedNote} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Select a note to edit
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
