import type { ReactNode } from "react"
import type { Problem } from "@/store/problems-model"

export function ProblemContextCard({
  problem,
  children,
}: {
  problem: Problem | undefined
  children?: ReactNode
}) {
  if (!problem || (!problem.title && !problem.description && !children)) return null

  return (
    <div className="rounded-lg border-2 border-red-800/20 bg-red-800/5 p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold uppercase tracking-wide text-red-800">Problem Title</p>
        <p className="text-base font-medium">{problem.title || "Untitled problem"}</p>
      </div>
      {problem.description && (
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold uppercase tracking-wide text-red-800">Problem Description</p>
          <p className="text-base font-medium">{problem.description}</p>
        </div>
      )}
      {children}
    </div>
  )
}
