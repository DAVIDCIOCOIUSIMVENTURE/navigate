"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EditableLeafItemProps {
  item: { id: string; label: string }
  isChecked: boolean
  onToggle: () => void
  customColumnId?: string
}

export function EditableLeafItem({
  item,
  isChecked,
  onToggle,
  customColumnId,
}: EditableLeafItemProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(item.label)

  const beginEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraft(item.label)
    setIsEditing(true)
  }

  const commit = () => {
    const trimmed = draft.trim()
    if (customColumnId && trimmed && trimmed !== item.label) {
      dispatch.customBrainstormItems.renameItem({
        columnId: customColumnId,
        id: item.id,
        label: trimmed,
      })
    }
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft(item.label)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2.5 px-1 py-1.5">
        <Checkbox
          checked={isChecked}
          onCheckedChange={onToggle}
          className="border-secondary-brand data-[state=checked]:bg-secondary-brand data-[state=checked]:text-secondary-brand-foreground"
        />
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit() }
            if (e.key === "Escape") { e.preventDefault(); cancel() }
          }}
          onBlur={commit}
          className="h-7 text-sm flex-1"
        />
      </div>
    )
  }

  const isCustom = customColumnId !== undefined

  return (
    <div className="group flex items-center gap-2.5 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors">
      <label className="flex flex-1 min-w-0 items-center gap-2.5 cursor-pointer">
        <Checkbox
          checked={isChecked}
          onCheckedChange={onToggle}
          className="border-secondary-brand data-[state=checked]:bg-secondary-brand data-[state=checked]:text-secondary-brand-foreground"
        />
        <span className={cn(
          "text-sm text-foreground select-none",
          isChecked && "font-medium"
        )}>
          {item.label}
        </span>
      </label>
      {isCustom && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={beginEdit}
          aria-label={`Edit ${item.label}`}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
