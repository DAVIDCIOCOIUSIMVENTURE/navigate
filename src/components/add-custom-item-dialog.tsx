"use client"

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Users, MapPin, TriangleAlert, Compass, Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const DIMENSIONS: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; iconClass: string }[] = [
  { id: "customers", label: "Customer", icon: Users, iconClass: "text-emerald-500" },
  { id: "contexts", label: "Context", icon: MapPin, iconClass: "text-blue-500" },
  { id: "problems", label: "Problem", icon: TriangleAlert, iconClass: "text-rose-500" },
  { id: "you", label: "You", icon: Compass, iconClass: "text-amber-500" },
]

/**
 * Lets the user add a new custom item to one of the four dimensions
 * (Customer, Context, Problem, You). Items added under "You" appear in a
 * synthetic "Your items" group in the brainstorm canvas and on the
 * self-discovery "Other" page.
 *
 * On submit, mints a new id under the chosen column's user catalog and calls
 * `onCreated(columnId, id)` so the caller can auto-tick the new item.
 */
export function AddCustomItemDialog({
  open,
  onOpenChange,
  defaultColumnId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultColumnId?: string
  onCreated?: (columnId: string, id: string) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [columnId, setColumnId] = useState<string>(defaultColumnId ?? DIMENSIONS[0].id)
  const [label, setLabel] = useState("")

  useEffect(() => {
    if (open) {
      setColumnId(defaultColumnId ?? DIMENSIONS[0].id)
      setLabel("")
    }
  }, [open, defaultColumnId])

  const trimmed = label.trim()
  const dimension = DIMENSIONS.find((d) => d.id === columnId) ?? DIMENSIONS[0]

  const handleSubmit = async () => {
    if (!trimmed) return
    const item = await dispatch.customBrainstormItems.create({ columnId, label: trimmed })
    toast.success(`Added to ${dimension.label}: ${item.label}`)
    onCreated?.(columnId, item.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary shrink-0">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            Add your own item
          </DialogTitle>
          <DialogDescription>
            Pick the dimension this item belongs to and give it a label. It will appear under &ldquo;Your items&rdquo; in that column.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Dimension</label>
            <ToggleGroup
              type="single"
              value={columnId}
              onValueChange={(v) => { if (v) setColumnId(v) }}
              className="justify-start"
            >
              {DIMENSIONS.map((d) => {
                const Icon = d.icon
                return (
                  <ToggleGroupItem key={d.id} value={d.id} className="gap-1.5 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    <Icon className={cn("h-3.5 w-3.5", columnId === d.id ? "text-primary-foreground" : d.iconClass)} />
                    {d.label}
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="custom-item-label" className="text-sm font-medium">
              Label
            </label>
            <Input
              id="custom-item-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`e.g. Indie game devs`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && trimmed) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!trimmed}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
