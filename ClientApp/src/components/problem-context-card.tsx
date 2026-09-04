import type { Problem } from "@/store/problems-model"

export function ProblemContextCard({ problem }: { problem: Problem | undefined }) {
  if (!problem) return null

  return (
    <div className="rounded-lg bg-red-800 p-4 flex flex-col gap-1 text-white">
      <p className="text-base font-semibold uppercase tracking-wide">Problem</p>
      <p className="text-base font-medium">{problem.title || "Untitled problem"}</p>
    </div>
  )
}
