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
import { useProjectIdForProblem } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"

/**
 * Shown by every identify tool once a problem is saved. A project holds one
 * problem, so identifying is finished at this point and the only way on is
 * to explore the problem.
 */
export function ProblemSavedDialog({
  open,
  onOpenChange,
  problemId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  problemId: number | null
}) {
  const router = useRouter()
  const projectId = useProjectIdForProblem(problemId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Problem Saved</DialogTitle>
          <DialogDescription>
            You have found your project&apos;s problem. Next you will explore it: who has it, when it shows up, how people cope today and what they are trying to achieve.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={() => {
              onOpenChange(false)
              if (problemId !== null) {
                router.push(projectRoutes.explore(projectId))
              }
            }}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Explore the Problem
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
