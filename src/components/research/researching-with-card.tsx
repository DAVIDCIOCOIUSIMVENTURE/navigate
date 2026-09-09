"use client"

import { ContextCard, CONTEXT_HIGHLIGHT_CLASS } from "@/components/context-card"
import { useResearch } from "@/components/research/research-context"

/**
 * Compact amber card naming the research tool picked for the current Research
 * session, linking out to it. Rendered in the Research stepper rail above the
 * Reset button; renders nothing until a tool has been chosen. Must sit inside
 * a `ResearchProvider`.
 */
export function ResearchingWithCard() {
  const { method, toolId } = useResearch()
  const selectedTool = method.tools.find((t) => t.id === toolId) ?? null

  if (!selectedTool) return null

  return (
    <ContextCard
      label="Researching with"
      icon={method.icon}
      title={
        <a
          href={selectedTool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {selectedTool.name}
        </a>
      }
      className={CONTEXT_HIGHLIGHT_CLASS}
      compact
    />
  )
}
