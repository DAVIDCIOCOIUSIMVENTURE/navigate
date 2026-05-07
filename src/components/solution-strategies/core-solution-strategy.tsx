"use client"

import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSolution } from "@/app/(app)/solutions/[solutionId]/validate/context"

/**
 * Editable surface for the solution's title and description, the only
 * free-text fields on a Solution. Renders on the solution hub.
 */
export function CoreSolutionStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const dispatch = useDispatch<AppDispatch>()
  const { solutionId, solution } = useSolution()

  if (!solution) return null

  if (readOnly && !solution.title.trim() && !solution.description.trim()) {
    return (
      <div className="bg-primary rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No solution details captured.</p>
      </div>
    )
  }

  const update = (patch: Partial<{ title: string; description: string }>) => {
    dispatch.solutions.update({ id: solutionId, patch })
  }

  return (
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="core-solution-title" className="text-sm font-medium text-white">
          Title
        </label>
        <Input
          id="core-solution-title"
          value={solution.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Give your solution a short, memorable name..."
          readOnly={readOnly}
          className="text-base bg-white border-white text-foreground read-only:cursor-default"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="core-solution-description" className="text-sm font-medium text-white">
          Description
        </label>
        <Textarea
          id="core-solution-description"
          value={solution.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe how this solution works and why it addresses the problem..."
          rows={4}
          readOnly={readOnly}
          className="text-base bg-white border-white text-foreground read-only:cursor-default"
        />
      </div>
    </div>
  )
}
