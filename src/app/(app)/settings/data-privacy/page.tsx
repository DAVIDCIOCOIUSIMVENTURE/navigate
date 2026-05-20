"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useState } from "react"
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

type StorageGroup = {
  id: string
  label: string
  description: string
  keys: string[]
}

// Each entry maps a user-facing category to the localStorage keys it owns.
// Add new groups here when introducing new persisted state.
const STORAGE_GROUPS: StorageGroup[] = [
  {
    id: "problems",
    label: "Problems",
    description: "Problems you've added, including descriptions, dimensions, and validation work.",
    keys: ["navigate-problems"],
  },
  {
    id: "self-discovery-items",
    label: "Self-discovery items",
    description: "Items captured during self-discovery; these power the You dimension in Identify Problems.",
    keys: ["navigate-self-discovery-items"],
  },
  {
    id: "custom-dimension-items",
    label: "Custom dimension items",
    description: "Customer / Context / Problem items you've added yourself in Identify Problems.",
    keys: ["navigate-custom-dimension-items"],
  },
  {
    id: "solutions",
    label: "Solutions",
    description: "Solution candidates and their validation results.",
    keys: ["navigate-solutions"],
  },
  {
    id: "solution-workspaces",
    label: "Solution refinement workspaces",
    description: "Per-problem refinement notes (root causes, 5 whys, affected groups) shared between problem validation and solution discovery.",
    keys: ["navigate-solution-workspaces", "navigate-active-discovery-problem"],
  },
  {
    id: "notes",
    label: "Notes",
    description: "Journal notes captured in the side panel.",
    keys: ["navigate-notes"],
  },
  {
    id: "account-settings",
    label: "Account settings",
    description: "Display name, email, theme, and notification preferences.",
    keys: ["navigate-account-settings"],
  },
  {
    id: "app-preferences",
    label: "App preferences",
    description: "Sidebar mode, problem builder draft, hidden columns, and other UI state.",
    keys: ["navigate-settings"],
  },
]

type PendingClear =
  | { kind: "group"; group: StorageGroup }
  | { kind: "all" }
  | null

function removeKeys(keys: string[]) {
  for (const key of keys) {
    localStorage.removeItem(key)
  }
}

function removeAllNavigateKeys() {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith("navigate-")) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

export default function DataPrivacySettingsPage() {
  const [pending, setPending] = useState<PendingClear>(null)

  const dialogTitle = pending?.kind === "all"
    ? "Clear all application data?"
    : pending?.kind === "group"
      ? `Clear ${pending.group.label.toLowerCase()}?`
      : ""

  const dialogDescription = pending?.kind === "all"
    ? "This will permanently delete every record this app has stored on this device, including problems, solutions, triggers, notes, and settings. This action cannot be undone."
    : pending?.kind === "group"
      ? `This will permanently delete ${pending.group.description.charAt(0).toLowerCase() + pending.group.description.slice(1)} This action cannot be undone.`
      : ""

  const confirmLabel = pending?.kind === "all"
    ? "Yes, clear everything"
    : pending?.kind === "group"
      ? `Yes, clear ${pending.group.label.toLowerCase()}`
      : ""

  const handleConfirm = () => {
    if (!pending) return
    if (pending.kind === "all") {
      removeAllNavigateKeys()
      toast.success("All application data has been cleared. Refreshing...")
    } else {
      removeKeys(pending.group.keys)
      toast.success(`${pending.group.label} cleared. Refreshing...`)
    }
    setPending(null)
    setTimeout(() => window.location.reload(), 800)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Data & Privacy</h1>
            <p className="text-muted-foreground">
              Control how your data is stored and used. Everything is kept locally on this device; clearing it removes it for good.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <Label>Clear data by category</Label>
            <p className="text-sm">
              Remove a single category at a time. The page will reload after each clear so the rest of your work stays intact.
            </p>
          </div>
          <div className="flex flex-col">
            {STORAGE_GROUPS.map((group, i) => (
              <div key={group.id}>
                {i > 0 && <Separator />}
                <div className="flex items-start justify-between gap-4 py-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-medium">{group.label}</p>
                    <p className="text-sm">{group.description}</p>
                  </div>
                  <Button
                    variant="destructive-outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setPending({ kind: "group", group })}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-destructive">Danger Zone</Label>
            <p className="text-sm">
              Permanently delete every record this app has stored on this device.
            </p>
          </div>
          <div>
            <Button
              variant="destructive"
              onClick={() => setPending({ kind: "all" })}
            >
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={pending !== null} onOpenChange={(open) => { if (!open) setPending(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={buttonVariants({ variant: "destructive" })}
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
