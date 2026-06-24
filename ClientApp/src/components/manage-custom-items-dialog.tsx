"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Check, X } from "lucide-react"

/**
 * List, rename, and delete the user's custom items for a single column.
 * Built-in items are NOT shown here: they're authored in dimensionData.ts and
 * not user-editable.
 */
export function ManageCustomItemsDialog({
  open,
  onOpenChange,
  columnId,
  columnTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnId: string
  columnTitle: string
}) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) => s.customDimensionItems.byColumn[columnId] ?? [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftLabel, setDraftLabel] = useState("")
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const beginEdit = (id: string, currentLabel: string) => {
    setEditingId(id)
    setDraftLabel(currentLabel)
  }
  const cancelEdit = () => {
    setEditingId(null)
    setDraftLabel("")
  }
  const commitEdit = () => {
    if (!editingId) return
    const trimmed = draftLabel.trim()
    if (!trimmed) return
    dispatch.customDimensionItems.renameItem({ columnId, id: editingId, label: trimmed })
    setEditingId(null)
    setDraftLabel("")
  }

  const confirmDelete = () => {
    if (!pendingDeleteId) return
    dispatch.customDimensionItems.removeItem({ columnId, id: pendingDeleteId })
    setPendingDeleteId(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your {columnTitle} items</DialogTitle>
            <DialogDescription>
              Rename or remove items you&apos;ve added. Removing an item leaves saved Problems intact; they&apos;ll show &ldquo;(deleted item)&rdquo; for it until edited.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2">
            {items.length === 0 ? (
              <p className="text-sm italic">
                You haven&apos;t added any custom {columnTitle.toLowerCase()} items yet.
              </p>
            ) : (
              items.map((item) => {
                const isEditing = editingId === item.id
                return (
                  <div key={item.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                    {isEditing ? (
                      <>
                        <Input
                          value={draftLabel}
                          onChange={(e) => setDraftLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); commitEdit() }
                            if (e.key === "Escape") { e.preventDefault(); cancelEdit() }
                          }}
                          autoFocus
                          className="h-7 text-sm flex-1"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={commitEdit} aria-label="Save">
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit} aria-label="Cancel">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{item.label}</span>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => beginEdit(item.id, item.label)}
                          aria-label="Rename"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setPendingDeleteId(item.id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingDeleteId !== null} onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              Saved Problems that reference this item will keep its id and show &ldquo;(deleted item)&rdquo; in its place. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={buttonVariants({ variant: "destructive" })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
