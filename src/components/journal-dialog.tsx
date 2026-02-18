"use client"

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CURRENT_USER_ID } from "@/lib/config"
import { Textarea } from "@/components/ui/textarea"
import { Book } from "lucide-react"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"

const JOURNAL_ID = "1"

export function JournalDialog() {
  const title = useSelector((state: RootState) => state.journal.title)
  const text = useSelector((state: RootState) => state.journal.text)
  const open = useSelector((state: RootState) => state.journal.open)
  const dispatch = useDispatch<AppDispatch>()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load entry when dialog opens
  useEffect(() => {
    if (open) {
      dispatch.journal.load(JOURNAL_ID)
    }
  }, [open])

  // Auto-save with debounce whenever title or text changes (while open)
  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      dispatch.journal.save({ journalId: JOURNAL_ID, title, text, userId: CURRENT_USER_ID })
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [title, text, open])

  return (
    <Dialog open={open} onOpenChange={(val) => dispatch.journal.setOpen(val)}>
      <DialogTrigger asChild>
        <SidebarMenuButton className="hover:bg-accent/50 transition-colors">
          <div className="flex items-center justify-center w-6 h-6 rounded-md">
            <Book className="h-4 w-4" />
          </div>
          <span>Journal</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Journal Entry</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <input
            className="w-full border rounded px-2 py-1"
            value={title}
            onChange={e => dispatch.journal.setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <Textarea
            value={text}
            onChange={e => dispatch.journal.setText(e.target.value)}
            placeholder="Write your thoughts here..."
            className="mt-2"
            rows={5}
            required
          />
        </form>
      </DialogContent>
    </Dialog>
  )
} 