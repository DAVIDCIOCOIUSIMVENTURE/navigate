import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Book } from "lucide-react"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useState, useEffect, useRef } from "react"

export function JournalDialog() {
  const [journalText, setJournalText] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const userId = "1"
  const journalId = "1"

  // Load the journal entry from the db when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch(`/journalEntry?id=${journalId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setJournalText(data[0].text || "")
            setTitle(data[0].title || "")
          } else {
            setJournalText("")
            setTitle("")
          }
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  // Save journal entry with debounce
  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      fetch(`/journalEntry/${journalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: journalId, title, text: journalText, userId })
      })
        .finally(() => setLoading(false))
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [journalText, title, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton>
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
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <Textarea
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            placeholder="Write your thoughts here..."
            className="mt-2"
            rows={5}
            required
          />
          {/* {loading && <div className="text-xs text-muted-foreground">Saving...</div>} */}
        </form>
      </DialogContent>
    </Dialog>
  )
} 