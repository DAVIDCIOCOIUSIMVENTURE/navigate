"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Pencil, Trash2, X } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  questionUrls: string[]
}

/**
 * Lists the user's self-discovery items for one or more `questionUrl`s and
 * lets them rename or delete each one. Mirrors the inline-edit pattern from
 * `ManageCustomItemsDialog`.
 */
export function EditSelfDiscoveryItemsDialog({
  open,
  onOpenChange,
  title,
  description,
  questionUrls,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) =>
    s.selfDiscoveryItems.items.filter((i) => questionUrls.includes(i.questionUrl))
  )
  const problems = useSelector((s: RootState) => s.problems.problems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [pendingDelete, setPendingDelete] = useState<SelfDiscoveryItem | null>(null)

  useEffect(() => {
    if (!open) {
      setEditingId(null)
      setDraft("")
      setPendingDelete(null)
    }
  }, [open])

  const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title))

  const beginEdit = (item: SelfDiscoveryItem) => {
    setEditingId(item.id)
    setDraft(item.title)
  }
  const cancelEdit = () => {
    setEditingId(null)
    setDraft("")
  }
  const commitEdit = () => {
    if (!editingId) return
    const trimmed = draft.trim()
    if (!trimmed) return
    dispatch.selfDiscoveryItems.updateItem({ id: editingId, title: trimmed })
    setEditingId(null)
    setDraft("")
  }

  const referencingProblemsCount = pendingDelete
    ? problems.filter((p) => p.you?.includes(pendingDelete.id)).length
    : 0

  const confirmDelete = () => {
    if (!pendingDelete) return
    dispatch.selfDiscoveryItems.removeItem(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2 max-h-[60svh] overflow-y-auto">
            {sortedItems.length === 0 ? (
              <p className="text-base italic">
                Nothing saved here yet. Use &ldquo;Add your own&rdquo; to add an item.
              </p>
            ) : (
              sortedItems.map((item) => {
                const isEditing = editingId === item.id
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-md border px-2 py-1.5"
                  >
                    {isEditing ? (
                      <>
                        <Input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              commitEdit()
                            }
                            if (e.key === "Escape") {
                              e.preventDefault()
                              cancelEdit()
                            }
                          }}
                          autoFocus
                          className="h-7 text-base flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={commitEdit}
                          aria-label="Save"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={cancelEdit}
                          aria-label="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-base">{item.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => beginEdit(item)}
                          aria-label="Rename"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive"
                          onClick={() => setPendingDelete(item)}
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

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              {referencingProblemsCount > 0
                ? `This item is referenced by ${referencingProblemsCount} saved problem${referencingProblemsCount === 1 ? "" : "s"}. Those problems will keep the reference and show "(deleted item)" in its place. This cannot be undone.`
                : "Are you sure you want to delete this item? This cannot be undone."}
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
