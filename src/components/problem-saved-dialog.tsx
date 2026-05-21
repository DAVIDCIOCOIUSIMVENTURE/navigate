"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ProblemSavedDialog({
  open,
  onOpenChange,
  problemId,
  onKeepIdentifying,
  keepIdentifyingLabel = "Keep Identifying Problems",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  problemId: number | null
  onKeepIdentifying?: () => void
  keepIdentifyingLabel?: string
}) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Problem Saved</DialogTitle>
          <DialogDescription>
            Your problem has been saved. What would you like to do next?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={() => {
              onOpenChange(false)
              if (problemId !== null) {
                router.push(`/problems/${problemId}/validation/introduction`)
              }
            }}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Continue to Problem Validation
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onKeepIdentifying?.()
            }}
          >
            {keepIdentifyingLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
