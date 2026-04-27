"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Lightbulb, ArrowRight, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchSolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchSolutionDialog({ open, onOpenChange }: SearchSolutionDialogProps) {
  const router = useRouter()

  function handleClose() {
    onOpenChange(false)
  }

  function handleDiscover() {
    handleClose()
    // Clear any previously-active problem so the user lands on Select a Problem.
    try {
      localStorage.removeItem("navigate-active-discovery-problem")
    } catch { /* ignore */ }
    router.push("/solutions/discover/select-problem")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            Search for a New Solution
          </DialogTitle>
          <DialogDescription>
            Choose how you&apos;d like to discover a new solution.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={handleDiscover}
            className="flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Solution Discovery</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                Pick a validated problem, refine your understanding, and generate solution candidates using creative techniques.
              </span>
            </div>
          </button>

          <button
            disabled
            className="flex items-start gap-4 rounded-lg border p-4 text-left opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Quick Capture</span>
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">Coming soon</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Already have an idea? Add it directly to the bank without going through the full discovery wizard.
              </span>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
