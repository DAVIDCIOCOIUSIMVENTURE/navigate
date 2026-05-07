"use client"

import { useDispatch } from "react-redux"
import { Textarea } from "@/components/ui/textarea"
import type { AppDispatch } from "@/store"
import { useProblem } from "@/app/(app)/problems/[problemRef]/validation/context"
import { DimensionPicker } from "@/components/dimension-picker"

/**
 * Editable surface for the core problem fields: description (textarea) plus the
 * three dimension chip lists (customer / context / problem). The customers,
 * contexts, and problems columns are rendered as chip pickers - dimensions only,
 * never free text - so the only typeable field on a problem is its description.
 */
export function CoreProblemStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const dispatch = useDispatch<AppDispatch>()
  const { problemId, problem } = useProblem()

  if (!problem) return null

  const update = (patch: Partial<{ description: string; customers: string[]; contexts: string[]; problems: string[] }>) => {
    dispatch.problems.update({ id: problemId, patch })
  }

  if (
    readOnly
    && !problem.description.trim()
    && problem.customers.length === 0
    && problem.contexts.length === 0
    && problem.problems.length === 0
  ) {
    return (
      <div className="bg-primary rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No core problem details captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-primary rounded-xl p-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="core-problem-description" className="text-sm font-medium text-white">
          Problem description
        </label>
        <Textarea
          id="core-problem-description"
          value={problem.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe the problem in one or two sentences..."
          rows={3}
          readOnly={readOnly}
          className="text-base bg-white border-white text-foreground read-only:cursor-default"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-lg bg-white/95 p-4">
        <DimensionPicker
          columnId="customers"
          ids={problem.customers}
          onChange={(ids) => update({ customers: ids })}
          label="Customer"
          readOnly={readOnly}
        />
        <DimensionPicker
          columnId="contexts"
          ids={problem.contexts}
          onChange={(ids) => update({ contexts: ids })}
          label="Context"
          readOnly={readOnly}
        />
        <DimensionPicker
          columnId="problems"
          ids={problem.problems}
          onChange={(ids) => update({ problems: ids })}
          label="Problem"
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
